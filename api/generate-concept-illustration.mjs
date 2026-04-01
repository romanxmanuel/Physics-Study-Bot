function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function buildPrompt({ chapter, topic, title, body, formula, analogy }) {
  const pieces = [
    `Create a clean educational illustration for a college physics study app.`,
    `Topic: ${topic || 'Physics concept'}.`,
    `Chapter: ${chapter || 'Physics 2'}.`,
    `Card title: ${title || topic || 'Concept'}.`,
    body ? `Concept summary: ${body.replace(/<[^>]+>/g, ' ').slice(0, 900)}` : '',
    formula ? `Relevant formula: ${formula}` : '',
    analogy ? `Teaching analogy: ${analogy}` : '',
    `Requirements: make the image diagram-like, visually clear, academically helpful, and directly tied to the concept.`,
    `Prefer labeled arrows, fields, loops, coils, charges, vectors, geometry, or transformer/inductor visuals when relevant.`,
    `Avoid decorative fantasy art, people, memes, text-heavy posters, UI mockups, or unrelated objects.`,
    `Use a dark, high-contrast science-illustration style that fits a modern study website.`,
  ].filter(Boolean);

  return pieces.join('\n');
}

function extractImageData(payload) {
  const candidates = payload?.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      const mimeType = part?.inlineData?.mimeType || part?.inline_data?.mime_type;
      const data = part?.inlineData?.data || part?.inline_data?.data;
      if (mimeType && data && String(mimeType).startsWith('image/')) {
        return { mimeType, data };
      }
    }
  }
  return null;
}

export function GET() {
  return jsonResponse({
    ok: true,
    endpoint: '/api/generate-concept-illustration',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
  });
}

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return jsonResponse({ ok: false, error: 'GEMINI_API_KEY is not configured on the server.' }, 500);
    }

    const body = await request.json();
    const chapter = String(body?.chapter || '').trim().slice(0, 80);
    const topic = String(body?.topic || '').trim().slice(0, 120);
    const title = String(body?.title || '').trim().slice(0, 160);
    const conceptBody = String(body?.body || '').trim().slice(0, 4000);
    const formula = String(body?.formula || '').trim().slice(0, 200);
    const analogy = String(body?.analogy || '').trim().slice(0, 300);

    if (!topic && !title && !conceptBody) {
      return jsonResponse({ ok: false, error: 'Concept content is required before generating an illustration.' }, 400);
    }

    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;

    const prompt = buildPrompt({
      chapter,
      topic,
      title,
      body: conceptBody,
      formula,
      analogy,
    });

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    const payload = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const message = payload?.error?.message || `Gemini image generation failed with status ${upstream.status}.`;
      return jsonResponse({ ok: false, error: message }, upstream.status);
    }

    const image = extractImageData(payload);
    if (!image) {
      return jsonResponse({ ok: false, error: 'Gemini returned no image data for this concept.' }, 502);
    }

    return jsonResponse({
      ok: true,
      imageDataUrl: `data:${image.mimeType};base64,${image.data}`,
      model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected illustration generation error.';
    return jsonResponse({ ok: false, error: message }, 500);
  }
}
