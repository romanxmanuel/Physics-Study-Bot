import { Buffer } from 'node:buffer';

import { STUDY_PACK_SCHEMA, normalizeStudyPack } from './study-pack-schema.mjs';

const DEFAULT_MODEL = process.env.OPENAI_STUDY_MODEL || 'gpt-4o-mini';
const MAX_CONTEXT_CHARS = 48000;
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
  ['current', 'Current'],
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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function inferScopeFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  const stripped = base
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
      : 'Uploaded course material attached to the model request.',
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
      'Use the uploaded files as the primary source of truth, then use web search to fill gaps and find supporting explanations or practice framing for only that selected scope.',
      'Keep the pack narrow. Do not drift into chapters or topics outside the selected scope.',
      'Make the content engaging and challenging. Questions should feel exam-relevant, not trivial.',
      excerpts ? `Extracted text excerpts:\n${excerpts}` : 'No extractable text was available from the uploads; inspect attached files directly where possible.',
    ].join('\n\n'),
  });

  files.forEach((file) => {
    if (file.kind === 'pdf') {
      content.push({
        type: 'input_file',
        filename: file.name,
        file_data: buildDataUrl(file),
      });
      return;
    }

    if (file.kind === 'image') {
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
        'Use uploaded class materials as the primary source, then use web search to supplement only the selected exam scope.',
        'Return JSON only that matches the provided schema.',
        'Concept cards should teach clearly in plain English with an intuitive analogy.',
        'The formulas array can also represent syntax patterns, query templates, reference snippets, or key structures if the subject is not math-heavy.',
        'Questions should be multiple-choice, challenging, and include clear answer explanations.',
        'Avoid LaTeX. Use plain text or simple unicode notation that can render in HTML without external libraries.',
      ].join(' '),
      input: buildModelInput(files, examContext, selectedScopes, detectedScopes, packName),
      tools: [
        {
          type: 'web_search_preview',
          search_context_size: 'medium',
        },
      ],
      tool_choice: 'auto',
      include: ['web_search_call.action.sources'],
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

  return normalizeStudyPack(rawPack, {
    fallbackScope: selectedScopes.length ? selectedScopes : detectedScopes,
    uploadedSources: buildUploadedSources(files),
    webSources: collectWebSources(payload),
    requestedTitle: packName,
  });
}
