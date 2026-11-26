// ============================================================================
// giocatori.js — pedine, pallone, trascinamento, numeri
// ----------------------------------------------------------------------------
// Ogni pezzo è un gruppo SVG <g> spostato con transform="translate(x y)".
// Il trascinamento usa i "Pointer Events": lo stesso codice funziona
// con il mouse, con il dito e con la penna del tablet.
//
// MODALITÀ NUMERI: toccando il pulsante # si entra in una modalità in cui
// toccare una pedina apre il menu rapido per sceglierne il numero
// (invece di trascinarla). Si esce toccando di nuovo #.
// ============================================================================

const RAGGIO_GIOCATORE = 0.55;  // in metri
const RAGGIO_PALLONE = 0.28;
// Voci del menu rapido dei numeri: da 1 a 14 più "C" (capitano)
const VOCI_NUMERI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, "C"];

// Colori piatti delle pedine: riempimento e bordo più scuro
const COLORI_PEDINE = {
  rossa:    { riempimento: "#e8344e", bordo: "#c4243c" },
  blu:      { riempimento: "#3d7fc6", bordo: "#2c64a3" },
  portiere: { riempimento: "#a3a8b0", bordo: "#868b94" },
  pallone:  { riempimento: "#f8e27e", bordo: "#e2c65a" }
};

let modalitaNumeri = false;   // true quando il pulsante # è attivo
let pezzoDaNumerare = null;   // la pedina di cui si sta scegliendo il numero

// Ridisegna tutti i pezzi a partire dallo Stato.
function disegnaPezzi() {
  const strato = document.getElementById("strato-pezzi");
  strato.replaceChildren();
  // Il pallone per ultimo, così resta sopra ai giocatori
  const ordinati = [...Stato.pezzi].sort((a, b) => (a.tipo === "pallone") - (b.tipo === "pallone"));
  for (const pezzo of ordinati) {
    strato.appendChild(creaDisco(pezzo));
  }
}

// Sposta il gruppo SVG nella posizione (in schermo) del pezzo.
function posiziona(g, pezzo) {
  const [sx, sy] = Vista.aSchermo(pezzo.x, pezzo.y);
  g.setAttribute("transform", `translate(${sx} ${sy})`);
}

// Crea il disegno di un pezzo: un disco pieno con un bordo più scuro.
function creaDisco(pezzo) {
  const g = creaSVG("g", { class: "pezzo", "data-id": pezzo.id });
  posiziona(g, pezzo);

  if (pezzo.tipo === "pallone") {
    // Cerchio invisibile più grande: rende il pallone facile da prendere col dito
    creaSVG("circle", { r: 0.7, fill: "transparent" }, g);
    const c = COLORI_PEDINE.pallone;
    creaSVG("circle", { r: RAGGIO_PALLONE, fill: c.riempimento, stroke: c.bordo, "stroke-width": 0.05 }, g);
  } else {
    if (pezzo.tipo === "portiere") {
      // Portiere: disco grigio con un anello spesso del colore della squadra
      const c = COLORI_PEDINE.portiere;
      const anello = 0.14;
      creaSVG("circle", {
        r: RAGGIO_GIOCATORE - anello / 2, fill: c.riempimento,
        stroke: COLORI_PEDINE[pezzo.squadra].riempimento, "stroke-width": anello
      }, g);
    } else {
      const c = COLORI_PEDINE[pezzo.squadra];
      creaSVG("circle", { r: RAGGIO_GIOCATORE, fill: c.riempimento, stroke: c.bordo, "stroke-width": 0.07 }, g);
    }
    if (pezzo.numero) {
      const testo = creaSVG("text", {
        "text-anchor": "middle", "dominant-baseline": "central",
        "font-size": 0.58, "font-weight": 700, fill: "#ffffff",
        "font-family": "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        "pointer-events": "none"
      }, g);
      testo.textContent = pezzo.numero;
    }
  }

  attivaTrascinamento(g, pezzo);
  return g;
}

// Durante il trascinamento il pezzo può uscire dal campo (per toglierlo),
// ma non troppo, così resta sempre visibile.
function limitaTrascinamento(x, y) {
  const { L, W } = dimensioniCampo();
  const m = 1.2;
  x = Math.min(Math.max(x, -m), L + m);
  y = Math.min(Math.max(y, -m), W + m);
  return [x, y];
}

// true se il centro del pezzo è fuori dall'acqua
// (in vista metà campo conta come "fuori" anche tutto quello oltre la metà campo).
function fuoriDalCampo(x, y) {
  const { L, W } = dimensioniCampo();
  if (Stato.impostazioni.vista === "meta" && x < L / 2) return true;
  return x < 0 || x > L || y < 0 || y > W;
}

// Se (x, y) è dentro una porta restituisce la posizione "sistemata" ben dentro
// la rete; altrimenti null. Serve per il pallone: lasciato in porta = gol.
function posizioneInPorta(x, y) {
  const { L, W } = dimensioniCampo();
  const porta = DATI.campo.porta;
  const tolleranza = 0.3; // un po' di margine attorno alla porta, per il dito
  const y1 = W / 2 - porta.larghezza / 2;
  const y2 = W / 2 + porta.larghezza / 2;
  if (y < y1 - tolleranza || y > y2 + tolleranza) return null;
  const dentro = RAGGIO_PALLONE + 0.1; // distanza minima dai pali e dalla rete
  const yInPorta = Math.min(Math.max(y, y1 + dentro), y2 - dentro);
  if (x > L && x <= L + porta.profondita + tolleranza) {
    return [Math.min(Math.max(x, L + dentro), L + porta.profondita - dentro), yInPorta];
  }
  if (x < 0 && x >= -porta.profondita - tolleranza) {
    return [Math.max(Math.min(x, -dentro), -porta.profondita + dentro), yInPorta];
  }
  return null;
}

// true se il pezzo è il pallone e si trova dentro una porta.
function palloneInPorta(pezzo) {
  return pezzo.tipo === "pallone" && posizioneInPorta(pezzo.x, pezzo.y) !== null;
}

// Rende un pezzo trascinabile (o numerabile, in modalità numeri).
function attivaTrascinamento(g, pezzo) {
  let presa = null; // informazioni sul trascinamento in corso

  g.addEventListener("pointerdown", evento => {
    if (evento.button > 0) return; // solo tasto sinistro / dito
    evento.preventDefault();
    evento.stopPropagation();
    chiudiPannelli();

    // In modalità numeri un tocco su una pedina apre il menu rapido
    if (modalitaNumeri && pezzo.tipo !== "pallone") {
      apriMenuNumero(pezzo, g);
      return;
    }

    g.parentNode.appendChild(g);           // porta il pezzo in primo piano
    g.setPointerCapture(evento.pointerId); // continua a ricevere il movimento anche fuori dal disco
    // Distanza tra il dito e il centro del disco: così il disco non "salta" sotto il dito
    const punto = puntoNelloSVG(evento);
    const [sx, sy] = Vista.aSchermo(pezzo.x, pezzo.y);
    // Posizione di partenza: se il pezzo viene lasciato fuori per sbaglio
    // con un "pointercancel" (es. notifica di sistema), torna qui.
    presa = { id: evento.pointerId, dx: sx - punto.x, dy: sy - punto.y, x0: pezzo.x, y0: pezzo.y };
    g.classList.add("preso");
  });

  g.addEventListener("pointermove", evento => {
    if (!presa || evento.pointerId !== presa.id) return;
    const punto = puntoNelloSVG(evento);
    const [x, y] = Vista.daSchermo(punto.x + presa.dx, punto.y + presa.dy);
    [pezzo.x, pezzo.y] = limitaTrascinamento(x, y);
    posiziona(g, pezzo);
    // Difesa a uomo / pressing attiva (vedi formazioni.js):
    //  - si muove la palla o un attaccante → i difensori lo seguono
    //  - si muove a mano un difensore → la difesa smette di seguire
    if (Stato.difesaAttiva && pezzo.tipo !== "portiere") {
      if (pezzo.tipo === "pallone" || pezzo.squadra === Stato.squadraInAttacco) aggiornaMarcature();
      else Stato.difesaAttiva = null;
    }
    // Fuori dal campo il pezzo diventa trasparente: lasciandolo lì viene tolto.
    // Eccezione: il pallone dentro la porta (è un gol, non viene tolto).
    g.classList.toggle("fuori", fuoriDalCampo(pezzo.x, pezzo.y) && !palloneInPorta(pezzo));
  });

  const fine = evento => {
    if (!presa || evento.pointerId !== presa.id) return;
    // Pallone lasciato in porta: resta lì, sistemato dentro la rete
    if (evento.type === "pointerup" && palloneInPorta(pezzo)) {
      [pezzo.x, pezzo.y] = posizioneInPorta(pezzo.x, pezzo.y);
      posiziona(g, pezzo);
      presa = null;
      g.classList.remove("preso", "fuori");
      mostraAvviso("Gol!");
      salvaStato();
      return;
    }
    const fuori = fuoriDalCampo(pezzo.x, pezzo.y);
    if (fuori && evento.type === "pointercancel") {
      [pezzo.x, pezzo.y] = [presa.x0, presa.y0];
      posiziona(g, pezzo);
    }
    presa = null;
    g.classList.remove("preso", "fuori");
    if (fuori && evento.type === "pointerup") rimuoviPezzo(pezzo.id);
    salvaStato();
  };
  g.addEventListener("pointerup", fine);
  g.addEventListener("pointercancel", fine);
}

// ---------------------------------------------------------------------------
// NUMERI (menu rapido)
// ---------------------------------------------------------------------------
function attivaModalitaNumeri(attiva) {
  modalitaNumeri = attiva;
  document.getElementById("lavagna").classList.toggle("modalita-numeri", attiva);
  mostraAvviso(attiva ? "Tocca una pedina per darle un numero" : "Numerazione terminata");
}

// Apre il menu dei numeri accanto alla pedina toccata.
function apriMenuNumero(pezzo, g) {
  pezzoDaNumerare = pezzo;
  const pannello = document.getElementById("pannello-numero");
  const nomeSquadra = pezzo.squadra === "rossa" ? "rossa" : "blu";
  document.getElementById("titolo-numero").textContent =
    (pezzo.tipo === "portiere" ? "Portiere " : "Pedina ") + nomeSquadra;

  // Griglia 1…14 + C: il numero attuale è evidenziato, quelli già usati
  // da un compagno di squadra sono più chiari (ma si possono scegliere lo stesso)
  const griglia = document.getElementById("griglia-numeri");
  griglia.replaceChildren();
  const usati = new Set(Stato.pezzi
    .filter(p => p.squadra === pezzo.squadra && p.id !== pezzo.id)
    .map(p => p.numero));
  for (const n of VOCI_NUMERI) {
    const b = document.createElement("button");
    b.dataset.numero = n;
    b.textContent = n;
    if (pezzo.numero === n) b.classList.add("scelto");
    if (usati.has(n)) b.classList.add("usato");
    griglia.appendChild(b);
  }

  // Posizione: a destra della pedina se c'è spazio, altrimenti a sinistra
  pannello.classList.add("aperto");
  const r = g.getBoundingClientRect();
  const larghezza = pannello.offsetWidth;
  const altezza = pannello.offsetHeight;
  let left = r.right + 10;
  if (left + larghezza > window.innerWidth - 10) left = r.left - larghezza - 10;
  const top = Math.min(Math.max(10, r.top + r.height / 2 - altezza / 2), window.innerHeight - altezza - 10);
  pannello.style.left = `${Math.max(10, left)}px`;
  pannello.style.right = "";
  pannello.style.top = `${top}px`;
}

// Assegna il numero scelto nel menu ("nessuno" = toglie il numero, "C" = capitano).
function scegliNumero(valore) {
  if (!pezzoDaNumerare) return;
  if (valore === "nessuno") pezzoDaNumerare.numero = null;
  else if (valore === "C") pezzoDaNumerare.numero = "C";
  else pezzoDaNumerare.numero = Number(valore);
  pezzoDaNumerare = null;
  chiudiPannelli();
  disegnaPezzi();
  salvaStato();
}

// ---------------------------------------------------------------------------
// AGGIUNGERE E TOGLIERE
// ---------------------------------------------------------------------------
function rimuoviPezzo(id) {
  Stato.pezzi = Stato.pezzi.filter(p => p.id !== id);
  disegnaPezzi();
  mostraAvviso("Tolto dal campo");
}

// Aggiunge un pezzo al centro della zona visibile (senza numero).
function aggiungiPezzo(tipo, squadra) {
  const { L, W } = dimensioniCampo();
  const xCentro = Stato.impostazioni.vista === "meta" ? L * 0.75 : L / 2;
  // Piccolo spostamento, così più pezzi aggiunti di fila non si sovrappongono del tutto
  const scarto = (Stato.pezzi.length % 5) * 0.5 - 1;
  const nuovo = { id: nuovoId(), tipo, x: xCentro + scarto, y: W / 2 + scarto };
  if (tipo !== "pallone") {
    nuovo.squadra = squadra;
    nuovo.numero = null;
  }
  Stato.pezzi.push(nuovo);
  disegnaPezzi();
  salvaStato();
}

// Scambia i colori: i rossi diventano blu e viceversa.
// Le posizioni restano: quindi ora attacca l'altro colore.
function invertiSquadre() {
  for (const p of Stato.pezzi) {
    if (p.squadra === "rossa") p.squadra = "blu";
    else if (p.squadra === "blu") p.squadra = "rossa";
  }
  Stato.squadraInAttacco = squadraInDifesa();
  Stato.difesaAttiva = null; // ora chi marcava attacca: la marcatura non vale più
  disegnaPezzi();
  salvaStato();
}
