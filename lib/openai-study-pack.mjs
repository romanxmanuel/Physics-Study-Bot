import { Buffer } from 'node:buffer';

import { STUDY_PACK_SCHEMA, normalizeStudyPack } from './study-pack-schema.mjs';

const DEFAULT_MODEL = process.env.OPENAI_STUDY_MODEL || 'gpt-4o-mini';
const MAX_CONTEXT_CHARS = 48000;
const MIN_DESIRED_QUESTION_COUNT = 24;
const TARGET_QUESTION_COUNT = 36;
const GENERIC_KEYWORD_SCOPES = [
  ['join', 'Joins'],
  ['joins', 'Joins'],
  ['aggregate', 'Aggregate Functions'],
  ['group by', 'Grouping'],
  ['having', 'Having Clause'],
  ['ddl', 'DDL'],
  ['create table', 'DDL'],
  ['alter table', 'DDL'],
  ['drop table', 'DDL'],
  ['primary key', 'Keys and Constraints'],
  ['foreign key', 'Keys and Constraints'],
  ['constraint', 'Keys and Constraints'],
  ['sql', 'SQL'],
  ['subquery', 'Subqueries'],
  ['advanced sql', 'Advanced SQL'],
  ['normalization', 'Normalization'],
  ['index', 'Indexes'],
  ['trigger', 'Triggers'],
  ['procedure', 'Stored Procedures'],
  ['view', 'Views'],
  ["ohm's law", "Ohm's Law"],
  ['resistivity', 'Resistivity'],
  ['kirchhoff', "Kirchhoff's Rules"],
  ['capacitor', 'Capacitors'],
  ['time constant', 'Time Constant'],
];

function uniq(items) {
  return [...new Set(items.filter(Boolean))];
}

function trimSnippet(text, maxChars = 12000) {
  return String(text || '').trim().slice(0, maxChars);
}

function buildDataUrl(file) {
  const base64 = Buffer.from(file.buffer).toString('base64');
  return `data:${file.mimeType};base64,${base64}`;
}

function maybePushScope(scopes, value) {
  const clean = String(value || '').trim();
  if (clean) scopes.push(clean);
}

function titleCasePhrase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/^[A-Z]{2,5}$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function inferScopeFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  const stripped = base
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\d+[a-z]?\b/gi, ' ')
    .replace(/\bpractice\b/gi, ' Practice')
    .replace(/\s+/g, ' ')
    .trim();

  if (!stripped) return '';
  return titleCasePhrase(stripped);
}

export function detectScopes({ files = [], examContext = '' } = {}) {
  const scopes = [];
  const combinedText = [examContext, ...files.map((file) => `${file.name}\n${file.extractedText || ''}`)]
    .join('\n')
    .toLowerCase();

  const chapterRegex = /\b(?:chapter|chap|ch)\.?\s*(\d{1,2})\b/gi;
  for (const match of combinedText.matchAll(chapterRegex)) {
    maybePushScope(scopes, `Chapter ${match[1]}`);
  }

  GENERIC_KEYWORD_SCOPES.forEach(([keyword, label]) => {
    if (combinedText.includes(keyword)) scopes.push(label);
  });

  files.forEach((file) => {
    const filename = file.name.toLowerCase();
    maybePushScope(scopes, inferScopeFromFilename(file.name));
    if (filename.includes('exam')) scopes.push('Exam Review');
    if (filename.includes('formula')) scopes.push('Formula Sheet');
  });

  return uniq(scopes).slice(0, 12);
}

function collectTextExcerpts(files) {
  const chunks = [];
  let used = 0;

  for (const file of files) {
    if (!file.extractedText) continue;
    const roomLeft = MAX_CONTEXT_CHARS - used;
    if (roomLeft <= 0) break;
    const excerpt = trimSnippet(file.extractedText, Math.min(14000, roomLeft));
    if (!excerpt) continue;
    chunks.push(`FILE: ${file.name}\nTYPE: ${file.kind}\nCONTENT:\n${excerpt}`);
    used += excerpt.length;
  }

  return chunks.join('\n\n---\n\n');
}

function buildUploadedSources(files) {
  return files.map((file) => ({
    label: file.name,
    type: file.kind,
    detail: file.extractedText
      ? `Uploaded course material (${Math.min(file.extractedText.length, 99999)} text chars extracted).`
      : file.buffer
        ? 'Uploaded course material attached to the model request.'
        : (file.detail || 'Uploaded course material prepared for study-pack generation.'),
    url: '',
  }));
}

function buildModelInput(files, examContext, selectedScopes, detectedScopes, packName) {
  const content = [];
  const scopeList = selectedScopes.length ? selectedScopes : detectedScopes;
  const excerpts = collectTextExcerpts(files);

  content.push({
    type: 'input_text',
    text: [
      `Build a focused study pack from the uploaded class material.${packName ? ` Use this pack name if it fits naturally: ${packName}.` : ''}`,
      `Exam context: ${examContext || 'No extra exam context provided.'}`,
      `Selected scope: ${scopeList.length ? scopeList.join(', ') : 'Infer the most relevant chapter scope from the materials.'}`,
      'Use the uploaded files as the hard boundary and primary source of truth.',
      'Do not introduce any topic, term, technique, chapter, or advanced idea unless it is clearly present in the uploaded files or the exam context.',
      'Keep the pack narrow. Do not drift into chapters or topics outside the selected scope.',
      'Make the content engaging and challenging. Questions should feel exam-relevant, not trivial.',
      'Generate a large enough practice bank to avoid fast repetition. Aim for 32 to 48 multiple-choice questions when the material supports it.',
      'Vary the question types: direct recall, applied reasoning, debugging, compare-and-contrast, interpretation, and trap-answer discrimination.',
      excerpts ? `Extracted text excerpts:\n${excerpts}` : 'No extractable text was available from the uploads; inspect attached files directly where possible.',
    ].join('\n\n'),
  });

  files.forEach((file) => {
    if (file.kind === 'pdf' && file.buffer) {
      content.push({
        type: 'input_file',
        filename: file.name,
        file_data: buildDataUrl(file),
      });
      return;
    }

    if (file.kind === 'image' && file.buffer) {
      content.push({
        type: 'input_image',
        image_url: buildDataUrl(file),
        detail: 'auto',
      });
    }
  });

  return [
    {
      role: 'user',
      content,
    },
  ];
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text;
  }

  const parts = [];
  const messages = Array.isArray(payload?.output) ? payload.output : [];
  messages.forEach((message) => {
    if (message?.type !== 'message' || !Array.isArray(message.content)) return;
    message.content.forEach((item) => {
      if (item?.type === 'output_text' && typeof item.text === 'string') {
        parts.push(item.text);
      }
    });
  });

  return parts.join('\n').trim();
}

function collectWebSources(payload) {
  const seen = new Set();
  const sources = [];

  const visit = (node) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node !== 'object') return;

    if (Array.isArray(node.sources)) {
      node.sources.forEach((source) => {
        if (!source || !source.url) return;
        if (seen.has(source.url)) return;
        seen.add(source.url);
        sources.push({
          label: source.title || source.url,
          type: 'web',
          detail: 'Supporting web source gathered during scoped study-pack generation.',
          url: source.url,
        });
      });
    }

    Object.values(node).forEach(visit);
  };

  visit(payload?.output);
  return sources.slice(0, 8);
}

const QUESTION_EXPANSION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: STUDY_PACK_SCHEMA.properties.questions,
  },
};

async function expandQuestionBank({ files, examContext, pack, packName }) {
  const existingQuestions = Array.isArray(pack?.questions) ? pack.questions : [];
  if (existingQuestions.length >= MIN_DESIRED_QUESTION_COUNT) {
    return [];
  }

  const missing = Math.max(0, TARGET_QUESTION_COUNT - existingQuestions.length);
  if (!missing) return [];

  const excerpts = collectTextExcerpts(files);
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      instructions: [
        'You expand the question bank for an existing study pack.',
        'Use only the uploaded class material and the provided pack scope.',
        'Do not add new topics or advanced material outside the uploaded content.',
        'Return JSON only with additional unique multiple-choice questions.',
      ].join(' '),
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: [
                `Expand the study pack question bank for ${packName || pack.title || 'this study pack'}.`,
                `Exam context: ${examContext || 'No extra exam context provided.'}`,
                `Scope: ${(pack.scope || []).join(', ') || 'Focused scope only.'}`,
                `Need approximately ${missing} additional questions.`,
                `Existing concepts: ${(pack.concepts || []).map((item) => `${item.topic}: ${item.title}`).slice(0, 18).join(' | ') || 'None listed.'}`,
                `Existing references: ${(pack.formulas || []).map((item) => item.name).slice(0, 18).join(' | ') || 'None listed.'}`,
                `Existing questions to avoid duplicating: ${existingQuestions.map((item) => item.q).slice(0, 20).join(' | ') || 'None listed.'}`,
                'Question mix should include direct recall, application, debugging, compare-and-contrast, and interpretation.',
                excerpts ? `Uploaded material excerpts:\n${excerpts}` : 'No extracted text was available.',
              ].join('\n\n'),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'question_expansion',
          strict: true,
          schema: QUESTION_EXPANSION_SCHEMA,
        },
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    return [];
  }

  const text = extractResponseText(payload);
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    const normalized = normalizeStudyPack({ questions: parsed.questions }, {
      fallbackScope: pack.scope || [],
      requestedTitle: pack.title || packName,
    }).questions;
    const existingSet = new Set(existingQuestions.map((item) => item.q.trim().toLowerCase()));
    return normalized.filter((item) => !existingSet.has(item.q.trim().toLowerCase()));
  } catch (error) {
    return [];
  }
}

export async function generateStudyPack({ files = [], examContext = '', selectedScopes = [], detectedScopes = [], packName = '' }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Add it in Vercel before generating a custom study pack.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      instructions: [
        'You generate focused study packs for a gamified course-prep app.',
        'Use uploaded class materials as the only source of truth by default.',
        'Do not invent prerequisite material, adjacent topics, or more advanced content that is not explicitly supported by the uploaded material.',
        'If the uploaded material is incomplete, stay narrower rather than broader.',
        'Return JSON only that matches the provided schema.',
        'Concept cards should teach clearly in plain English with an intuitive analogy grounded in the subject matter.',
        'The formulas array can also represent syntax patterns, query templates, reference snippets, or key structures if the subject is not math-heavy.',
        'Questions should be multiple-choice, challenging, diverse, and include clear answer explanations.',
        'Prefer 32 to 48 questions when there is enough source material instead of returning a tiny question set.',
        'Avoid LaTeX. Use plain text or simple unicode notation that can render in HTML without external libraries.',
      ].join(' '),
      input: buildModelInput(files, examContext, selectedScopes, detectedScopes, packName),
      text: {
        format: {
          type: 'json_schema',
          name: 'study_pack',
          strict: true,
          schema: STUDY_PACK_SCHEMA,
        },
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const detail = payload?.error?.message || 'The OpenAI request failed.';
    throw new Error(detail);
  }

  const text = extractResponseText(payload);
  if (!text) {
    throw new Error('The model returned an empty study pack response.');
  }

  let rawPack;
  try {
    rawPack = JSON.parse(text);
  } catch (error) {
    throw new Error('The model response was not valid JSON.');
  }

  const normalizedPack = normalizeStudyPack(rawPack, {
    fallbackScope: selectedScopes.length ? selectedScopes : detectedScopes,
    uploadedSources: buildUploadedSources(files),
    webSources: collectWebSources(payload),
    requestedTitle: packName,
  });

  const extraQuestions = await expandQuestionBank({
    files,
    examContext,
    pack: normalizedPack,
    packName,
  });
  if (extraQuestions.length) {
    normalizedPack.questions = [...normalizedPack.questions, ...extraQuestions].slice(0, TARGET_QUESTION_COUNT);
  }

  return normalizedPack;
}
