import AdmZip from 'adm-zip';
import { Parser } from 'xml2js';

function slideNumberFromEntry(entryName) {
  const match = entryName.match(/slide(\d+)\.xml$/i);
  return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

function normalizeText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\|/g, ' ')
    .trim();
}

function collectText(node, output) {
  if (typeof node === 'string') {
    const clean = normalizeText(node);
    if (clean) output.push(clean);
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((item) => collectText(item, output));
    return;
  }

  if (!node || typeof node !== 'object') return;
  Object.values(node).forEach((value) => collectText(value, output));
}

export async function extractPptxTextFromBuffer(buffer) {
  const zip = new AdmZip(buffer);
  const parser = new Parser();
  const entries = zip
    .getEntries()
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/i.test(entry.entryName))
    .sort((a, b) => slideNumberFromEntry(a.entryName) - slideNumberFromEntry(b.entryName));

  const slides = [];

  for (const entry of entries) {
    const xml = await parser.parseStringPromise(entry.getData().toString('utf8'));
    const texts = [];
    collectText(xml, texts);

    const deduped = [...new Set(texts)];
    if (deduped.length) {
      slides.push(`Slide ${slides.length + 1}: ${deduped.join(' ')}`);
    }
  }

  return {
    slideCount: slides.length,
    text: slides.join('\n\n'),
  };
}
