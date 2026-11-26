// ============================================================================
// formazioni.js — applica le formazioni di dati.js
// ----------------------------------------------------------------------------
// Una formazione sposta UNA squadra (attacco oppure difesa).
// Come vengono scelti i giocatori da spostare:
//   ogni posizione della formazione viene data al giocatore libero più vicino.
//   Così ognuno fa il movimento più corto possibile e i numeri restano
//   "sensati" (il centroboa resta centroboa, ecc.).
// Dopo il calcolo i pezzi scivolano nella nuova posizione (animazione).
// ============================================================================

const DURATA_ANIMAZIONE = 450; // millisecondi

// Applica la formazione con quell'id (vedi "formazioni" in dati.js).
function applicaFormazione(id) {
  const formazione = DATI.formazioni.find(f => f.id === id);
  if (!formazione) return;
  // Formazione senza posizioni per questo campo (es. superiorità sul campo piccoli)
  const elenco = formazione.posizioni || formazione.posizioniPalla;
  if (elenco && !elenco[chiaveNumeroGiocatori()]) {
    mostraAvviso(`${formazione.nome}: non disponibile su questo campo`);
    return;
  }

  // Ricorda dove sono i pezzi adesso, per animare lo spostamento
  const prima = new Map(Stato.pezzi.map(p => [p.id, { x: p.x, y: p.y }]));

  let messaggio = formazione.nome;
  if (formazione.squadra === "attacco") {
    applicaAttacco(formazione);
    // Alcuni attacchi portano con sé una difesa (es. Schierati → Difesa a uomo)
    const difesa = DATI.formazioni.find(f => f.id === formazione.conDifesa);
    if (difesa) {
      const prima = Stato.pezzi.length;
      applicaDifesa(difesa);
      if (difesa.espulso) {
        if (Stato.pezzi.length < prima) messaggio += " · un difensore espulso";
      } else {
        messaggio += ` + ${difesa.nome}`;
      }
    }
  } else {
    applicaDifesa(formazione);
  }

  disegnaPezzi();
  animaDa(prima);
  salvaStato();
  mostraAvviso(messaggio);
}

// Gli attaccanti di movimento (portiere escluso).
function attaccantiInGioco() {
  return Stato.pezzi.filter(p => p.squadra === Stato.squadraInAttacco && p.tipo === "giocatore");
}

// Posizione del portiere: al centro della porta, quasi sulla linea (dati.js)
function posizionePortiere(porta) {
  return daRelativaAMetri({ porta, d: DATI.campo.distanzaPortiere, l: 0 });
}

// Chiave per le liste "7" / "6" di dati.js, secondo il campo scelto.
function chiaveNumeroGiocatori() {
  return String(campoScelto().giocatori);
}

// --------------------------------------------------------------------------
// ATTACCO: posizioni fisse prese da dati.js
// --------------------------------------------------------------------------
function applicaAttacco(f) {
  const squadra = Stato.squadraInAttacco;
  const k = chiaveNumeroGiocatori();
  const destinazioni = f.posizioni[k].map(daRelativaAMetri);
  const giocatori = Stato.pezzi.filter(p => p.squadra === squadra && p.tipo === "giocatore");
  sistemaSuPosizioni(giocatori, destinazioni, squadra, true);

  // Portiere dell'attacco nella sua porta (a sinistra)
  const portiere = Stato.pezzi.find(p => p.squadra === squadra && p.tipo === "portiere");
  if (portiere) Object.assign(portiere, posizionePortiere("sx"));

  // Pallone (se la formazione dice dove metterlo)
  if (f.pallone && f.pallone[k]) {
    let pallone = Stato.pezzi.find(p => p.tipo === "pallone");
    if (!pallone) {
      pallone = { id: nuovoId(), tipo: "pallone" };
      Stato.pezzi.push(pallone);
    }
    Object.assign(pallone, daRelativaAMetri(f.pallone[k]));
  }
}

// --------------------------------------------------------------------------
// DIFESA: posizioni fisse (zona) oppure marcatura sugli attaccanti
// --------------------------------------------------------------------------
function applicaDifesa(f) {
  const squadra = squadraInDifesa();
  const difensori = Stato.pezzi.filter(p => p.squadra === squadra && p.tipo === "giocatore");

  if (f.marcatura) {
    // Un punto di marcatura per ogni attaccante. Se manca un difensore
    // (es. dopo un'espulsione) viene ricreato: in parità sono di nuovo pari.
    const attaccanti = attaccantiInGioco();
    const destinazioni = attaccanti.map(a => puntoDiMarcatura(a, f.marcatura));
    const abbinamenti = sistemaSuPosizioni(difensori, destinazioni, squadra, true);
    // Ricorda chi marca chi: servirà per far seguire gli attaccanti
    const coppie = {};
    for (const [difensore, j] of abbinamenti) coppie[difensore.id] = attaccanti[j].id;
    Stato.difesaAttiva = { id: f.id, coppie };
  } else {
    let posizioni;
    if (f.posizioniPalla) {
      // Difesa che dipende dalla palla: si sceglie la voce adatta
      // e si ricorda quale, così spostando la palla si può cambiare voce.
      const indice = indiceSecondoPalla(f);
      posizioni = f.posizioniPalla[chiaveNumeroGiocatori()][indice].posizioni;
      Stato.difesaAttiva = { id: f.id, palla: indice };
    } else {
      posizioni = f.posizioni[chiaveNumeroGiocatori()];
      Stato.difesaAttiva = null; // la zona non segue nessuno
    }
    const destinazioni = posizioni.map(daRelativaAMetri);
    const abbinamenti = sistemaSuPosizioni(difensori, destinazioni, squadra, true);

    // Uomo in meno: il difensore rimasto senza posizione è l'espulso
    // e viene tolto dal campo.
    if (f.espulso) {
      const sistemati = new Set(abbinamenti.map(([difensore]) => difensore));
      const espulso = difensori.find(p => !sistemati.has(p));
      if (espulso) Stato.pezzi = Stato.pezzi.filter(p => p !== espulso);
    }
  }

  // Portiere della difesa al centro della sua porta (a destra)
  const portiere = Stato.pezzi.find(p => p.squadra === squadra && p.tipo === "portiere");
  if (portiere) Object.assign(portiere, posizionePortiere("dx"));
}

// Chiamata mentre si trascina il pallone o un attaccante: se c'è una difesa
// a uomo o pressing attiva, ogni difensore si rimette sul suo attaccante.
// (Senza animazione: si muovono insieme al dito.)
function aggiornaMarcature() {
  const attiva = Stato.difesaAttiva;
  if (!attiva) return;
  const formazione = DATI.formazioni.find(f => f.id === attiva.id);
  if (!formazione) return;

  // Difesa che dipende dalla palla ("posizioniPalla"): quando la palla entra
  // nella zona di un'altra voce, i difensori scivolano nelle nuove posizioni.
  if (formazione.posizioniPalla) {
    const indice = indiceSecondoPalla(formazione);
    if (indice === attiva.palla) return;
    attiva.palla = indice;
    const prima = new Map(Stato.pezzi.map(p => [p.id, { x: p.x, y: p.y }]));
    const difensori = Stato.pezzi.filter(p => p.squadra === squadraInDifesa() && p.tipo === "giocatore");
    const destinazioni = formazione.posizioniPalla[chiaveNumeroGiocatori()][indice].posizioni.map(daRelativaAMetri);
    sistemaSuPosizioni(difensori, destinazioni, squadraInDifesa(), false);
    animaDa(prima);
    return;
  }

  if (!formazione.marcatura) return;
  const strato = document.getElementById("strato-pezzi");
  for (const [idDifensore, idAttaccante] of Object.entries(attiva.coppie)) {
    const difensore = Stato.pezzi.find(p => p.id === idDifensore);
    const attaccante = Stato.pezzi.find(p => p.id === idAttaccante);
    if (!difensore || !attaccante) continue; // uno dei due è stato tolto
    Object.assign(difensore, puntoDiMarcatura(attaccante, formazione.marcatura));
    const g = strato.querySelector(`[data-id="${idDifensore}"]`);
    if (g) posiziona(g, difensore);
  }
}

// Dove si mette il difensore che marca l'attaccante "a".
//   uomo:     sulla linea tra l'attaccante e il centro della porta
//   pressing: sulla linea tra l'attaccante e la palla (gli toglie il passaggio);
//             se l'attaccante ha la palla, si mette verso la porta
function puntoDiMarcatura(a, marcatura) {
  const { L, W } = dimensioniCampo();
  // Direzione (lunga 1 metro) dall'attaccante verso un punto
  const direzione = punto => {
    const dx = punto.x - a.x;
    const dy = punto.y - a.y;
    const lunghezza = Math.hypot(dx, dy) || 1;
    return { x: dx / lunghezza, y: dy / lunghezza };
  };
  // Di base: verso il centro della porta di destra
  let d = direzione({ x: L, y: W / 2 });

  // Pressing sul centroboa: il marcatore si mette solo di lato
  // (a destra o a sinistra del boa, dalla parte della palla), alla sua stessa altezza.
  if (marcatura.tipo === "pressing" && marcatura.centroboaDiLato && eCentroboa(a)) {
    const palla = Stato.pezzi.find(p => p.tipo === "pallone");
    const lato = palla && palla.y < a.y ? -1 : 1; // y = direzione laterale nella vasca
    const m = 0.6;
    return {
      x: Math.min(Math.max(a.x, m), L - m),
      y: Math.min(Math.max(a.y + lato * marcatura.distanza, m), W - m)
    };
  }

  if (marcatura.tipo === "pressing") {
    const palla = Stato.pezzi.find(p => p.tipo === "pallone");
    if (palla && Math.hypot(palla.x - a.x, palla.y - a.y) > 1.5) {
      // Pressing: una via di mezzo tra "verso la palla" e "verso la porta".
      // versoPorta (in dati.js) va da 0 = tutto verso la palla a 1 = tutto verso la porta.
      const k = marcatura.versoPorta ?? 0;
      const p = direzione(palla);
      const mix = { x: p.x * (1 - k) + d.x * k, y: p.y * (1 - k) + d.y * k };
      const lunghezza = Math.hypot(mix.x, mix.y) || 1;
      d = { x: mix.x / lunghezza, y: mix.y / lunghezza };
    }
  }
  const x = a.x + d.x * marcatura.distanza;
  const y = a.y + d.y * marcatura.distanza;
  // Sempre dentro l'acqua
  const m = 0.6;
  return {
    x: Math.min(Math.max(x, m), L - m),
    y: Math.min(Math.max(y, m), W - m)
  };
}

// Per una difesa con "posizioniPalla": quale voce usare, cioè quella la cui
// palla di riferimento è più vicina alla palla vera. Senza palla: la prima.
function indiceSecondoPalla(f) {
  const voci = f.posizioniPalla[chiaveNumeroGiocatori()];
  const palla = Stato.pezzi.find(p => p.tipo === "pallone");
  if (!palla) return 0;
  let migliore = 0;
  let distanzaMinima = Infinity;
  voci.forEach((voce, i) => {
    const rif = daRelativaAMetri(voce.palla);
    const distanza = Math.hypot(rif.x - palla.x, rif.y - palla.y);
    if (distanza < distanzaMinima) {
      distanzaMinima = distanza;
      migliore = i;
    }
  });
  return migliore;
}

// true se "a" è il centroboa: l'attaccante più vicino al centro della porta,
// purché sia entro 4 metri da essa.
function eCentroboa(a) {
  const { L, W } = dimensioniCampo();
  const distanzaDallaPorta = p => Math.hypot(L - p.x, W / 2 - p.y);
  const attaccanti = attaccantiInGioco();
  if (attaccanti.length === 0) return false;
  const piuVicino = attaccanti.reduce((min, p) => (distanzaDallaPorta(p) < distanzaDallaPorta(min) ? p : min), attaccanti[0]);
  return piuVicino === a && distanzaDallaPorta(a) < 4;
}

// Assegna le destinazioni ai pezzi: ogni volta sceglie la coppia
// (pezzo, destinazione) più vicina tra quelle ancora libere.
// Se le destinazioni sono più dei pezzi e "creaMancanti" è true,
// crea i giocatori che mancano (senza numero).
// I pezzi in più restano dove sono.
// Restituisce gli abbinamenti fatti: coppie [pezzo, indice destinazione]
// (compresi i pezzi appena creati).
function sistemaSuPosizioni(pezzi, destinazioni, squadra, creaMancanti) {
  const coppie = [];
  pezzi.forEach((p, i) => destinazioni.forEach((d, j) => {
    coppie.push({ i, j, distanza: Math.hypot(p.x - d.x, p.y - d.y) });
  }));
  coppie.sort((a, b) => a.distanza - b.distanza);

  const pezziUsati = new Set();
  const destinazioniUsate = new Set();
  const abbinamenti = [];
  for (const c of coppie) {
    if (pezziUsati.has(c.i) || destinazioniUsate.has(c.j)) continue;
    pezziUsati.add(c.i);
    destinazioniUsate.add(c.j);
    pezzi[c.i].x = destinazioni[c.j].x;
    pezzi[c.i].y = destinazioni[c.j].y;
    abbinamenti.push([pezzi[c.i], c.j]);
  }

  if (creaMancanti) {
    destinazioni.forEach((d, j) => {
      if (destinazioniUsate.has(j)) return;
      const nuovo = { id: nuovoId(), tipo: "giocatore", squadra, numero: null, x: d.x, y: d.y };
      Stato.pezzi.push(nuovo);
      abbinamenti.push([nuovo, j]);
    });
  }
  return abbinamenti;
}

// --------------------------------------------------------------------------
// ANIMAZIONE: fa scivolare i pezzi dalle posizioni "prima" a quelle attuali.
// requestAnimationFrame chiede al browser di richiamare la funzione
// al prossimo fotogramma (circa 60 volte al secondo).
// "durata" in millisecondi. Restituisce una Promise che si risolve quando
// il movimento è finito (serve alla riproduzione degli schemi animati).
// --------------------------------------------------------------------------
function animaDa(prima, durata = DURATA_ANIMAZIONE) {
  const strato = document.getElementById("strato-pezzi");
  const inMovimento = [];
  for (const pezzo of Stato.pezzi) {
    const da = prima.get(pezzo.id);
    if (!da || (da.x === pezzo.x && da.y === pezzo.y)) continue;
    const g = strato.querySelector(`[data-id="${pezzo.id}"]`);
    if (g) inMovimento.push({ g, pezzo, da });
  }
  if (inMovimento.length === 0) return Promise.resolve();

  const inizio = performance.now();
  // Movimento morbido: lento all'inizio e alla fine
  const morbido = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  return new Promise(finito => {
    function passo(adesso) {
      const t = Math.min(1, (adesso - inizio) / durata);
      const k = morbido(t);
      for (const { g, pezzo, da } of inMovimento) {
        const x = da.x + (pezzo.x - da.x) * k;
        const y = da.y + (pezzo.y - da.y) * k;
        const [sx, sy] = Vista.aSchermo(x, y);
        g.setAttribute("transform", `translate(${sx} ${sy})`);
      }
      if (t < 1) requestAnimationFrame(passo);
      else finito();
    }
    requestAnimationFrame(passo);
  });
}
