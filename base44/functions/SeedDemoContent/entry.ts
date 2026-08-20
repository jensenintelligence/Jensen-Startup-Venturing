import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Admin-triggered helper that populates the app with realistic, educational demo
// content (papers, trades, news, market pulse points) so the site does not look
// empty. Safe to run once: it checks existing counts and refuses to duplicate
// unless { force: true } is passed explicitly.

const papers = [
  {
    title: 'Volatility Risk Premium: perché vendere opzioni funziona (finché non funziona più)',
    subtitle: 'Il divario tra volatilità implicita e realizzata come fonte di rendimento e di rischio di coda',
    abstract: 'La volatilità implicita è quasi sempre superiore a quella poi realizzata: da qui nasce la volatility risk premium, la fonte di rendimento di strategie come covered call e cash-secured put. Ma è un premio che si paga in code rare e violente.',
    category: 'Derivatives',
    tags: ['opzioni', 'volatilità', 'risk premium'],
    reading_time_min: 9,
    featured: true,
    author_note: 'Materiale a scopo educativo. Le strategie in opzioni comportano rischio di perdita significativo, anche superiore al capitale investito nel caso di vendita scoperta.',
    content: `<h2>Il divario tra volatilità implicita e realizzata</h2>
<p>Su quasi tutti gli indici azionari principali, la volatilità implicita (quella prezzata dalle opzioni) è mediamente più alta della volatilità che poi si realizza davvero sul sottostante. Questo divario persistente è la <strong>volatility risk premium</strong> (VRP): chi vende opzioni sistematicamente incassa, in media, più di quanto l'oscillazione effettiva del prezzo giustificherebbe.</p>
<p>Il motivo non è un'inefficienza di mercato in senso stretto, ma una forma di assicurazione: chi compra opzioni put per protezione è disposto a pagare un premio superiore al "fair value" statistico, esattamente come chi acquista una polizza assicurativa.</p>
<h2>Come si estrae il premio</h2>
<p>Le strategie più comuni per catturare la VRP sono:</p>
<ul>
<li><strong>Covered call</strong>: vendita di call su un sottostante posseduto, per incassare premio a fronte di un tetto ai guadagni.</li>
<li><strong>Cash-secured put</strong>: vendita di put coperta da liquidità, equivalente sinteticamente a un ordine di acquisto a sconto più il premio incassato.</li>
<li><strong>Short strangle/straddle</strong>: vendita simultanea di call e put, per profilo delta-neutral, tipicamente su indici o su sottostanti a bassa direzionalità attesa.</li>
</ul>
<h2>Il rischio di coda</h2>
<p>Il rovescio della medaglia è la <em>skewness</em> negativa del payoff: si incassano piccoli premi con alta frequenza, ma ci si espone a perdite rare e violente nei momenti di stress (2008, marzo 2020, il "Volmageddon" del febbraio 2018). Vendere volatilità senza copertura equivale a vendere assicurazioni contro eventi che, quando accadono, sono correlati e simultanei.</p>
<blockquote>La VRP non è un pasto gratis: è la remunerazione per aver accettato un rischio di coda che il mercato preferisce trasferire a qualcun altro.</blockquote>
<h2>Gestione del rischio</h2>
<p>Le implementazioni più robuste limitano il rischio di coda con position sizing conservativo, diversificazione tra sottostanti non correlati, e talvolta l'acquisto di protezione out-of-the-money finanziata dal premio incassato (collar, put spread collar). Il dimensionamento della posizione conta più della singola view direzionale.</p>`,
  },
  {
    title: 'Short selling in equity: meccanica, costi e trappole',
    subtitle: 'Come funziona davvero vendere allo scoperto, tra prestito titoli, costi di carry e short squeeze',
    abstract: 'Vendere allo scoperto non è "comprare al contrario": comporta un prestito titoli, un costo di carry, un rischio teoricamente illimitato e una dinamica psicologica molto diversa dal long. Una mappa della meccanica e delle trappole più comuni.',
    category: 'Short Selling',
    tags: ['short selling', 'equity', 'risk management'],
    reading_time_min: 8,
    featured: true,
    content: `<h2>La meccanica del prestito titoli</h2>
<p>Per vendere allo scoperto un'azione, il broker deve prendere in prestito i titoli da chi li detiene (spesso investitori istituzionali) per consegnarli a chi li acquista. Il venditore short paga un costo di prestito (borrow fee), variabile a seconda della disponibilità del titolo: pochi punti base per titoli liquidi, decine di punti percentuali annualizzati per titoli "hard to borrow".</p>
<h2>Il profilo di rischio asimmetrico</h2>
<p>La perdita potenziale su una posizione long è limitata al capitale investito (il prezzo può scendere al massimo a zero). Su una posizione short, invece, il prezzo può salire teoricamente all'infinito: la perdita potenziale non ha un limite superiore definito a priori. Questo asimmetria impone un position sizing molto più conservativo rispetto al long.</p>
<h2>Short squeeze</h2>
<p>Quando molti operatori sono corti sullo stesso titolo e il prezzo inizia a salire, gli short devono ricomprare per limitare le perdite: questo riacquisto forzato alimenta ulteriormente il rialzo, in un ciclo auto-rinforzante noto come short squeeze. I casi più noti (GameStop 2021, Volkswagen 2008) mostrano quanto velocemente possa evolvere.</p>
<h2>Segnali di affollamento</h2>
<ul>
<li>Short interest elevato rispetto al flottante disponibile</li>
<li>Days-to-cover elevati (giorni di volume medio necessari a coprire tutte le posizioni corte)</li>
<li>Borrow fee in forte aumento, segnale di scarsità di titoli disponibili al prestito</li>
</ul>
<h2>Un approccio disciplinato</h2>
<p>Chi opera short professionalmente tende a usare stop loss rigidi, size ridotte rispetto al long, e spesso strumenti con rischio definito (put invece di short diretto) proprio per limitare l'esposizione a un movimento avverso senza limite teorico.</p>`,
  },
  {
    title: 'Carry trade e regime dei tassi: una mappa 2024-2026',
    subtitle: 'Come i differenziali di tasso tra banche centrali muovono i flussi valutari, e cosa succede quando il regime cambia',
    abstract: 'Il carry trade — prendere a prestito in una valuta a basso tasso per investire in una ad alto tasso — ha guidato flussi enormi negli ultimi anni. La mappa dei differenziali di tasso tra le principali banche centrali e i rischi quando la volatilità torna a salire.',
    category: 'Macro',
    tags: ['macro', 'valute', 'banche centrali'],
    reading_time_min: 10,
    content: `<h2>La logica del carry trade</h2>
<p>Il carry trade classico consiste nel finanziarsi in una valuta con tassi di interesse bassi (storicamente lo yen giapponese) per investire in asset denominati in una valuta con tassi più alti, incassando il differenziale — a patto che il cambio non si muova contro la posizione più del carry incassato.</p>
<h2>Perché funziona (finché funziona)</h2>
<p>Il carry trade è profittevole quando la volatilità valutaria è bassa e prevedibile: in quei periodi, il differenziale di tasso non viene "eroso" da movimenti di cambio avversi. È una strategia che genera rendimenti piccoli e costanti, con un profilo di rischio simile alla vendita di volatilità — "raccogliere monetine davanti a un rullo compressore", come viene spesso descritta.</p>
<h2>Il rischio di unwind</h2>
<p>Quando la volatilità torna a salire — per uno shock macro, un cambio di policy di una banca centrale finanziatrice, o un evento geopolitico — le posizioni di carry vengono chiuse rapidamente e in massa, perché sono spesso a leva. Questo "unwind" può causare movimenti valutari violenti e non lineari rispetto alla causa scatenante, come si è visto in diversi episodi storici legati allo yen.</p>
<h2>Leggere il regime attuale</h2>
<p>Monitorare la mappa dei differenziali di tasso tra le principali banche centrali (Fed, BCE, BoJ, BoE) e la loro traiettoria attesa (non solo il livello attuale) è centrale per capire dove si stanno accumulando posizioni di carry e quanto sono affollate. Gli indicatori utili includono il posizionamento speculativo netto sui futures valutari e la volatilità implicita a 1-3 mesi sulle coppie coinvolte.</p>
<h2>Implicazioni pratiche</h2>
<p>Un regime di tassi in convergenza (banche centrali che si muovono nella stessa direzione) tende a comprimere i differenziali e a ridurre l'attrattività del carry; un regime di divergenza li amplia. I punti di svolta di policy monetaria restano i momenti più delicati per chi ha esposizione, anche indiretta, a questo tipo di flussi.</p>`,
  },
  {
    title: 'Asset reali e diversificazione: oltre azioni e obbligazioni',
    subtitle: 'Materie prime, immobiliare, infrastrutture e asset digitali nel portafoglio di un investitore individuale',
    abstract: 'Un portafoglio 60/40 azioni-obbligazioni ha mostrato i suoi limiti nei regimi di inflazione elevata. Una panoramica ragionata su cosa aggiungono davvero gli asset reali e alternativi in termini di diversificazione, e a quali condizioni.',
    category: 'Alternative Assets',
    tags: ['diversificazione', 'asset reali', 'inflazione'],
    reading_time_min: 7,
    content: `<h2>I limiti del portafoglio tradizionale</h2>
<p>Il classico portafoglio 60/40 (60% azioni, 40% obbligazioni) si basa su una correlazione storicamente negativa tra le due classi: quando le azioni scendono, le obbligazioni tendono a salire, ammortizzando il drawdown. Questa relazione si è indebolita o invertita nei periodi di inflazione elevata e sorprese sui tassi, come nel 2022, quando entrambe le classi hanno perso valore insieme.</p>
<h2>Cosa aggiungono gli asset reali</h2>
<p>Materie prime, immobiliare e infrastrutture hanno tipicamente una correlazione più bassa (o negativa in certe fasi) con azioni e obbligazioni tradizionali, e offrono una protezione parziale contro l'inflazione inattesa, perché i loro flussi di cassa o il loro valore intrinseco tendono a muoversi con i prezzi reali.</p>
<h2>Materie prime</h2>
<p>L'esposizione può avvenire tramite futures, ETC o azionario del settore estrattivo/energetico. È importante distinguere il rendimento "spot" (variazione di prezzo) dal rendimento "roll" (guadagno o perdita legato alla struttura a termine della curva future, in contango o backwardation).</p>
<h2>Asset digitali</h2>
<p>Le criptovalute restano un'asset class ad alta volatilità e correlazione instabile con il resto del portafoglio: in certe fasi si comportano come risk-on puro (correlate all'azionario growth), in altre in modo scollegato. Vanno trattate come componente satellite, dimensionata in modo coerente con la propria tolleranza al rischio, non come sostituto della diversificazione tradizionale.</p>
<h2>Il punto centrale</h2>
<p>La diversificazione reale non deriva dal numero di asset in portafoglio, ma dalla bassa correlazione tra i loro driver di rendimento. Aggiungere asset che rispondono agli stessi fattori macro (crescita, inflazione, tassi reali) in modo diverso è ciò che riduce davvero il rischio complessivo.</p>`,
  },
  {
    title: 'Fattori quantitativi: momentum, value e la loro decadenza',
    subtitle: 'Perché i premi fattoriali non sono costanti nel tempo, e cosa significa per chi li usa oggi',
    abstract: 'Momentum e value sono tra i fattori più studiati in finanza quantitativa, ma i loro premi si sono ridotti negli ultimi decenni. Una lettura di come funzionano, perché tendono a decadere una volta scoperti, e come reagire.',
    category: 'Quantitative',
    tags: ['quant', 'fattori', 'momentum', 'value'],
    reading_time_min: 9,
    content: `<h2>Cosa sono i fattori</h2>
<p>Un fattore è una caratteristica misurabile di un titolo (es. quanto è "a sconto" rispetto ai fondamentali, o quanto ha performato di recente) che, storicamente, ha spiegato una parte sistematica dei rendimenti attesi. Momentum (i titoli che sono saliti tendono a continuare a salire nel breve-medio termine) e value (i titoli a sconto rispetto ai fondamentali tendono a sovraperformare nel lungo termine) sono tra i più documentati in letteratura accademica.</p>
<h2>Perché funzionano</h2>
<p>Le spiegazioni si dividono in due filoni: rischio sistematico (il fattore remunera un'esposizione a un rischio reale, es. titoli value più ciclici e vulnerabili nelle recessioni) e comportamentale (bias degli investitori come l'ancoraggio o la reazione ritardata alle notizie, che creano inefficienze sfruttabili).</p>
<h2>Il fenomeno della decadenza</h2>
<p>Diversi studi mostrano che i premi fattoriali si riducono dopo la loro pubblicazione accademica: una volta che una strategia è nota e replicata su larga scala, l'afflusso di capitale che la sfrutta ne comprime il rendimento atteso. Questo non significa che il fattore smetta di esistere, ma che il premio catturabile si assottiglia e diventa più ciclico.</p>
<h2>Implicazioni pratiche</h2>
<ul>
<li>I fattori attraversano lunghi periodi di sottoperformance anche quando restano validi nel lungo periodo (il value ha sottoperformato per oltre un decennio prima di un forte recupero recente).</li>
<li>La combinazione di più fattori a bassa correlazione tra loro (es. value + momentum) tende a ridurre la varianza dei rendimenti rispetto a un singolo fattore isolato.</li>
<li>I costi di implementazione (turnover, costi di transazione, capacità dello strategy) erodono una parte non trascurabile del premio teorico misurato sulla carta.</li>
</ul>
<h2>Conclusione</h2>
<p>I fattori quantitativi restano uno strumento utile per strutturare l'esposizione a fonti di rendimento diverse dal semplice beta di mercato, ma vanno usati con aspettative realistiche su intensità del premio, orizzonte temporale e capacità di sopportare periodi prolungati di sottoperformance relativa.</p>`,
  },
  {
    title: 'Microstruttura dei mercati: order flow, market maker e liquidità',
    subtitle: 'Cosa succede davvero tra il click "compra" e l\'esecuzione dell\'ordine',
    abstract: 'Dietro ogni ordine eseguito c\'è un ecosistema di market maker, order book e frammentazione della liquidità su più venue. Capire la microstruttura aiuta a leggere slippage, spread e comportamento del prezzo nel brevissimo termine.',
    category: 'Market Structure',
    tags: ['microstruttura', 'liquidità', 'order flow'],
    reading_time_min: 8,
    content: `<h2>L'order book</h2>
<p>Il cuore della negoziazione elettronica è il limit order book: un elenco ordinato di proposte di acquisto (bid) e vendita (ask) a prezzi diversi. Lo spread bid-ask, cioè la differenza tra il miglior prezzo di acquisto e di vendita disponibile, è una misura diretta del costo implicito di negoziazione e della liquidità istantanea del titolo.</p>
<h2>Il ruolo dei market maker</h2>
<p>I market maker forniscono liquidità postando quotazioni su entrambi i lati del book, guadagnando tipicamente sullo spread e gestendo il rischio di inventario che ne deriva. In mercati elettronici moderni questo ruolo è spesso svolto da desk di trading algoritmico ad alta frequenza, che aggiustano le quotazioni in millisecondi in risposta a nuove informazioni.</p>
<h2>Frammentazione della liquidità</h2>
<p>Uno stesso titolo può essere negoziato su decine di venue diverse (borse regolamentate, sistemi multilaterali di negoziazione, dark pool). Questa frammentazione può migliorare la competizione sui prezzi, ma rende più complesso valutare la liquidità "reale" disponibile guardando un solo book.</p>
<h2>Perché conta per chi opera</h2>
<ul>
<li><strong>Slippage</strong>: la differenza tra il prezzo atteso e quello effettivamente ottenuto, più ampia su titoli poco liquidi o in condizioni di mercato stressate.</li>
<li><strong>Impatto di mercato</strong>: ordini di grandi dimensioni rispetto alla liquidità disponibile muovono il prezzo contro chi li esegue; per questo si frazionano nel tempo (algoritmi TWAP/VWAP).</li>
<li><strong>Momenti di illiquidità</strong>: in apertura, chiusura o durante notizie ad alto impatto, gli spread si allargano bruscamente perché i market maker riducono l'esposizione per gestire il rischio.</li>
</ul>
<h2>Conclusione</h2>
<p>Capire come si forma il prezzo a livello di order book aiuta a interpretare movimenti apparentemente "irrazionali" nel brevissimo termine, e a dimensionare gli ordini in modo più consapevole rispetto alla liquidità realmente disponibile.</p>`,
  },
];

const trades = [
  { instrument: 'SPX 4H — Put Spread', instrument_type: 'Option', direction: 'short', strategy: 'put spread protettivo', risk_level: 'medium', entry_price: 5120, exit_price: 5040, position_size: 5, status: 'closed', pnl: 620, pnl_percent: 8.4, thesis: 'Divergenza ribassista su RSI settimanale con volumi in calo su nuovi massimi; copertura tattica su parte del portafoglio long.', lessons: 'Uscita disciplinata al target: evitare di "spremere" oltre il piano quando il grafico dà segnali di esaurimento del movimento.', daysAgo: 54 },
  { instrument: 'EUR/USD', instrument_type: 'Forex', direction: 'long', strategy: 'mean reversion su supporto macro', risk_level: 'low', entry_price: 1.0680, exit_price: 1.0610, position_size: 20000, status: 'closed', pnl: -140, pnl_percent: -0.66, thesis: 'Rimbalzo atteso su supporto pluriennale in area 1.068 dopo eccesso di vendite short-term.', lessons: 'Il supporto tecnico da solo non basta: il contesto macro (differenziale tassi Fed-BCE) era contrario alla tesi e andava pesato di più.', daysAgo: 48 },
  { instrument: 'AAPL', instrument_type: 'Equity', direction: 'short', strategy: 'short su rottura supporto', risk_level: 'high', entry_price: 191.5, exit_price: 198.2, position_size: 80, status: 'closed', pnl: -536, pnl_percent: -3.5, thesis: 'Rottura di supporto a 190 dopo guidance debole sul segmento servizi; attesa continuazione ribassista.', lessons: 'Stop loss rispettato, ma size troppo ampia rispetto alla convinzione reale sulla tesi: rivedere il position sizing su idee "di reazione" a breve termine.', daysAgo: 41 },
  { instrument: 'VIX Call 20', instrument_type: 'Option', direction: 'long', strategy: 'copertura tail risk', risk_level: 'very high', entry_price: 1.85, exit_price: 4.20, position_size: 10, status: 'closed', pnl: 2350, pnl_percent: 127, thesis: 'Copertura a basso costo contro un evento di volatilità in vista di una settimana densa di dati macro e riunioni banche centrali.', lessons: 'La copertura ha pagato perché dimensionata come "polizza assicurativa", non come scommessa direzionale: replicare l\'approccio anche quando l\'evento non si materializza.', daysAgo: 63 },
  { instrument: 'XAU/USD (Oro)', instrument_type: 'Commodity', direction: 'long', strategy: 'trend following su rottura', risk_level: 'medium', entry_price: 2015, exit_price: 2098, position_size: 3, status: 'closed', pnl: 249, pnl_percent: 4.1, thesis: 'Rottura di massimi storici con flussi verso beni rifugio in un contesto di incertezza geopolitica crescente.', lessons: 'Trend seguito correttamente con trailing stop; disciplina nel non anticipare l\'uscita nonostante la tentazione di prendere profitto in anticipo.', daysAgo: 37 },
  { instrument: 'BTC/USD', instrument_type: 'Crypto', direction: 'long', strategy: 'accumulo su ipervenduto', risk_level: 'very high', entry_price: 26400, exit_price: 24100, position_size: 0.4, status: 'closed', pnl: -920, pnl_percent: -8.7, thesis: 'RSI giornaliero in ipervenduto estremo dopo capitolazione; ipotesi di rimbalzo tecnico di breve.', lessons: 'L\'ipervenduto tecnico non ha impedito una nuova gamba ribassista in un contesto macro risk-off: su asset ad alta volatilità serve size più piccola per lo stesso livello di convinzione.', daysAgo: 29 },
  { instrument: 'ESX/DAX Future', instrument_type: 'Future', direction: 'short', strategy: 'dispersion / relative value', risk_level: 'high', entry_price: 18420, exit_price: 18120, position_size: 1, status: 'closed', pnl: 300, pnl_percent: 1.6, thesis: 'Posizionamento relativo contro settore auto tedesco su timori dazi, mantenendo delta netto contenuto rispetto al mercato generale.', lessons: 'La componente relative-value ha funzionato meglio della componente direzionale pura: continuare a strutturare trade con minore esposizione al beta di mercato.', daysAgo: 22 },
  { instrument: 'TLT (Treasury 20+Y ETF)', instrument_type: 'ETF', direction: 'long', strategy: 'duration su pivot Fed atteso', risk_level: 'medium', entry_price: 92.3, exit_price: null, position_size: 60, status: 'open', pnl: null, pnl_percent: null, thesis: 'Posizionamento su duration lunga in vista di un possibile cambio di rotta nella policy dei tassi nei prossimi trimestri.', lessons: '', daysAgo: 12 },
  { instrument: 'NVDA', instrument_type: 'Equity', direction: 'long', strategy: 'momentum su earnings', risk_level: 'high', entry_price: 118.4, exit_price: null, position_size: 25, status: 'open', pnl: null, pnl_percent: null, thesis: 'Continuazione del trend post-earnings con revisioni al rialzo delle stime su domanda data center; stop tecnico sotto la media mobile a 50 giorni.', lessons: '', daysAgo: 8 },
  { instrument: 'USD/JPY', instrument_type: 'Forex', direction: 'short', strategy: 'carry unwind', risk_level: 'high', entry_price: 156.8, exit_price: null, position_size: 15000, status: 'open', pnl: null, pnl_percent: null, thesis: 'Ipotesi di parziale unwind delle posizioni di carry trade in yen in caso di intervento verbale o operativo della BoJ.', lessons: '', daysAgo: 4 },
];

const news = [
  { title: 'La Fed lascia i tassi invariati, ma apre a un possibile taglio nel prossimo trimestre', summary: 'Il FOMC mantiene il target rate invariato per la quarta riunione consecutiva, ma il linguaggio del comunicato segnala maggiore fiducia sul percorso dell\'inflazione verso il target.', category: 'Macro', region: 'North America', importance: 5, sentiment: 'bullish', is_featured: true, daysAgo: 2 },
  { title: 'BCE: Lagarde segnala cautela sui tempi del secondo taglio dei tassi', summary: 'La Banca Centrale Europea conferma l\'orientamento accomodante ma invita a non anticipare i tempi, citando la persistenza dell\'inflazione nei servizi.', category: 'Rates', region: 'Europe', importance: 4, sentiment: 'neutral', is_featured: true, daysAgo: 5 },
  { title: 'Yen ai minimi da 34 anni contro il dollaro, mercati attenti a un possibile intervento BoJ', summary: 'Il differenziale di tassi tra Stati Uniti e Giappone continua a pesare sulla valuta nipponica, alimentando i flussi di carry trade e le attese di intervento verbale delle autorità.', category: 'FX', region: 'Asia', importance: 4, sentiment: 'bearish', is_featured: false, daysAgo: 9 },
  { title: 'Petrolio in rialzo su tensioni geopolitiche in Medio Oriente', summary: 'Il Brent guadagna oltre il 3% in una settimana dopo nuovi episodi di tensione che alimentano timori su possibili interruzioni dell\'offerta.', category: 'Commodities', region: 'Global', importance: 4, sentiment: 'bullish', is_featured: false, daysAgo: 14 },
  { title: 'Bitcoin torna sopra soglia psicologica dopo settimane di consolidamento', summary: 'L\'asset digitale recupera terreno in un contesto di flussi netti positivi sugli ETF spot statunitensi, dopo un periodo prolungato di lateralizzazione.', category: 'Crypto', region: 'Global', importance: 3, sentiment: 'bullish', is_featured: false, daysAgo: 18 },
  { title: 'Trimestrali Big Tech: risultati sopra le attese ma guidance più prudente sul capex', summary: 'Le principali società tecnologiche battono le stime di utile, ma i mercati reagiscono in modo contrastato alle indicazioni più caute sugli investimenti in infrastrutture AI.', category: 'Equities', region: 'North America', importance: 5, sentiment: 'neutral', is_featured: true, daysAgo: 21 },
  { title: 'Cina: nuovo pacchetto di stimolo per il settore immobiliare', summary: 'Pechino annuncia misure aggiuntive a supporto del mercato immobiliare, tra riduzione dei tassi sui mutui e incentivi per gli acquisti nelle grandi città.', category: 'Macro', region: 'Emerging Markets', importance: 3, sentiment: 'bullish', is_featured: false, daysAgo: 26 },
  { title: 'Spread BTP-Bund in restringimento dopo l\'asta di collocamento sopra le attese', summary: 'Il differenziale tra titoli di stato italiani e tedeschi scende ai minimi degli ultimi mesi, sostenuto da una domanda robusta da parte di investitori esteri.', category: 'Rates', region: 'Europe', importance: 3, sentiment: 'bullish', is_featured: false, daysAgo: 30 },
  { title: 'Volatilità in aumento sui mercati emergenti su timori di forza del dollaro', summary: 'L\'indice VIX per i mercati emergenti sale ai massimi del trimestre, mentre diverse valute locali sono sotto pressione per il rafforzamento del biglietto verde.', category: 'FX', region: 'Emerging Markets', importance: 3, sentiment: 'bearish', is_featured: false, daysAgo: 34 },
  { title: 'OPEC+ conferma i tagli alla produzione fino a fine anno', summary: 'Il cartello dei produttori estende le quote di taglio, sostenendo i prezzi ma alimentando dibattito sulla sostenibilità della quota di mercato nel medio periodo.', category: 'Commodities', region: 'Global', importance: 3, sentiment: 'neutral', is_featured: false, daysAgo: 39 },
];

const marketPulse = [
  { city: 'Milano', country: 'Italy', region: 'Europe', lat: 45.46, lng: 9.19, headline: 'FTSE MIB sostenuto dai bancari dopo utili sopra attese', sentiment: 'bullish', indicator_name: 'FTSE MIB', indicator_value: '34.120', change_percent: 0.8, category: 'Equities' },
  { city: 'Francoforte', country: 'Germany', region: 'Europe', lat: 50.11, lng: 8.68, headline: 'DAX in pausa dopo record storici, focus su dati industriali', sentiment: 'neutral', indicator_name: 'DAX 40', indicator_value: '18.480', change_percent: -0.2, category: 'Equities' },
  { city: 'Londra', country: 'United Kingdom', region: 'Europe', lat: 51.51, lng: -0.13, headline: 'Sterlina debole dopo dati inflazione sotto le attese', sentiment: 'bearish', indicator_name: 'GBP/USD', indicator_value: '1.2480', change_percent: -0.5, category: 'FX' },
  { city: 'New York', country: 'United States', region: 'North America', lat: 40.71, lng: -74.01, headline: 'S&P 500 vicino ai massimi, rally guidato dal comparto tech', sentiment: 'bullish', indicator_name: 'S&P 500', indicator_value: '5.320', change_percent: 1.1, category: 'Equities' },
  { city: 'Chicago', country: 'United States', region: 'North America', lat: 41.88, lng: -87.63, headline: 'Volatilità in calo su futures azionari, VIX sotto quota 14', sentiment: 'neutral', indicator_name: 'VIX', indicator_value: '13.8', change_percent: -3.4, category: 'Equities' },
  { city: 'Tokyo', country: 'Japan', region: 'Asia', lat: 35.68, lng: 139.69, headline: 'Nikkei in rialzo, yen debole favorisce gli esportatori', sentiment: 'bullish', indicator_name: 'Nikkei 225', indicator_value: '39.850', change_percent: 1.4, category: 'Equities' },
  { city: 'Hong Kong', country: 'China', region: 'Asia', lat: 22.32, lng: 114.17, headline: 'Hang Seng volatile su nuove misure di stimolo cinesi', sentiment: 'volatile', indicator_name: 'Hang Seng', indicator_value: '17.640', change_percent: 2.1, category: 'Equities' },
  { city: 'Shanghai', country: 'China', region: 'Asia', lat: 31.23, lng: 121.47, headline: 'CSI 300 sostenuto da acquisti istituzionali statali', sentiment: 'bullish', indicator_name: 'CSI 300', indicator_value: '3.580', change_percent: 0.9, category: 'Equities' },
  { city: 'Singapore', country: 'Singapore', region: 'Asia', lat: 1.35, lng: 103.82, headline: 'Flussi stabili sui fondi obbligazionari asiatici in valuta locale', sentiment: 'neutral', indicator_name: 'STI', indicator_value: '3.290', change_percent: 0.1, category: 'Rates' },
  { city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', lat: 25.2, lng: 55.27, headline: 'Petrolio in rialzo su tensioni regionali, riflessi sui listini del Golfo', sentiment: 'bullish', indicator_name: 'Brent', indicator_value: '86.4', change_percent: 2.3, category: 'Commodities' },
  { city: 'San Paolo', country: 'Brazil', region: 'LatAm', lat: -23.55, lng: -46.63, headline: 'Real brasiliano sotto pressione su timori fiscali', sentiment: 'bearish', indicator_name: 'USD/BRL', indicator_value: '5.42', change_percent: 0.9, category: 'FX' },
  { city: 'Toronto', country: 'Canada', region: 'North America', lat: 43.65, lng: -79.38, headline: 'TSX sostenuto dal comparto energetico e minerario', sentiment: 'bullish', indicator_name: 'TSX', indicator_value: '22.140', change_percent: 0.6, category: 'Equities' },
  { city: 'Sydney', country: 'Australia', region: 'Asia', lat: -33.87, lng: 151.21, headline: 'Dollaro australiano in rialzo su dati occupazione forti', sentiment: 'bullish', indicator_name: 'AUD/USD', indicator_value: '0.6620', change_percent: 0.7, category: 'FX' },
  { city: 'Zurigo', country: 'Switzerland', region: 'Europe', lat: 47.38, lng: 8.54, headline: 'Franco svizzero rifugio in una settimana di risk-off parziale', sentiment: 'neutral', indicator_name: 'EUR/CHF', indicator_value: '0.9720', change_percent: -0.3, category: 'FX' },
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const force = !!body?.force;

    const [existingPapers, existingTrades, existingNews, existingPulse] = await Promise.all([
      base44.entities.Paper.list('-created_date', 5).catch(() => []),
      base44.entities.Trade.list('-created_date', 5).catch(() => []),
      base44.entities.NewsItem.list('-created_date', 5).catch(() => []),
      base44.entities.MarketPulse.list('-created_date', 5).catch(() => []),
    ]);

    if (!force && (existingPapers.length || existingTrades.length || existingNews.length || existingPulse.length)) {
      return Response.json({
        skipped: true,
        message: 'Sono già presenti contenuti nel database. Passa force:true per aggiungere comunque i contenuti demo.',
      });
    }

    const now = Date.now();
    const daysAgoIso = (d) => new Date(now - d * 86400000).toISOString();

    const createdPapers = await Promise.all(papers.map((p, i) => base44.entities.Paper.create({
      title: p.title,
      subtitle: p.subtitle,
      abstract: p.abstract,
      content: p.content,
      category: p.category,
      tags: p.tags,
      status: 'published',
      published_date: daysAgoIso(10 + i * 7),
      reading_time_min: p.reading_time_min,
      featured: !!p.featured,
      author_note: p.author_note || '',
    })));

    const createdTrades = await Promise.all(trades.map((t) => base44.entities.Trade.create({
      instrument: t.instrument,
      instrument_type: t.instrument_type,
      direction: t.direction,
      strategy: t.strategy,
      risk_level: t.risk_level,
      entry_price: t.entry_price,
      exit_price: t.exit_price,
      position_size: t.position_size,
      status: t.status,
      pnl: t.pnl,
      pnl_percent: t.pnl_percent,
      thesis: t.thesis,
      lessons: t.lessons,
      open_date: daysAgoIso(t.daysAgo + 6),
      close_date: t.status === 'closed' ? daysAgoIso(t.daysAgo) : null,
    })));

    const createdNews = await Promise.all(news.map((n) => base44.entities.NewsItem.create({
      title: n.title,
      summary: n.summary,
      category: n.category,
      region: n.region,
      importance: n.importance,
      sentiment: n.sentiment,
      is_featured: n.is_featured,
      is_published: true,
      published_date: daysAgoIso(n.daysAgo),
    })));

    const createdPulse = await Promise.all(marketPulse.map((p) => base44.entities.MarketPulse.create({
      city: p.city,
      country: p.country,
      region: p.region,
      lat: p.lat,
      lng: p.lng,
      headline: p.headline,
      sentiment: p.sentiment,
      indicator_name: p.indicator_name,
      indicator_value: p.indicator_value,
      change_percent: p.change_percent,
      category: p.category,
    })));

    return Response.json({
      created: {
        papers: createdPapers.length,
        trades: createdTrades.length,
        news: createdNews.length,
        market_pulse: createdPulse.length,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
