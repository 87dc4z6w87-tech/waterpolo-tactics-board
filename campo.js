// ============================================================================
// campo.js — disegno della vasca e gestione della vista
// ----------------------------------------------------------------------------
// IDEA CHIAVE: dentro l'SVG l'unità di misura è il metro.
// Il campo viene sempre disegnato "orizzontale" (porte a sinistra e destra).
// Per la vista "metà campo" il disegno viene ruotato di 90° in modo che la
// porta di destra finisca in alto, e la metà di sinistra viene nascosta.
//
// L'oggetto Vista converte tra:
//   - coordinate della VASCA (x, y in metri, sempre le stesse)
//   - coordinate dello SCHERMO (come appaiono nella vista scelta)
// I giocatori sono salvati in coordinate della vasca: per questo cambiando
// vista restano esattamente dove sono.
// ============================================================================

// Spazio attorno alla vasca (in metri) per le porte
const MARGINE = 1.4;

// Aspetto delle linee del campo (spessori e misure in metri)
const STILE_CAMPO = {
  acqua:      { fill: "rgba(70, 130, 220, 0.13)" },
  bordo:      { stroke: "#ffffff", "stroke-width": 0.14 },  // le linee di porta bianche
  bordoRaggio: 0.3,                                         // angoli arrotondati della vasca
  lineaMeta:  { stroke: "rgba(255,255,255,0.4)", "stroke-width": 0.07 },
  lineaVerde: { stroke: "#3fbf6f", "stroke-width": 0.12 },
  linea2m:    { stroke: "#e5484d", "stroke-width": 0.12 },
  area:       { fill: "rgba(229,72,77,0.06)", stroke: "#e5484d", "stroke-width": 0.12 },
  areaRaggio: 0.35,     // angoli arrotondati dell'area tratteggiata
  porta:      { fill: "rgba(8,16,36,0.55)", stroke: "#ffffff", "stroke-width": 0.16 },
  portaRaggio: 0.35,    // angoli arrotondati della porta
  // Tratteggio: lunghezza del tratto e dello spazio (in metri)
  tratto: 0.4,
  spazio: 0.22
};

const Vista = {
  // Da vasca (x, y) a schermo (sx, sy)
  aSchermo(x, y) {
    if (Stato.impostazioni.vista === "meta") {
      const { L } = dimensioniCampo();
      return [y, L - x];   // rotazione di 90°: la porta di destra va in alto
    }
    return [x, y];
  },
  // Da schermo (sx, sy) a vasca (x, y): l'operazione inversa
  daSchermo(sx, sy) {
    if (Stato.impostazioni.vista === "meta") {
      const { L } = dimensioniCampo();
      return [L - sy, sx];
    }
    return [sx, sy];
  }
};

// Prepara l'SVG per la vista scelta: quale zona inquadrare (viewBox),
// rotazione del campo e ritaglio della metà nascosta.
function aggiornaVista() {
  const svg = document.getElementById("lavagna");
  const stratoCampo = document.getElementById("strato-campo");
  const contenuto = document.getElementById("contenuto");
  const ritaglio = document.getElementById("rettangolo-ritaglio");
  const { L, W } = dimensioniCampo();

  if (Stato.impostazioni.vista === "meta") {
    const altezzaVisibile = L / 2; // esattamente fino alla metà campo
    svg.setAttribute("viewBox", `${-MARGINE} ${-MARGINE} ${W + 2 * MARGINE} ${altezzaVisibile + MARGINE + 0.3}`);
    // rotate(-90) gira il disegno, translate lo riporta nell'inquadratura
    stratoCampo.setAttribute("transform", `translate(0 ${L}) rotate(-90)`);
    // Nasconde tutto quello che sta sotto la metà campo
    ritaglio.setAttribute("x", -100);
    ritaglio.setAttribute("y", -100);
    ritaglio.setAttribute("width", W + 200);
    ritaglio.setAttribute("height", altezzaVisibile + 100);
    contenuto.setAttribute("clip-path", "url(#ritaglio)");
  } else {
    svg.setAttribute("viewBox", `${-MARGINE} ${-MARGINE} ${L + 2 * MARGINE} ${W + 2 * MARGINE}`);
    stratoCampo.removeAttribute("transform");
    contenuto.removeAttribute("clip-path");
  }
}

// Rende "pulito" il tratteggio di una linea: calcola tratti e spazi in modo
// che la linea cominci e finisca con un tratto intero (senza pezzetti tagliati).
// Funziona con linee e percorsi già inseriti nella pagina.
function tratteggiaBene(elemento, tratto = STILE_CAMPO.tratto, spazio = STILE_CAMPO.spazio) {
  const lunghezza = elemento.getTotalLength();
  // Quanti tratti ci stanno, arrotondando
  const n = Math.max(1, Math.round((lunghezza + spazio) / (tratto + spazio)));
  // Fattore per allungare/accorciare di poco tratti e spazi finché riempiono la linea esatta
  const k = lunghezza / (n * tratto + (n - 1) * spazio);
  elemento.setAttribute("stroke-dasharray", `${tratto * k} ${spazio * k}`);
}

// Disegna la vasca (sempre in orizzontale, in coordinate della vasca).
function disegnaCampo() {
  const g = document.getElementById("strato-campo");
  g.replaceChildren(); // cancella il disegno precedente
  const { L, W } = dimensioniCampo();
  const c = DATI.campo;
  const lineaVerde = campoScelto().lineaVerde;

  // Acqua
  const rb = STILE_CAMPO.bordoRaggio;
  creaSVG("rect", { x: 0, y: 0, width: L, height: W, rx: rb, ...STILE_CAMPO.acqua }, g);

  // Linea di metà campo (leggera, tratteggiata): solo nella vista campo intero
  if (Stato.impostazioni.vista !== "meta") {
    tratteggiaBene(creaSVG("line", { x1: L / 2, y1: 0, x2: L / 2, y2: W, ...STILE_CAMPO.lineaMeta }, g), 0.25, 0.25);
  }

  // Linee verdi tratteggiate, da bordo a bordo
  for (const x of [lineaVerde, L - lineaVerde]) {
    tratteggiaBene(creaSVG("line", { x1: x, y1: 0, x2: x, y2: W, ...STILE_CAMPO.lineaVerde }, g));
  }

  if (Stato.impostazioni.tipoCampo === "fin") {
    // PallanuotoItalia: solo la linea dei 2 metri, rossa tratteggiata
    for (const x of [c.linea2m, L - c.linea2m]) {
      tratteggiaBene(creaSVG("line", { x1: x, y1: 0, x2: x, y2: W, ...STILE_CAMPO.linea2m }, g));
    }
  } else {
    // Internazionale: area tratteggiata rossa intorno a ciascuna porta,
    // aperta sulla linea di porta e con gli angoli verso il campo arrotondati
    const a = c.areaInternazionale;
    const ra = STILE_CAMPO.areaRaggio;
    const y1 = W / 2 - a.larghezza / 2;
    const y2 = W / 2 + a.larghezza / 2;
    const p = a.profondita;
    const sinistra = `M 0 ${y1} H ${p - ra} A ${ra} ${ra} 0 0 1 ${p} ${y1 + ra}
                      V ${y2 - ra} A ${ra} ${ra} 0 0 1 ${p - ra} ${y2} H 0`;
    const destra = `M ${L} ${y1} H ${L - p + ra} A ${ra} ${ra} 0 0 0 ${L - p} ${y1 + ra}
                    V ${y2 - ra} A ${ra} ${ra} 0 0 0 ${L - p + ra} ${y2} H ${L}`;
    for (const d of [sinistra, destra]) {
      tratteggiaBene(creaSVG("path", { d, ...STILE_CAMPO.area }, g));
    }
  }

  disegnaBordo(g, L, W);
  disegnaPorte(g, L, W);
}

// Bordo della vasca: linee di porta bianche, lati lunghi colorati
// (rosso, giallo, verde) secondo le distanze di DATI.campo.fasce.
function disegnaBordo(g, L, W) {
  const r = STILE_CAMPO.bordoRaggio;
  const spessore = STILE_CAMPO.bordo["stroke-width"];
  const fasce = DATI.campo.fasce;
  const colorePrimo = fasce[0].colore; // gli angoli prendono il colore della prima zona (rosso)

  // Linee di porta (lati corti), bianche
  creaSVG("line", { x1: 0, y1: r, x2: 0, y2: W - r, ...STILE_CAMPO.bordo }, g);
  creaSVG("line", { x1: L, y1: r, x2: L, y2: W - r, ...STILE_CAMPO.bordo }, g);

  // Lati lunghi: un segmento per ogni zona, su entrambe le metà e su entrambi i lati
  for (const y of [0, W]) {
    let inizio = 0;
    for (const fascia of fasce) {
      const fine = fascia.fino === "meta" ? L / 2 : fascia.fino;
      const da = Math.max(inizio, r); // il primo segmento parte dopo l'angolo
      const stile = { stroke: fascia.colore, "stroke-width": spessore };
      creaSVG("line", { x1: da, y1: y, x2: fine, y2: y, ...stile }, g);          // metà sinistra
      creaSVG("line", { x1: L - fine, y1: y, x2: L - da, y2: y, ...stile }, g);  // metà destra
      inizio = fine;
    }
  }

  // Quattro angoli arrotondati
  const angoli = [
    `M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0`,
    `M ${L - r} 0 A ${r} ${r} 0 0 1 ${L} ${r}`,
    `M ${L} ${W - r} A ${r} ${r} 0 0 1 ${L - r} ${W}`,
    `M ${r} ${W} A ${r} ${r} 0 0 1 0 ${W - r}`
  ];
  for (const d of angoli) {
    creaSVG("path", { d, fill: "none", stroke: colorePrimo, "stroke-width": spessore }, g);
  }
}

// Porte: forma a "U" fuori dal bordo, aperta verso il campo, con gli angoli
// esterni arrotondati. I pali poggiano sul bordo della vasca.
// Nel percorso SVG: M = vai a, H = linea orizzontale, V = linea verticale,
// A = arco (serve per gli angoli arrotondati).
function disegnaPorte(g, L, W) {
  const p = DATI.campo.porta;
  const r = STILE_CAMPO.portaRaggio;
  const y1 = W / 2 - p.larghezza / 2;
  const y2 = W / 2 + p.larghezza / 2;
  const fuori = p.profondita;
  // porta di destra
  creaSVG("path", {
    d: `M ${L} ${y1} H ${L + fuori - r} A ${r} ${r} 0 0 1 ${L + fuori} ${y1 + r}
        V ${y2 - r} A ${r} ${r} 0 0 1 ${L + fuori - r} ${y2} H ${L}`,
    ...STILE_CAMPO.porta
  }, g);
  // porta di sinistra (uguale, specchiata)
  creaSVG("path", {
    d: `M 0 ${y1} H ${-fuori + r} A ${r} ${r} 0 0 0 ${-fuori} ${y1 + r}
        V ${y2 - r} A ${r} ${r} 0 0 0 ${-fuori + r} ${y2} H 0`,
    ...STILE_CAMPO.porta
  }, g);
}
