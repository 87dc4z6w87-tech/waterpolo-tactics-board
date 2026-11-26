// ============================================================================
// disegno.js — frecce, penna libera, gomma
// ----------------------------------------------------------------------------
// Strumenti (si scelgono dal pannello della matita, barra sinistra):
//   "nuotata"    freccia a linea continua     = nuotata
//   "passaggio"  freccia tratteggiata         = passaggio
//   "senzaPalla" freccia ondulata             = movimento senza palla
//   "penna"      linea libera senza punta
//   "gomma"      passandoci sopra cancella un disegno
// Con uno strumento attivo le pedine non si spostano: il dito disegna.
// Ogni disegno segue il dito; i punti vengono "ammorbiditi" per avere
// curve morbide anche se la mano trema.
// I punti sono salvati in metri nella vasca (come i pezzi): così i disegni
// restano al loro posto anche cambiando vista.
// ============================================================================

const STILE_DISEGNO = {
  spessore: 0.12,        // spessore delle frecce (metri)
  spessorePenna: 0.1,
  tratto: 0.35,          // tratteggio del passaggio: lunghezza tratto…
  spazio: 0.25,          // …e dello spazio
  ondaAmpiezza: 0.16,    // quanto "oscilla" la freccia ondulata
  ondaLunghezza: 0.7,    // distanza tra due onde
  puntaLunghezza: 0.5,   // punta della freccia
  puntaLarghezza: 0.45,
  passoMinimo: 0.15,     // distanza minima tra due punti registrati
  lunghezzaMinima: 0.4   // un tocco più corto di così non disegna niente
};

// Colori disponibili (il primo è quello di partenza)
const COLORI_DISEGNO = ["#ffffff", "#f8e27e", "#e8344e", "#3d7fc6"];

let strumento = null;               // null = si spostano le pedine
let coloreDisegno = COLORI_DISEGNO[0];
let tracciaInCorso = null;          // il disegno che si sta facendo col dito

const NOMI_STRUMENTI = {
  nuotata: "Freccia nuotata",
  passaggio: "Freccia passaggio",
  senzaPalla: "Movimento senza palla",
  penna: "Penna libera",
  gomma: "Gomma"
};

// Sceglie lo strumento (null = torna a spostare le pedine).
function scegliStrumento(nome) {
  strumento = nome || null;
  if (strumento && modalitaNumeri) attivaModalitaNumeri(false);
  const svg = document.getElementById("lavagna");
  svg.classList.toggle("modalita-disegno", !!strumento);
  svg.classList.toggle("modalita-gomma", strumento === "gomma");
  aggiornaInterfaccia();
  mostraAvviso(strumento ? `${NOMI_STRUMENTI[strumento]}: disegna sul campo` : "Sposta le pedine");
}

// ---------------------------------------------------------------------------
// INPUT: il dito (o il mouse) sul campo quando uno strumento è attivo
// ---------------------------------------------------------------------------
function attivaDisegno() {
  const svg = document.getElementById("lavagna");

  svg.addEventListener("pointerdown", evento => {
    if (!strumento || tracciaInCorso || evento.button > 0) return;
    evento.preventDefault();
    chiudiPannelli();
    svg.setPointerCapture(evento.pointerId);
    if (strumento === "gomma") {
      tracciaInCorso = { id: evento.pointerId, gomma: true, cancellati: 0 };
      cancellaSotto(evento);
      return;
    }
    tracciaInCorso = {
      id: evento.pointerId,
      disegno: { id: nuovoId(), tipo: strumento, colore: coloreDisegno, punti: [puntoInVasca(evento)] }
    };
  });

  svg.addEventListener("pointermove", evento => {
    const t = tracciaInCorso;
    if (!t || evento.pointerId !== t.id) return;
    if (t.gomma) {
      cancellaSotto(evento);
      return;
    }
    const p = puntoInVasca(evento);
    const ultimo = t.disegno.punti[t.disegno.punti.length - 1];
    if (Math.hypot(p.x - ultimo.x, p.y - ultimo.y) < STILE_DISEGNO.passoMinimo) return;
    t.disegno.punti.push(p);
    mostraTraccia(t.disegno);
  });

  const fine = evento => {
    const t = tracciaInCorso;
    if (!t || evento.pointerId !== t.id) return;
    tracciaInCorso = null;
    document.getElementById("traccia")?.remove();
    if (t.gomma) {
      if (t.cancellati > 0) salvaStato();
      return;
    }
    // Aggiunge il disegno solo se è abbastanza lungo (un tocco non conta)
    if (evento.type === "pointerup" && lunghezzaPunti(t.disegno.punti) >= STILE_DISEGNO.lunghezzaMinima) {
      Stato.disegni.push(t.disegno);
      disegnaDisegni();
      salvaStato();
    }
  };
  svg.addEventListener("pointerup", fine);
  svg.addEventListener("pointercancel", fine);
}

// Posizione del dito in metri nella vasca (arrotondata al centimetro).
function puntoInVasca(evento) {
  const p = puntoNelloSVG(evento);
  const [x, y] = Vista.daSchermo(p.x, p.y);
  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
}

// Gomma: cancella il disegno che si trova sotto al dito.
function cancellaSotto(evento) {
  const elemento = document.elementFromPoint(evento.clientX, evento.clientY);
  const g = elemento && elemento.closest("[data-disegno]");
  if (!g) return;
  Stato.disegni = Stato.disegni.filter(d => d.id !== g.dataset.disegno);
  g.remove();
  tracciaInCorso.cancellati++;
}

// Cancella tutti i disegni (si può annullare).
function cancellaTuttiDisegni() {
  if (Stato.disegni.length === 0) return;
  Stato.disegni = [];
  disegnaDisegni();
  salvaStato();
  mostraAvviso("Disegni cancellati (puoi annullare)");
}

// ---------------------------------------------------------------------------
// DISEGNO SULLO SCHERMO
// ---------------------------------------------------------------------------
function disegnaDisegni() {
  const strato = document.getElementById("strato-disegni");
  strato.replaceChildren();
  for (const d of Stato.disegni) creaFormaDisegno(d, strato);
}

// Mentre il dito si muove: ridisegna la traccia provvisoria.
function mostraTraccia(disegno) {
  document.getElementById("traccia")?.remove();
  const g = creaFormaDisegno(disegno, document.getElementById("strato-disegni"));
  g.id = "traccia";
}

// Crea il gruppo SVG di un disegno dentro "genitore" e lo restituisce.
function creaFormaDisegno(disegno, genitore) {
  const g = creaSVG("g", { "data-disegno": disegno.id }, genitore);
  // Punti nello schermo, poi ammorbiditi
  const grezzi = disegno.punti.map(p => {
    const [x, y] = Vista.aSchermo(p.x, p.y);
    return { x, y };
  });
  let linea = ammorbidisci(grezzi);
  if (linea.length < 2) return g;

  const stile = STILE_DISEGNO;
  const conPunta = disegno.tipo !== "penna";
  const lunghezza = lunghezzaPunti(linea);
  let punta = null;

  if (conPunta) {
    // La punta segue la direzione degli ultimi ~50 cm del disegno
    const lunghezzaPunta = Math.min(stile.puntaLunghezza, lunghezza * 0.5);
    const cima = linea[linea.length - 1];
    const dietro = puntoAllaDistanza(linea, Math.max(0, lunghezza - Math.max(lunghezzaPunta, 0.5)));
    let dx = cima.x - dietro.x;
    let dy = cima.y - dietro.y;
    const n = Math.hypot(dx, dy) || 1;
    dx /= n;
    dy /= n;
    const base = { x: cima.x - dx * lunghezzaPunta, y: cima.y - dy * lunghezzaPunta };
    const mezza = (stile.puntaLarghezza * lunghezzaPunta / stile.puntaLunghezza) / 2;
    punta = [
      cima,
      { x: base.x - dy * mezza, y: base.y + dx * mezza },
      { x: base.x + dy * mezza, y: base.y - dx * mezza }
    ];
    // La linea finisce sotto la punta (così non spunta oltre)
    linea = accorcia(linea, lunghezzaPunta * 0.8);
  }

  const lineaDaDisegnare = disegno.tipo === "senzaPalla" ? onda(linea) : linea;
  const tracciato = creaSVG("path", {
    d: percorso(lineaDaDisegnare),
    fill: "none",
    stroke: disegno.colore,
    "stroke-width": disegno.tipo === "penna" ? stile.spessorePenna : stile.spessore,
    "stroke-linecap": disegno.tipo === "passaggio" ? "butt" : "round",
    "stroke-linejoin": "round",
    "pointer-events": "none"
  }, g);
  if (disegno.tipo === "passaggio") {
    tracciato.setAttribute("stroke-dasharray", `${stile.tratto} ${stile.spazio}`);
  }
  if (punta) {
    creaSVG("polygon", {
      points: punta.map(p => `${p.x},${p.y}`).join(" "),
      fill: disegno.colore,
      "stroke-linejoin": "round",
      "pointer-events": "none"
    }, g);
  }
  // Linea invisibile più larga: è quella che la gomma "tocca"
  creaSVG("path", {
    d: percorso(grezzi),
    class: "colpo",
    fill: "none",
    stroke: "transparent",
    "stroke-width": 0.8
  }, g);
  return g;
}

// ---------------------------------------------------------------------------
// GEOMETRIA (punti = elenchi di {x, y})
// ---------------------------------------------------------------------------

// Percorso SVG che passa per tutti i punti: "M x y L x y L x y ..."
function percorso(punti) {
  return punti.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(" ");
}

function lunghezzaPunti(punti) {
  let totale = 0;
  for (let i = 1; i < punti.length; i++) {
    totale += Math.hypot(punti[i].x - punti[i - 1].x, punti[i].y - punti[i - 1].y);
  }
  return totale;
}

// Ammorbidisce una linea spezzata (metodo di Chaikin): ogni segmento viene
// sostituito da due punti al 25% e al 75%. Ripetuto 2 volte = curve morbide.
// Il primo e l'ultimo punto restano dove sono.
function ammorbidisci(punti, volte = 2) {
  let p = punti;
  for (let k = 0; k < volte && p.length >= 3; k++) {
    const nuovi = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i];
      const b = p[i + 1];
      nuovi.push({ x: a.x + (b.x - a.x) * 0.25, y: a.y + (b.y - a.y) * 0.25 });
      nuovi.push({ x: a.x + (b.x - a.x) * 0.75, y: a.y + (b.y - a.y) * 0.75 });
    }
    nuovi.push(p[p.length - 1]);
    p = nuovi;
  }
  return p;
}

// Il punto che si trova a "distanza" metri dall'inizio della linea.
function puntoAllaDistanza(punti, distanza) {
  let percorsa = 0;
  for (let i = 1; i < punti.length; i++) {
    const a = punti[i - 1];
    const b = punti[i];
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (percorsa + l >= distanza) {
      const t = l ? (distanza - percorsa) / l : 0;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    percorsa += l;
  }
  return punti[punti.length - 1];
}

// Toglie "quanto" metri dalla fine della linea.
function accorcia(punti, quanto) {
  const nuovaLunghezza = lunghezzaPunti(punti) - quanto;
  if (nuovaLunghezza <= 0) return [punti[0], punti[0]];
  const risultato = [punti[0]];
  let percorsa = 0;
  for (let i = 1; i < punti.length; i++) {
    const l = Math.hypot(punti[i].x - punti[i - 1].x, punti[i].y - punti[i - 1].y);
    if (percorsa + l >= nuovaLunghezza) {
      risultato.push(puntoAllaDistanza(punti, nuovaLunghezza));
      return risultato;
    }
    percorsa += l;
    risultato.push(punti[i]);
  }
  return risultato;
}

// Trasforma una linea in un'onda che la segue: ogni 5 cm si calcola il punto
// sulla linea e lo si sposta di lato (perpendicolare) secondo un seno.
// All'inizio e alla fine l'onda si smorza, così la punta resta allineata.
function onda(punti) {
  const { ondaAmpiezza: A, ondaLunghezza: lambda } = STILE_DISEGNO;
  const totale = lunghezzaPunti(punti);
  const passo = 0.05;
  const risultato = [];
  let i = 1;
  let inizioSegmento = 0;
  for (let s = 0; s <= totale; s += passo) {
    // Trova il segmento in cui cade la distanza s
    let a = punti[i - 1];
    let b = punti[i];
    let l = Math.hypot(b.x - a.x, b.y - a.y);
    while (inizioSegmento + l < s && i < punti.length - 1) {
      inizioSegmento += l;
      i++;
      a = punti[i - 1];
      b = punti[i];
      l = Math.hypot(b.x - a.x, b.y - a.y);
    }
    const t = l ? (s - inizioSegmento) / l : 0;
    const tx = l ? (b.x - a.x) / l : 1;
    const ty = l ? (b.y - a.y) / l : 0;
    const smorza = Math.min(1, s / 0.3, (totale - s) / 0.3);
    const scarto = A * smorza * Math.sin((2 * Math.PI * s) / lambda);
    risultato.push({ x: a.x + (b.x - a.x) * t - ty * scarto, y: a.y + (b.y - a.y) * t + tx * scarto });
  }
  risultato.push(punti[punti.length - 1]);
  return risultato;
}
