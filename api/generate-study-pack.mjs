import { Buffer } from 'node:buffer';

import { extractPptxTextFromBuffer } from '../lib/extractors/pptx.mjs';
import { extractTextFileFromBuffer } from '../lib/extractors/text.mjs';
import { detectScopes, generateStudyPack } from '../lib/openai-study-pack.mjs';

const MAX_FILES = 8;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

const TYPE_BY_EXTENSION = {
  pptx: 'pptx',
  pdf: 'pdf',
  txt: 'text',
  md: 'text',
  markdown: 'text',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  webp: 'image',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function getExtension(filename) {
  const parts = String(filename || '').toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

function parseSelectedScopes(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

async function normalizeUpload(file) {
  const extension = getExtension(file.name);
  const kind = TYPE_BY_EXTENSION[extension];
  if (!kind) {
    throw new Error(`Unsupported file type for "${file.name}". Use .pptx, .pdf, .txt, .md, .png, .jpg, or .webp.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" is too large. Keep each file under 8 MB.`);
  }

  let extractedText = '';
  let detail = '';

  if (kind === 'pptx') {
    const extracted = await extractPptxTextFromBuffer(buffer);
    extractedText = extracted.text;
    detail = extracted.slideCount ? `${extracted.slideCount} slides extracted` : 'No slide text found';
  } else if (kind === 'text') {
    extractedText = extractTextFileFromBuffer(buffer);
    detail = extractedText ? `${extractedText.length} characters extracted` : 'Text file was empty';
  } else if (kind === 'pdf') {
    detail = 'PDF attached for model inspection';
  } else if (kind === 'image') {
    detail = 'Image attached for model inspection';
  }

  return {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    kind,
    size: buffer.byteLength,
    buffer,
    extractedText,
    detail,
  };
}

function buildSourceSummary(files) {
  return files.map((file) => ({
    label: file.name,
    type: file.kind,
    detail: file.detail,
    url: '',
  }));
}

export function GET() {
  return jsonResponse({
    ok: true,
    endpoint: '/api/generate-study-pack',
    supports: ['analyze', 'generate'],
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const action = String(formData.get('action') || 'analyze').toLowerCase();
    const examContext = String(formData.get('examContext') || '').trim().slice(0, 4000);
    const selectedScopes = parseSelectedScopes(formData.get('selectedScopes'));
    const uploads = formData
      .getAll('files')
      .filter((entry) => entry && typeof entry === 'object' && typeof entry.arrayBuffer === 'function');

    if (!uploads.length) {
      return jsonResponse({ ok: false, error: 'Upload at least one class file before analyzing the scope.' }, 400);
    }

    if (uploads.length > MAX_FILES) {
      return jsonResponse({ ok: false, error: `Upload up to ${MAX_FILES} files at a time.` }, 400);
    }

    const files = [];
    for (const upload of uploads) {
      files.push(await normalizeUpload(upload));
    }

    const detectedScopes = detectScopes({ files, examContext });
    const sourceSummary = buildSourceSummary(files);

    if (action === 'analyze') {
      return jsonResponse({
        ok: true,
        detectedScopes,
        sourceSummary,
      });
    }

    if (action !== 'generate') {
      return jsonResponse({ ok: false, error: `Unsupported action "${action}".` }, 400);
    }

    const studyPack = await generateStudyPack({
      files,
      examContext,
      selectedScopes,
      detectedScopes,
    });

    return jsonResponse({
      ok: true,
      detectedScopes,
      studyPack,
      sourceSummary: studyPack.sourceSummary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    return jsonResponse({ ok: false, error: message }, 500);
  }
}
