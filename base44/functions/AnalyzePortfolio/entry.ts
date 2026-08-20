import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const trades = Array.isArray(body?.trades) ? body.trades : [];
    if (!trades.length) return Response.json({ error: 'trades array required' }, { status: 400 });

    const closed = trades.filter((t) => t.status === 'closed');
    const wins = closed.filter((t) => (t.pnl ?? 0) >= 0);
    const winRate = closed.length ? Math.round((wins.length / closed.length) * 100) : 0;
    const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);

    const digest = closed.slice(0, 60).map((t) => ({
      instrument: t.instrument,
      type: t.instrument_type,
      direction: t.direction,
      strategy: t.strategy,
      risk_level: t.risk_level,
      pnl: t.pnl,
      pnl_percent: t.pnl_percent,
      thesis: t.thesis,
      lessons: t.lessons,
    }));

    const prompt = `Sei un risk manager e coach di trading esperto. Ti fornisco lo storico delle operazioni chiuse di un trader individuale (progetto educativo, non un fondo). Analizza il comportamento, non le singole operazioni: cerca pattern ricorrenti su strategia, gestione del rischio, coerenza tra tesi e risultato, tipologie di strumenti dove il trader è più/meno efficace.

Statistiche aggregate: ${closed.length} trade chiusi, win rate ${winRate}%, P&L totale ${totalPnl.toFixed(0)}€.

Storico (JSON):
${JSON.stringify(digest)}

Rispondi in italiano con:
- summary: 2-3 frasi di sintesi onesta e diretta sullo stato del "metodo" del trader
- strengths: punti di forza ricorrenti (array di frasi brevi)
- weaknesses: debolezze ricorrenti, es. bias comportamentali, incoerenze tesi/esecuzione (array)
- risk_patterns: pattern di rischio da monitorare, es. concentrazione su uno strumento, position sizing incoerente (array)
- recommendations: 3-5 azioni concrete e specifiche per migliorare, non generiche (array)
- discipline_score: 0-100, quanto il comportamento osservato è disciplinato e coerente con le tesi dichiarate

Sii critico e specifico quando i dati lo giustificano, non generico o solo elogiativo. Non è consulenza d'investimento, è una revisione metodologica a scopo educativo.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
          risk_patterns: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          discipline_score: { type: 'number' },
        },
        required: ['summary', 'strengths', 'weaknesses', 'recommendations', 'discipline_score'],
      },
    });

    return Response.json({
      analysis: result,
      snapshot: { trades_analyzed: closed.length, win_rate_snapshot: winRate, pnl_snapshot: totalPnl },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
