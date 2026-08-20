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

    const prompt = `Sei un analista tecnico quantitativo esperto. Analizza lo screenshot di un grafico di trading${instrument ? ' relativo a: ' + instrument : ''}${timeframe ? ' (timeframe: ' + timeframe + ')' : ''}.
Fornisci un'analisi strutturata in italiano, markdown, con questi paragrafi:
## Lettura del grafico
(tipo di grafico, asset, timeframe apparente, trend dominante)
## Livelli chiave
(supporti e resistenze, zone di interesse)
## Segnali tecnici
(pattern, medie mobili, RSI/momentum, volumi)
## Scenari
(scenario bullish e bearish con trigger di invalidazione)
## Risk & Bias
(note di risk management e bias da considerare)
Sii analitico e conciso. Concludi con una nota: analisi a scopo educativo, non consiglio d'investimento.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [imageUrl],
    });

    return Response.json({ analysis: typeof result === 'string' ? result : JSON.stringify(result) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}