import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const imageUrl = body?.image_url;
    const instrument = body?.instrument || '';
    const timeframe = body?.timeframe || '';
    if (!imageUrl) return Response.json({ error: 'image_url required' }, { status: 400 });

    const prompt = `Sei un analista tecnico quantitativo con 15 anni di esperienza su equity, derivati e futures. Analizza lo screenshot di un grafico di trading${instrument ? ' relativo a: ' + instrument : ''}${timeframe ? ' (timeframe dichiarato: ' + timeframe + ')' : ''}.

Metodologia: leggi prima il contesto (trend primario su price action e struttura di mercato: higher highs/lows o il contrario), poi individua livelli chiave con precisione (prezzi o zone, non genericità), poi pattern/indicatori visibili (medie mobili, RSI, MACD, volumi, candele), infine costruisci due scenari operativi con trigger di conferma e invalidazione. Sii specifico: se un livello è leggibile dal grafico, cita il valore approssimativo.

Rispondi in italiano. Assegna:
- trend_bias: bullish, bearish, neutral o volatile
- confidence: 0-100, quanto è netta la lettura (grafici puliti con trend definito = alta confidenza; range o rumore = bassa)
- risk_level: low, medium, high o very high, in base a volatilità e chiarezza dei livelli
- summary: 1-2 frasi che sintetizzano la lettura per chi ha poco tempo
- full_analysis: markdown esteso con i paragrafi ## Lettura del grafico, ## Livelli chiave, ## Segnali tecnici, ## Scenari, ## Risk & Bias — conciso ma analitico, conclude con nota che è a scopo educativo e non un consiglio d'investimento.

Concludi sempre ricordando che è materiale educativo, non consulenza d'investimento.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [imageUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          trend_bias: { type: 'string', enum: ['bullish', 'bearish', 'neutral', 'volatile'] },
          confidence: { type: 'number' },
          risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'very high'] },
          summary: { type: 'string' },
          support_levels: { type: 'array', items: { type: 'string' } },
          resistance_levels: { type: 'array', items: { type: 'string' } },
          patterns: { type: 'array', items: { type: 'string' } },
          bullish_trigger: { type: 'string' },
          bullish_target: { type: 'string' },
          bearish_trigger: { type: 'string' },
          bearish_invalidation: { type: 'string' },
          full_analysis: { type: 'string' },
        },
        required: ['trend_bias', 'confidence', 'summary', 'full_analysis'],
      },
    });

    return Response.json({ analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
