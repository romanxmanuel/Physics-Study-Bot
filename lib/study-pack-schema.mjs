function uniq(items) {
  return [...new Set(items.filter(Boolean))];
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
}

function sanitizeText(value, fallback = '') {
  return String(value ?? fallback)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .trim();
}

function normalizeConcept(item, index) {
  return {
    chapter: sanitizeText(item?.chapter, 'Custom Scope'),
    topic: sanitizeText(item?.topic, `Topic ${index + 1}`),
    title: sanitizeText(item?.title, `Concept ${index + 1}`),
    body: sanitizeText(item?.body, 'Review the uploaded material for this concept.'),
    analogy: sanitizeText(item?.analogy, 'Connect this concept to a concrete physical intuition.'),
    formula: sanitizeText(item?.formula, ''),
    formulaNote: sanitizeText(item?.formulaNote, ''),
  };
}

function normalizeFormula(item, index) {
  const vars = Array.isArray(item?.vars)
    ? item.vars
        .map((entry, varIndex) => ({
          sym: sanitizeText(entry?.sym, `x${varIndex + 1}`),
          unit: sanitizeText(entry?.unit, ''),
          meaning: sanitizeText(entry?.meaning, ''),
        }))
        .filter((entry) => entry.sym)
    : [];

  return {
    chapter: sanitizeText(item?.chapter, 'Custom Scope'),
    name: sanitizeText(item?.name, `Formula ${index + 1}`),
    formula: sanitizeText(item?.formula, 'See uploaded materials'),
    vars,
    plain: sanitizeText(item?.plain, 'Understand what this equation means physically before memorizing it.'),
  };
}

function normalizeQuestion(item, index) {
  const choices = Array.isArray(item?.choices)
    ? item.choices.map((choice) => sanitizeText(choice)).filter(Boolean)
    : [];

  const safeChoices = choices.length >= 2 ? choices.slice(0, 6) : ['Option A', 'Option B'];
  const answer = clamp(Number.isFinite(item?.answer) ? Number(item.answer) : 0, 0, safeChoices.length - 1);

  return {
    chapter: sanitizeText(item?.chapter, 'Custom Scope'),
    topic: sanitizeText(item?.topic, `Topic ${index + 1}`),
    type: sanitizeText(item?.type, 'application'),
    q: sanitizeText(item?.q, `Question ${index + 1}`),
    choices: safeChoices,
    answer,
    explain: sanitizeText(item?.explain, 'Review the governing principle and re-solve the setup step by step.'),
  };
}

function normalizeSource(item) {
  return {
    label: sanitizeText(item?.label, 'Study source'),
    type: sanitizeText(item?.type, 'reference'),
    detail: sanitizeText(item?.detail, ''),
    url: sanitizeText(item?.url, ''),
  };
}

export const STUDY_PACK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'subtitle', 'scope', 'concepts', 'formulas', 'questions', 'sourceSummary', 'coachNotes'],
  properties: {
    title: { type: 'string' },
    subtitle: { type: 'string' },
    scope: {
      type: 'array',
      items: { type: 'string' },
    },
    concepts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['chapter', 'topic', 'title', 'body', 'analogy', 'formula', 'formulaNote'],
        properties: {
          chapter: { type: 'string' },
          topic: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
          analogy: { type: 'string' },
          formula: { type: 'string' },
          formulaNote: { type: 'string' },
        },
      },
    },
    formulas: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['chapter', 'name', 'formula', 'vars', 'plain'],
        properties: {
          chapter: { type: 'string' },
          name: { type: 'string' },
          formula: { type: 'string' },
          vars: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['sym', 'unit', 'meaning'],
              properties: {
                sym: { type: 'string' },
                unit: { type: 'string' },
                meaning: { type: 'string' },
              },
            },
          },
          plain: { type: 'string' },
        },
      },
    },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['chapter', 'topic', 'type', 'q', 'choices', 'answer', 'explain'],
        properties: {
          chapter: { type: 'string' },
          topic: { type: 'string' },
          type: { type: 'string' },
          q: { type: 'string' },
          choices: {
            type: 'array',
            items: { type: 'string' },
          },
          answer: { type: 'integer' },
          explain: { type: 'string' },
        },
      },
    },
    sourceSummary: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'type', 'detail', 'url'],
        properties: {
          label: { type: 'string' },
          type: { type: 'string' },
          detail: { type: 'string' },
          url: { type: 'string' },
        },
      },
    },
    coachNotes: {
      type: 'array',
      items: { type: 'string' },
    },
  },
};

export function normalizeStudyPack(rawPack, { fallbackScope = [], uploadedSources = [], webSources = [], requestedTitle = '' } = {}) {
  const concepts = Array.isArray(rawPack?.concepts)
    ? rawPack.concepts.map(normalizeConcept).filter((item) => item.title && item.body)
    : [];

  const formulas = Array.isArray(rawPack?.formulas)
    ? rawPack.formulas.map(normalizeFormula).filter((item) => item.name && item.formula)
    : [];

  const questions = Array.isArray(rawPack?.questions)
    ? rawPack.questions.map(normalizeQuestion).filter((item) => item.q && item.choices.length >= 2)
    : [];

  const sourceSummary = uniq([
    ...((Array.isArray(rawPack?.sourceSummary) ? rawPack.sourceSummary : []).map(normalizeSource)),
    ...uploadedSources.map(normalizeSource),
    ...webSources.map(normalizeSource),
  ].map((item) => JSON.stringify(item))).map((value) => JSON.parse(value));

  const coachNotes = uniq(
    (Array.isArray(rawPack?.coachNotes) ? rawPack.coachNotes : [])
      .map((note) => sanitizeText(note))
      .filter(Boolean),
  );

  return {
    title: sanitizeText(rawPack?.title || requestedTitle, requestedTitle || 'Custom Study Pack'),
    subtitle: sanitizeText(
      rawPack?.subtitle,
      'Generated from uploaded class material and verified with focused web research.',
    ),
    scope: uniq((Array.isArray(rawPack?.scope) ? rawPack.scope : fallbackScope).map((item) => sanitizeText(item))).slice(0, 12),
    concepts,
    formulas,
    questions,
    sourceSummary,
    coachNotes,
  };
}
