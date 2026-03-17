import { Buffer } from 'node:buffer';

import { extractPptxTextFromBuffer } from './extractors/pptx.mjs';
import { extractTextFileFromBuffer } from './extractors/text.mjs';

export const MAX_UPLOAD_FILE_BYTES = 8 * 1024 * 1024;

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

export function getExtension(filename) {
  const parts = String(filename || '').toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

export function getKindFromFilename(filename) {
  return TYPE_BY_EXTENSION[getExtension(filename)] || '';
}

export function normalizePreparedMaterial(raw) {
  const name = String(raw?.name || '').trim();
  const kind = String(raw?.kind || '').trim();
  if (!name || !kind) return null;

  return {
    name,
    kind,
    mimeType: String(raw?.mimeType || 'application/octet-stream'),
    size: Number(raw?.size) || 0,
    extractedText: String(raw?.extractedText || ''),
    detail: String(raw?.detail || ''),
  };
}

export function buildSourceSummary(files) {
  return files.map((file) => ({
    label: file.name,
    type: file.kind,
    detail: file.detail,
    url: '',
  }));
}

export async function normalizeUpload(file) {
  const kind = getKindFromFilename(file.name);
  if (!kind) {
    throw new Error(`Unsupported file type for "${file.name}". Use .pptx, .pdf, .txt, .md, .png, .jpg, or .webp.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_UPLOAD_FILE_BYTES) {
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
