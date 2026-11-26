// ============================================================================
// animazione.js — schemi animati: fotogrammi e riproduzione
// ----------------------------------------------------------------------------
// Uno schema è una sequenza di FOTOGRAMMI (posizione 1, 2, 3...).
// Ogni fotogramma = { pezzi, disegni }: dove stanno le pedine e quali frecce
// ci sono in quel momento. Le frecce di un fotogramma indicano il movimento
// che porta al fotogramma successivo.
//
// Come si lavora:
//   - "Nuovo schema" (scegliendo la categoria) trasforma la lavagna attuale
//     nel fotogramma 1 e mostra in basso la barra dei fotogrammi;
//   - "+" copia il fotogramma attuale in uno nuovo: si spostano le pedine;
//   - toccando un numero si torna a quel fotogramma per correggerlo;
//   - "▶" riproduce: le pedine scivolano da un fotogramma all'altro.
// Le pedine sono riconosciute tra un fotogramma e l'altro grazie al loro id.
// ============================================================================

const TEMPI_ANIMAZIONE = {
  movimento: 1400, // millisecondi per passare da un fotogramma al successivo
  pausa: 900       // millisecondi di sosta su ogni fotogramma (per leggere le frecce)
};

let inRiproduzione = false;
let fermaRiproduzione = false;

// true se si sta lavorando su uno schema (ci sono i fotogrammi)
function inSchema() {
  return Array.isArray(Stato.fotogrammi);
}

// La categoria (oggetto di dati.js) con quell'id, oppure undefined
function categoriaSchema(id) {
  return DATI.categorieSchemi.find(c => c.id === id);
}

// Ricopia la lavagna (pezzi e disegni) dentro il fotogramma attivo.
// Viene chiamata da salvaStato(), quindi dopo ogni modifica.
function sincronizzaFotogramma() {
  if (!inSchema() || inRiproduzione) return;
  Stato.fotogrammi[Stato.fotogrammaAttivo] = {
    pezzi: copia(Stato.pezzi),
    disegni: copia(Stato.disegni)
  };
}

// Mette sulla lavagna il contenuto del fotogramma i (senza ridisegnare).
function caricaFotogramma(i) {
  const f = Stato.fotogrammi[i];
  Stato.fotogrammaAttivo = i;
  Stato.pezzi = copia(f.pezzi);
  Stato.disegni = copia(f.disegni || []);
}

// ---------------------------------------------------------------------------
// INIZIO / FINE DI UNO SCHEMA
// ---------------------------------------------------------------------------

// Nuovo schema con nome e categoria (dalla finestra "Nuovo schema"):
// la lavagna attuale diventa il fotogramma 1 e il campo si apre nella
// vista della categoria.
function iniziaSchema(idCategoria, nome) {
  const categoria = categoriaSchema(idCategoria);
  if (!categoria) return;
  if (strumento) scegliStrumento(null);
  Stato.fotogrammi = [{ pezzi: copia(Stato.pezzi), disegni: copia(Stato.disegni) }];
  Stato.fotogrammaAttivo = 0;
  Stato.categoriaSchema = categoria.id;
  Stato.schemaAperto = null;
  Stato.nomeSchema = nome;
  Stato.impostazioni.vista = categoria.vista;
  chiudiPannelli();
  ridisegnaTutto();
  mostraAvviso("Fotogramma 1: disponi le pedine, poi + per il fotogramma 2");
}

// Cambia la categoria dello schema in lavorazione (e la vista del campo).
function cambiaCategoriaSchema(idCategoria) {
  const categoria = categoriaSchema(idCategoria);
  if (!categoria) return;
  Stato.categoriaSchema = categoria.id;
  Stato.impostazioni.vista = categoria.vista;
  ridisegnaTutto();
}

// Chiude lo schema: la lavagna resta com'è il fotogramma attivo, senza fotogrammi.
function chiudiSchema() {
  if (inRiproduzione) return;
  Stato.fotogrammi = null;
  Stato.fotogrammaAttivo = 0;
  Stato.categoriaSchema = null;
  Stato.schemaAperto = null;
  Stato.nomeSchema = "Lavagna libera";
  chiudiPannelli();
  ridisegnaTutto();
  mostraAvviso("Schema chiuso (puoi annullare)");
}

// ---------------------------------------------------------------------------
// FOTOGRAMMI
// ---------------------------------------------------------------------------
function vaiAFotogramma(i) {
  if (inRiproduzione || !inSchema() || i === Stato.fotogrammaAttivo) return;
  sincronizzaFotogramma();
  caricaFotogramma(i);
  ridisegnaTutto();
}

// Nuovo fotogramma subito dopo quello attivo, uguale a lui: si spostano le pedine.
function aggiungiFotogramma() {
  if (inRiproduzione || !inSchema()) return;
  sincronizzaFotogramma();
  const nuovo = copia(Stato.fotogrammi[Stato.fotogrammaAttivo]);
  nuovo.disegni = []; // le frecce del fotogramma precedente non servono più
  Stato.fotogrammi.splice(Stato.fotogrammaAttivo + 1, 0, nuovo);
  caricaFotogramma(Stato.fotogrammaAttivo + 1);
  ridisegnaTutto();
  mostraAvviso(`Fotogramma ${Stato.fotogrammaAttivo + 1}: sposta le pedine nella nuova posizione`);
}

function eliminaFotogramma() {
  if (inRiproduzione || !inSchema()) return;
  if (Stato.fotogrammi.length <= 1) {
    mostraAvviso("Lo schema deve avere almeno un fotogramma");
    return;
  }
  Stato.fotogrammi.splice(Stato.fotogrammaAttivo, 1);
  caricaFotogramma(Math.min(Stato.fotogrammaAttivo, Stato.fotogrammi.length - 1));
  ridisegnaTutto();
  mostraAvviso("Fotogramma eliminato (puoi annullare)");
}

// ---------------------------------------------------------------------------
// RIPRODUZIONE
// ---------------------------------------------------------------------------
const attendi = ms => new Promise(risolvi => setTimeout(risolvi, ms));

// ▶ riproduce dal fotogramma 1 all'ultimo; toccato di nuovo (■) si ferma.
async function riproduci() {
  if (!inSchema()) return;
  if (inRiproduzione) {
    fermaRiproduzione = true;
    return;
  }
  sincronizzaFotogramma();
  if (Stato.fotogrammi.length < 2) {
    mostraAvviso("Aggiungi almeno un secondo fotogramma con +");
    return;
  }
  if (strumento) scegliStrumento(null);
  chiudiPannelli();
  inRiproduzione = true;
  fermaRiproduzione = false;
  document.getElementById("lavagna").classList.add("in-riproduzione");

  caricaFotogramma(0);
  disegnaDisegni();
  disegnaPezzi();
  aggiornaBarraFotogrammi();

  for (let k = 0; k < Stato.fotogrammi.length - 1; k++) {
    await attendi(TEMPI_ANIMAZIONE.pausa); // sosta per leggere le frecce
    if (fermaRiproduzione) break;
    const prima = new Map(Stato.pezzi.map(p => [p.id, { x: p.x, y: p.y }]));
    caricaFotogramma(k + 1);
    document.getElementById("strato-disegni").replaceChildren(); // frecce nascoste durante il movimento
    disegnaPezzi();
    compariNuovi(prima);
    aggiornaBarraFotogrammi();
    await animaDa(prima, TEMPI_ANIMAZIONE.movimento);
    disegnaDisegni(); // frecce del fotogramma raggiunto
  }

  inRiproduzione = false;
  document.getElementById("lavagna").classList.remove("in-riproduzione");
  ridisegnaTutto(); // resta sull'ultimo fotogramma mostrato
}

// Le pedine che compaiono solo nel fotogramma nuovo entrano in dissolvenza.
function compariNuovi(prima) {
  const strato = document.getElementById("strato-pezzi");
  for (const p of Stato.pezzi) {
    if (prima.has(p.id)) continue;
    const g = strato.querySelector(`[data-id="${p.id}"]`);
    if (!g) continue;
    g.style.opacity = "0";
    g.style.transition = `opacity ${TEMPI_ANIMAZIONE.movimento}ms`;
    requestAnimationFrame(() => requestAnimationFrame(() => { g.style.opacity = "1"; }));
  }
}

// ---------------------------------------------------------------------------
// BARRA DEI FOTOGRAMMI (in basso)
// ---------------------------------------------------------------------------
function aggiornaBarraFotogrammi() {
  const barra = document.getElementById("barra-fotogrammi");
  const attiva = inSchema();
  barra.hidden = !attiva;
  document.body.classList.toggle("con-fotogrammi", attiva);
  if (!attiva) return;

  const elenco = document.getElementById("elenco-fotogrammi");
  elenco.replaceChildren();
  Stato.fotogrammi.forEach((f, i) => {
    const b = document.createElement("button");
    b.dataset.fotogramma = i;
    b.textContent = i + 1;
    b.classList.toggle("scelto", i === Stato.fotogrammaAttivo);
    b.disabled = inRiproduzione;
    elenco.appendChild(b);
  });
  elenco.querySelector(".scelto")?.scrollIntoView({ block: "nearest", inline: "nearest" });

  const play = document.getElementById("pulsante-riproduci");
  play.innerHTML = inRiproduzione
    ? '<svg viewBox="0 0 24 24"><rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
  play.title = inRiproduzione ? "Ferma" : "Riproduci lo schema";
  for (const azione of ["aggiungi-fotogramma", "elimina-fotogramma"]) {
    barra.querySelector(`[data-azione="${azione}"]`).disabled = inRiproduzione;
  }
}
