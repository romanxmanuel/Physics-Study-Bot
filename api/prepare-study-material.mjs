import { detectScopes } from '../lib/openai-study-pack.mjs';
import { buildSourceSummary, normalizeUpload } from '../lib/study-file-utils.mjs';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export function GET() {
  return jsonResponse({
    ok: true,
    endpoint: '/api/prepare-study-material',
    supports: ['single-file extraction'],
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const examContext = String(formData.get('examContext') || '').trim().slice(0, 4000);
    const upload = formData.get('file');

    if (!upload || typeof upload !== 'object' || typeof upload.arrayBuffer !== 'function') {
      return jsonResponse({ ok: false, error: 'Upload one file at a time when preparing study material.' }, 400);
    }

    const file = await normalizeUpload(upload);
    const detectedScopes = detectScopes({ files: [file], examContext });

    return jsonResponse({
      ok: true,
      material: {
        name: file.name,
        mimeType: file.mimeType,
        kind: file.kind,
        size: file.size,
        extractedText: file.extractedText,
        detail: file.detail,
      },
      detectedScopes,
      sourceSummary: buildSourceSummary([file]),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    return jsonResponse({ ok: false, error: message }, 500);
  }
}
