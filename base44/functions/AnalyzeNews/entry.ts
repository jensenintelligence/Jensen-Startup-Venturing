import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const text = body?.text;
    if (!text || !text.trim()) return Response.json({ error: 'text required' }, { status: 400 });

    const prompt = `Sei un analista finanziario quantitativo. Esegui un'analisi deep-learning style della seguente notizia di mercato. Valuta sentiment, punti chiave, impatto atteso e asset interessati. Rispondi in italiano.

NOTIZIA:
"""
${text}
"""`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment: { type: "string", enum: ["bullish", "bearish", "neutral"] },
          confidence: { type: "number" },
          summary: { type: "string" },
          key_points: { type: "array", items: { type: "string" } },
          market_impact: { type: "string" },
          affected_assets: { type: "array", items: { type: "string" } },
          deep_analysis: { type: "string" }
        },
        required: ["sentiment", "summary", "key_points", "deep_analysis"]
      }
    });

    return Response.json({ analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}