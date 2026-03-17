import { detectScopes, generateStudyPack } from '../lib/openai-study-pack.mjs';
import { buildSourceSummary, normalizePreparedMaterial, normalizeUpload } from '../lib/study-file-utils.mjs';

const MAX_FILES = 18;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
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

function parsePreparedMaterials(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.map(normalizePreparedMaterial).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
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
    const packName = String(formData.get('packName') || '').trim().slice(0, 120);
    const selectedScopes = parseSelectedScopes(formData.get('selectedScopes'));
    const preparedMaterials = parsePreparedMaterials(formData.get('materialsJson'));
    const uploads = formData
      .getAll('files')
      .filter((entry) => entry && typeof entry === 'object' && typeof entry.arrayBuffer === 'function');

    if (!uploads.length && !preparedMaterials.length) {
      return jsonResponse({ ok: false, error: 'Upload at least one class file before generating a study pack.' }, 400);
    }

    if (uploads.length > MAX_FILES || preparedMaterials.length > MAX_FILES) {
      return jsonResponse({ ok: false, error: `Upload up to ${MAX_FILES} files at a time.` }, 400);
    }

    const files = [...preparedMaterials];
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
      packName,
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
