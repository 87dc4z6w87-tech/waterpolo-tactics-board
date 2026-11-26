// ============================================================================
// stato.js — la "memoria" dell'app
// ----------------------------------------------------------------------------
// Tutto quello che si vede sulla lavagna è descritto dall'oggetto "Stato".
// Il disegno viene sempre rifatto a partire da qui: per cambiare qualcosa
// sullo schermo si cambia lo Stato e poi si ridisegna.
//
// Le posizioni dei pezzi sono in METRI dentro la vasca:
//   x = da 0 (linea di porta sinistra) a L (linea di porta destra)
//   y = da 0 (bordo in alto nella vista intera) a W (bordo in basso)
// Così non dipendono da come il campo è disegnato sullo schermo.
// ============================================================================

const CHIAVE_SALVATAGGIO = "lavagna-pallanuoto-v1";

const Stato = {
  impostazioni: {
    tipoCampo: "internazionale",   // "internazionale" oppure "fin" (= PallanuotoItalia)
    vista: "intero",               // "intero" oppure "meta"
    dimensione: DATI.campo.dimensionePredefinita  // "regolamentare" oppure "piccoli"
  },
  // Ogni pezzo: { id, tipo: "giocatore"|"portiere"|"pallone", squadra: "rossa"|"blu", numero, x, y }
  // numero = null finché l'allenatore non ne sceglie uno con il pulsante #
  pezzi: [],
  // Frecce e disegni a mano (vedi disegno.js). Ogni disegno:
  // { id, tipo: "nuotata"|"passaggio"|"senzaPalla"|"penna", colore, punti: [{x, y}, ...] }
  // I punti sono in metri nella vasca, come i pezzi.
  disegni: [],
  // Quale colore attacca la porta di destra (quella in alto in metà campo).
  // Le formazioni d'attacco muovono questa squadra, quelle di difesa l'altra.
  squadraInAttacco: "rossa",
  // Difesa "a marcatura" attiva (a uomo o pressing): finché c'è, i difensori
  // seguono il loro attaccante (e la palla, nel pressing).
  //   { id: "pressing", coppie: { idDifensore: idAttaccante, ... } }
  //   oppure, per le difese che cambiano con la palla ("posizioniPalla"):
  //   { id: "inf-4-2", palla: indiceDellaVoceInUso }
  //   oppure null
  // Si annulla spostando a mano un difensore o scegliendo un'altra difesa.
  difesaAttiva: null,
  // Schema aperto (id, vedi schemi.js) e suo nome; null = lavagna libera
  schemaAperto: null,
  nomeSchema: "Lavagna libera",
  // SCHEMA ANIMATO in lavorazione (vedi animazione.js):
  //   fotogrammi = [{ pezzi, disegni }, ...] oppure null (lavagna libera)
  //   fotogrammaAttivo = quale fotogramma si sta guardando/modificando.
  //   Stato.pezzi e Stato.disegni sono sempre la copia di lavoro del
  //   fotogramma attivo: a ogni salvataggio vengono ricopiati dentro.
  //   categoriaSchema = id della categoria (vedi "categorieSchemi" in dati.js)
  fotogrammi: null,
  fotogrammaAttivo: 0,
  categoriaSchema: null
};

// Il colore della squadra che difende la porta di destra.
function squadraInDifesa() {
  return Stato.squadraInAttacco === "rossa" ? "blu" : "rossa";
}

// Il campo scelto, così com'è scritto in dati.js.
function campoScelto() {
  const elenco = DATI.campo.dimensioni;
  return elenco.find(d => d.id === Stato.impostazioni.dimensione) || elenco[0];
}

// Lunghezza (L) e larghezza (W) del campo scelto, in metri.
function dimensioniCampo() {
  const scelta = campoScelto();
  return { L: scelta.lunghezza, W: scelta.larghezza };
}

// Converte una posizione scritta in dati.js ({ d, l, porta }) in metri (x, y).
function daRelativaAMetri(pos) {
  const { L, W } = dimensioniCampo();
  if (pos.porta === "sx") {
    // Porta di sinistra: chi la attacca nuota verso sinistra,
    // quindi la sua "destra" è verso l'alto (y più piccola).
    return { x: pos.d, y: W / 2 - pos.l };
  }
  return { x: L - pos.d, y: W / 2 + pos.l };
}

// Genera un codice unico per ogni pezzo (serve a ritrovarlo).
let contatoreId = 0;
function nuovoId() {
  contatoreId += 1;
  return "p" + Date.now().toString(36) + "-" + contatoreId;
}

// Mette in campo i giocatori nelle posizioni iniziali di dati.js.
// Quanti giocatori (7 o 6) dipende dal campo scelto.
function creaPezziIniziali() {
  const schieramento = DATI.schieramentoIniziale[String(campoScelto().giocatori)];
  const pezzi = [];
  for (const squadra of ["rossa", "blu"]) {
    for (const pos of schieramento[squadra]) {
      const { x, y } = daRelativaAMetri(pos);
      pezzi.push({
        id: nuovoId(),
        tipo: pos.ruolo === "portiere" ? "portiere" : "giocatore",
        squadra,
        numero: null, // i numeri li sceglie l'allenatore
        x, y
      });
    }
  }
  const palla = daRelativaAMetri(schieramento.pallone);
  pezzi.push({ id: nuovoId(), tipo: "pallone", x: palla.x, y: palla.y });
  Stato.pezzi = pezzi;
  Stato.squadraInAttacco = "rossa"; // nello schieramento iniziale attaccano i rossi
  Stato.difesaAttiva = null;
}

// ---------------------------------------------------------------------------
// SALVATAGGIO AUTOMATICO
// localStorage è una piccola memoria del browser, legata al dispositivo.
// Il "try/catch" evita che l'app si blocchi se il browser non la permette
// (per esempio in navigazione privata).
// ---------------------------------------------------------------------------
function salvaStato() {
  sincronizzaFotogramma(); // se si sta facendo uno schema, aggiorna il fotogramma attivo
  registraStoria(); // ogni salvataggio è anche un passo per "annulla"
  try {
    const daSalvare = {
      impostazioni: Stato.impostazioni,
      pezzi: Stato.pezzi,
      disegni: Stato.disegni,
      squadraInAttacco: Stato.squadraInAttacco,
      difesaAttiva: Stato.difesaAttiva,
      schemaAperto: Stato.schemaAperto,
      nomeSchema: Stato.nomeSchema,
      fotogrammi: Stato.fotogrammi,
      fotogrammaAttivo: Stato.fotogrammaAttivo,
      categoriaSchema: Stato.categoriaSchema
    };
    localStorage.setItem(CHIAVE_SALVATAGGIO, JSON.stringify(daSalvare));
  } catch (errore) {
    console.warn("Salvataggio non riuscito:", errore);
  }
}

function caricaStato() {
  try {
    const testo = localStorage.getItem(CHIAVE_SALVATAGGIO);
    if (testo) {
      const salvato = JSON.parse(testo);
      Object.assign(Stato.impostazioni, salvato.impostazioni || {});
      if (Array.isArray(salvato.pezzi)) Stato.pezzi = salvato.pezzi;
      if (Array.isArray(salvato.disegni)) Stato.disegni = salvato.disegni;
      if (salvato.nomeSchema) Stato.nomeSchema = salvato.nomeSchema;
      if (salvato.schemaAperto) Stato.schemaAperto = salvato.schemaAperto;
      if (Array.isArray(salvato.fotogrammi) && salvato.fotogrammi.length > 0) {
        Stato.fotogrammi = salvato.fotogrammi;
        Stato.fotogrammaAttivo = Math.min(Math.max(0, salvato.fotogrammaAttivo || 0), salvato.fotogrammi.length - 1);
        Stato.categoriaSchema = salvato.categoriaSchema || null;
      }
      if (salvato.squadraInAttacco === "blu") Stato.squadraInAttacco = "blu";
      if (salvato.difesaAttiva && (salvato.difesaAttiva.coppie || salvato.difesaAttiva.palla !== undefined)) {
        Stato.difesaAttiva = salvato.difesaAttiva;
      }
    }
  } catch (errore) {
    console.warn("Caricamento non riuscito:", errore);
  }
  // Se il campo salvato non esiste più in dati.js, torna a quello predefinito
  // e rimette i giocatori nelle posizioni iniziali.
  if (!DATI.campo.dimensioni.some(d => d.id === Stato.impostazioni.dimensione)) {
    Stato.impostazioni.dimensione = DATI.campo.dimensionePredefinita;
    Stato.pezzi = [];
  }
  // Prima apertura: nessun pezzo salvato, quindi schieramento iniziale
  if (Stato.pezzi.length === 0) creaPezziIniziali();
  Storia.attuale = fotografia(); // punto di partenza per "annulla"
}

// ---------------------------------------------------------------------------
// ANNULLA / RIPETI
// Ogni volta che lo Stato viene salvato se ne fa una "fotografia" (un testo
// JSON con pezzi, disegni, squadre e campo). "passati" sono le fotografie
// precedenti, "futuri" quelle annullate che si possono ripetere.
// Il cambio di vista o di tipo di campo non conta: si annullano solo
// spostamenti, formazioni, numeri, disegni e cambio di dimensioni del campo.
// ---------------------------------------------------------------------------
const Storia = { passati: [], futuri: [], attuale: null };
const MASSIMO_STORIA = 100;

function fotografia() {
  return JSON.stringify({
    pezzi: Stato.pezzi,
    disegni: Stato.disegni,
    squadraInAttacco: Stato.squadraInAttacco,
    difesaAttiva: Stato.difesaAttiva,
    dimensione: Stato.impostazioni.dimensione,
    schemaAperto: Stato.schemaAperto,
    nomeSchema: Stato.nomeSchema,
    fotogrammi: Stato.fotogrammi,
    fotogrammaAttivo: Stato.fotogrammaAttivo,
    categoriaSchema: Stato.categoriaSchema
  });
}

function registraStoria() {
  const nuova = fotografia();
  if (nuova === Storia.attuale) return; // non è cambiato niente
  if (Storia.attuale) Storia.passati.push(Storia.attuale);
  if (Storia.passati.length > MASSIMO_STORIA) Storia.passati.shift();
  Storia.attuale = nuova;
  Storia.futuri = []; // dopo una modifica nuova non si può più "ripetere"
}

function ripristinaFotografia(testo) {
  const f = JSON.parse(testo);
  Stato.pezzi = f.pezzi;
  Stato.disegni = f.disegni;
  Stato.squadraInAttacco = f.squadraInAttacco;
  Stato.difesaAttiva = f.difesaAttiva;
  Stato.impostazioni.dimensione = f.dimensione;
  Stato.schemaAperto = f.schemaAperto ?? null;
  Stato.nomeSchema = f.nomeSchema || "Lavagna libera";
  Stato.fotogrammi = f.fotogrammi ?? null;
  Stato.fotogrammaAttivo = f.fotogrammaAttivo || 0;
  Stato.categoriaSchema = f.categoriaSchema ?? null;
}

// Restituiscono true se c'era qualcosa da annullare / ripetere.
function annulla() {
  if (Storia.passati.length === 0) return false;
  Storia.futuri.push(Storia.attuale);
  Storia.attuale = Storia.passati.pop();
  ripristinaFotografia(Storia.attuale);
  return true;
}
function ripeti() {
  if (Storia.futuri.length === 0) return false;
  Storia.passati.push(Storia.attuale);
  Storia.attuale = Storia.futuri.pop();
  ripristinaFotografia(Storia.attuale);
  return true;
}
