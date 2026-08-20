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

    const prompt = `Sei un analista finanziario quantitativo senior. Esegui un'analisi strutturata, in stile "deep research", della seguente notizia di mercato. Valuta sentiment, driver principali, impatto atteso sugli asset, orizzonte temporale dell'impatto, fattori di rischio e un parallelo storico se pertinente (una situazione simile già vista sui mercati). Sii concreto e circostanziato, evita frasi generiche. Rispondi in italiano.

NOTIZIA:
"""
${text}
"""

Regole per i campi numerici:
- confidence (0-100): quanto sei sicuro della lettura di sentiment/impatto data l'informazione disponibile.
- market_impact_score (1-10): intensità dell'impatto atteso sui mercati rilevanti, 1 = trascurabile, 10 = market-moving.

deep_analysis deve essere un'analisi discorsiva di 3-5 frasi, non un elenco puntato, che spieghi il "perché" oltre al "cosa".`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment: { type: "string", enum: ["bullish", "bearish", "neutral"] },
          confidence: { type: "number" },
          market_impact_score: { type: "number" },
          impact_horizon: { type: "string", enum: ["short-term", "medium-term", "long-term"] },
          summary: { type: "string" },
          key_points: { type: "array", items: { type: "string" } },
          market_impact: { type: "string" },
          affected_assets: { type: "array", items: { type: "string" } },
          risk_factors: { type: "array", items: { type: "string" } },
          historical_parallel: { type: "string" },
          deep_analysis: { type: "string" }
        },
        required: ["sentiment", "confidence", "summary", "key_points", "deep_analysis"]
      }
    });

    return Response.json({ analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
