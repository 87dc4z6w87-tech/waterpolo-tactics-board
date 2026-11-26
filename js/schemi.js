// ============================================================================
// schemi.js — schemi della società: salva, apri, elimina, esporta, importa
// ----------------------------------------------------------------------------
// Uno schema è sempre ANIMATO (almeno 2 fotogrammi, vedi animazione.js):
//   { id, nome, categoria, aggiornato (data),
//     impostazioni: { dimensione, tipoCampo },
//     squadraInAttacco,
//     fotogrammi: [ { pezzi: [...], disegni: [...] }, ... ] }
// La categoria è una delle tre di dati.js ("categorieSchemi") e decide la
// vista: Schierati e Superiorità/inferiorità → metà campo,
// Transizione e controfughe → campo intero.
//
// DOVE STANNO GLI SCHEMI — due modi di funzionare:
//
// 1) APP SUL DISPOSITIVO (doppio clic su index.html):
//    - quelli salvati con l'app: nel browser (localStorage, chiave sotto);
//    - quelli "fissi" della società: in dati.js → "schemiSocieta"
//      (non si cancellano dall'app, hanno l'etichetta "società").
//    Per passarli a un altro allenatore: "Scarica tutti gli schemi" (file
//    .json) e, sull'altro dispositivo, "Carica schemi da file".
//
// 2) APP ONLINE (il link pubblicato su claude.ai):
//    gli schemi stanno in un ARCHIVIO CONDIVISO della pagina (la capacità
//    "db" di claude.ai, collezione "schemi"). Tutti gli allenatori con il
//    link vedono gli stessi schemi e, se hanno il permesso, possono
//    modificarli e aggiungerne: le modifiche arrivano subito a tutti.
//    Il modo 2 si accende da solo quando la pagina gira dentro claude.ai.
// ============================================================================

const CHIAVE_SCHEMI = "lavagna-pallanuoto-schemi-v1";
const FOTOGRAMMI_MINIMI = 2;
const COLLEZIONE_CONDIVISA = "schemi";

let schemiPersonali = []; // modo 1: gli schemi salvati su questo dispositivo

// Modo 2 (online): archivio condiviso
let archivio = null;          // la capacità "db" di claude.ai (null = modo 1)
let schemiCondivisi = null;   // gli schemi dell'archivio (null = non ancora arrivati)
let puoModificare = true;     // false se chi guarda può solo vedere gli schemi

function inCondivisione() {
  return archivio !== null;
}

// ---------------------------------------------------------------------------
// MEMORIA DEL DISPOSITIVO (modo 1)
// ---------------------------------------------------------------------------
function caricaSchemi() {
  try {
    const testo = localStorage.getItem(CHIAVE_SCHEMI);
    if (testo) schemiPersonali = JSON.parse(testo).filter(schemaValido);
  } catch (errore) {
    console.warn("Schemi non letti:", errore);
  }
  // Uno schema personale diventato schema della società (stesso id in dati.js)
  // viene tolto dagli schemi personali, così non compare due volte.
  const idSocieta = new Set((DATI.schemiSocieta || []).map(s => s.id));
  const prima = schemiPersonali.length;
  schemiPersonali = schemiPersonali.filter(s => !idSocieta.has(s.id));
  if (schemiPersonali.length !== prima) salvaSchemi();
}

function salvaSchemi() {
  try {
    localStorage.setItem(CHIAVE_SCHEMI, JSON.stringify(schemiPersonali));
  } catch (errore) {
    console.warn("Schemi non salvati:", errore);
    mostraAvviso("Attenzione: memoria del dispositivo piena o non disponibile");
  }
}

// ---------------------------------------------------------------------------
// ARCHIVIO CONDIVISO (modo 2, solo online)
// window.claude esiste solo quando la pagina gira dentro claude.ai:
// sul dispositivo questa funzione non fa niente.
// ---------------------------------------------------------------------------
async function avviaCondivisione() {
  if (!window.claude || typeof window.claude.use !== "function") return;
  const db = await window.claude.use("db");
  if (!db) return; // es. chi non ha fatto l'accesso: resta il modo 1
  archivio = db;

  // Chi guarda può modificare gli schemi? (null = non si sa: si prova)
  const utente = await window.claude.use("user");
  const permesso = utente ? await utente.can("data.write") : null;
  puoModificare = permesso !== false;

  // Se l'archivio non risponde entro 10 secondi, si avvisa
  const attesa = setTimeout(() => mostraAvviso("Schemi condivisi non raggiungibili per ora"), 10000);
  archivio.collection(COLLEZIONE_CONDIVISA).onSnapshot(
    istantanea => {
      if (!istantanea.metadata.fromCache) clearTimeout(attesa);
      schemiCondivisi = istantanea.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .filter(schemaValido);
      // Se il pannello degli schemi è aperto, si aggiorna da solo
      if (document.getElementById("pannello-schemi").classList.contains("aperto")) riempiElencoSchemi();
    },
    errore => {
      clearTimeout(attesa);
      console.warn("Archivio schemi:", errore);
      mostraAvviso("Schemi condivisi non disponibili");
    }
  );
}

// Messaggio chiaro per un salvataggio rifiutato dall'archivio
function spiegaErroreArchivio(errore) {
  if (errore && errore.code === "invalid_argument") {
    puoModificare = false;
    return "Puoi vedere gli schemi ma non modificarli: chiedi a chi ti ha mandato il link di darti il permesso";
  }
  if (errore && errore.code === "quota_exceeded") return "Archivio degli schemi pieno: elimina qualche schema";
  return "Non sono riuscito a salvare nell'archivio condiviso. Riprova tra poco";
}

// ---------------------------------------------------------------------------
// ELENCO DEGLI SCHEMI
// ---------------------------------------------------------------------------

// Tutti gli schemi da mostrare.
//   Online: quelli dell'archivio condiviso (finché non arrivano, quelli di dati.js).
//   Sul dispositivo: prima quelli della società (dati.js), poi quelli personali.
function tuttiGliSchemi() {
  const societa = (DATI.schemiSocieta || []).filter(schemaValido).map(s => ({ ...s, societa: true }));
  if (inCondivisione()) {
    return schemiCondivisi === null ? societa : schemiCondivisi.map(s => ({ ...s, condiviso: true }));
  }
  return [...societa, ...schemiPersonali];
}

// Si può eliminare/modificare questo schema da qui?
function schemaModificabile(s) {
  if (inCondivisione()) return !!s.condiviso && puoModificare;
  return !s.societa;
}

// Controllo minimo: nome e almeno un fotogramma (o, per schemi vecchi, i pezzi).
function schemaValido(s) {
  return s && typeof s.nome === "string" &&
    ((Array.isArray(s.fotogrammi) && s.fotogrammi.length > 0) || Array.isArray(s.pezzi));
}

// I fotogrammi di uno schema (gli schemi vecchi, non animati, ne hanno uno solo)
function fotogrammiDi(s) {
  return Array.isArray(s.fotogrammi) ? s.fotogrammi : [{ pezzi: s.pezzi, disegni: s.disegni || [] }];
}

function nuovoIdSchema() {
  return "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Uno schema "pulito" per il salvataggio (senza le etichette usate solo nel menu)
function schemaDaSalvare(s) {
  const pulito = copia(s);
  delete pulito.societa;
  delete pulito.condiviso;
  return pulito;
}

// ---------------------------------------------------------------------------
// SALVA / APRI / ELIMINA
// ---------------------------------------------------------------------------

// Salva lo schema in lavorazione (pulsante "Salva" nella barra dei fotogrammi)
// con il nome e la categoria scelti nella finestra.
//   Online: aggiorna lo schema condiviso aperto (anche uno di base), oppure
//           ne aggiunge uno nuovo all'archivio.
//   Sul dispositivo: aggiorna lo schema personale aperto, altrimenti ne crea
//           uno nuovo (partendo da uno della società, quello resta com'è).
async function salvaSchema() {
  if (!inSchema()) return;
  const nome = (Stato.nomeSchema || "").trim();
  if (!nome || !categoriaSchema(Stato.categoriaSchema)) {
    apriFinestraSchema("dettagli");
    mostraAvviso("Scegli il nome e la tipologia dello schema");
    return;
  }
  sincronizzaFotogramma();
  if (Stato.fotogrammi.length < FOTOGRAMMI_MINIMI) {
    mostraAvviso("Uno schema è animato: aggiungi almeno un secondo fotogramma con +");
    return;
  }
  const condiviso = inCondivisione();
  if (condiviso && !puoModificare) {
    mostraAvviso("Puoi vedere gli schemi ma non modificarli: chiedi a chi ti ha mandato il link di darti il permesso");
    return;
  }
  const esistenti = condiviso ? (schemiCondivisi || []) : schemiPersonali;
  const esistente = esistenti.find(s => s.id === Stato.schemaAperto);
  const daSocieta = !condiviso && !esistente && (DATI.schemiSocieta || []).some(s => s.id === Stato.schemaAperto);
  const schema = {
    id: esistente ? esistente.id : nuovoIdSchema(),
    nome,
    categoria: Stato.categoriaSchema,
    aggiornato: new Date().toISOString(),
    impostazioni: {
      dimensione: Stato.impostazioni.dimensione,
      tipoCampo: Stato.impostazioni.tipoCampo
    },
    squadraInAttacco: Stato.squadraInAttacco,
    fotogrammi: copia(Stato.fotogrammi)
  };

  if (condiviso) {
    try {
      await archivio.collection(COLLEZIONE_CONDIVISA).doc(schema.id).set(schemaDaSalvare(schema));
    } catch (errore) {
      console.warn("Salvataggio condiviso non riuscito:", errore);
      mostraAvviso(spiegaErroreArchivio(errore));
      return;
    }
  } else {
    if (esistente) schemiPersonali[schemiPersonali.indexOf(esistente)] = schema;
    else schemiPersonali.push(schema);
    salvaSchemi();
  }

  Stato.schemaAperto = schema.id;
  Stato.nomeSchema = nome;
  salvaStato();
  aggiornaInterfaccia();
  chiudiPannelli();
  mostraAvviso(
    esistente ? `Schema aggiornato: ${nome}`
    : daSocieta ? `Salvato come tuo schema: ${nome} (quello della società resta uguale)`
    : condiviso ? `Schema salvato per tutti: ${nome}`
    : `Schema salvato: ${nome}`
  );
}

// Apre uno schema sul fotogramma 1, con la vista della sua categoria
// (si può annullare).
function apriSchema(id) {
  if (inRiproduzione) return;
  const s = tuttiGliSchemi().find(x => x.id === id);
  if (!s) return;
  const imp = s.impostazioni || {};
  if (DATI.campo.dimensioni.some(d => d.id === imp.dimensione)) Stato.impostazioni.dimensione = imp.dimensione;
  if (imp.tipoCampo) Stato.impostazioni.tipoCampo = imp.tipoCampo;
  const categoria = categoriaSchema(s.categoria);
  Stato.impostazioni.vista = categoria ? categoria.vista : (imp.vista || "intero");
  Stato.fotogrammi = copia(fotogrammiDi(s));
  Stato.categoriaSchema = categoria ? categoria.id : DATI.categorieSchemi[0].id;
  caricaFotogramma(0);
  Stato.squadraInAttacco = s.squadraInAttacco === "blu" ? "blu" : "rossa";
  Stato.difesaAttiva = null;
  Stato.schemaAperto = s.id;
  Stato.nomeSchema = s.nome;
  if (strumento) scegliStrumento(null);
  chiudiPannelli();
  ridisegnaTutto();
  mostraAvviso(`Aperto: ${s.nome} · tocca ▶ per vederlo`);
}

async function eliminaSchema(id) {
  const s = tuttiGliSchemi().find(x => x.id === id);
  if (!s || !schemaModificabile(s)) return;
  const condiviso = inCondivisione();
  chiudiPannelli();
  const domanda = condiviso
    ? `Eliminare lo schema "${s.nome}" per tutti gli allenatori?`
    : `Eliminare lo schema "${s.nome}" da questo dispositivo?`;
  if (!(await chiediConferma(domanda, "Elimina"))) return;

  if (condiviso) {
    try {
      await archivio.collection(COLLEZIONE_CONDIVISA).doc(id).delete();
    } catch (errore) {
      console.warn("Eliminazione condivisa non riuscita:", errore);
      mostraAvviso(spiegaErroreArchivio(errore));
      return;
    }
  } else {
    schemiPersonali = schemiPersonali.filter(x => x.id !== id);
    salvaSchemi();
  }
  if (Stato.schemaAperto === id) {
    // Lo schema resta sulla lavagna, ma come schema nuovo non ancora salvato
    Stato.schemaAperto = null;
    salvaStato();
    aggiornaInterfaccia();
  }
  mostraAvviso(`Eliminato: ${s.nome}`);
}

// Lavagna nuova: niente schema, giocatori nelle posizioni iniziali,
// niente disegni (si può annullare). (Al momento nessun pulsante la usa.)
function nuovaLavagna() {
  if (inRiproduzione) return;
  Stato.fotogrammi = null;
  Stato.fotogrammaAttivo = 0;
  Stato.categoriaSchema = null;
  creaPezziIniziali();
  Stato.disegni = [];
  Stato.schemaAperto = null;
  Stato.nomeSchema = "Lavagna libera";
  if (strumento) scegliStrumento(null);
  chiudiPannelli();
  ridisegnaTutto();
  mostraAvviso("Nuova lavagna (puoi annullare)");
}

// ---------------------------------------------------------------------------
// ESPORTA / IMPORTA (file .json)
//   Sul dispositivo: per passare gli schemi personali a un altro allenatore.
//   Online: una copia di sicurezza degli schemi condivisi, o per caricarne
//   di nuovi nell'archivio da un file.
// ---------------------------------------------------------------------------
async function esportaSchemi() {
  const daEsportare = inCondivisione() ? tuttiGliSchemi() : schemiPersonali;
  if (daEsportare.length === 0) {
    mostraAvviso("Non ci sono schemi salvati da scaricare");
    return;
  }
  const contenuto = {
    app: "lavagna-pallanuoto",
    versione: 2,
    esportato: new Date().toISOString(),
    schemi: daEsportare.map(schemaDaSalvare)
  };
  const blob = new Blob([JSON.stringify(contenuto, null, 2)], { type: "application/json" });
  const oggi = new Date().toISOString().slice(0, 10);
  await condividiOScarica(blob, `schemi-pallanuoto-${oggi}.json`, "application/json");
}

// Legge un file .json e aggiunge gli schemi: quelli con lo stesso id di uno
// già presente lo sostituiscono, gli altri vengono aggiunti.
function importaSchemi(file) {
  const lettore = new FileReader();
  lettore.onload = async () => {
    let elenco;
    try {
      const dati = JSON.parse(lettore.result);
      elenco = (Array.isArray(dati) ? dati : dati.schemi || []).filter(schemaValido);
      if (elenco.length === 0) throw new Error("nessuno schema");
    } catch (errore) {
      console.warn("Importazione non riuscita:", errore);
      mostraAvviso("Questo file non contiene schemi della lavagna");
      return;
    }
    let nuovi = 0;
    let aggiornati = 0;
    for (const s of elenco) {
      if (!s.id) s.id = nuovoIdSchema();
      const pulito = schemaDaSalvare(s);
      if (inCondivisione()) {
        // Online: ogni schema va nell'archivio condiviso, uno alla volta
        const giaPresente = (schemiCondivisi || []).some(x => x.id === pulito.id);
        try {
          await archivio.collection(COLLEZIONE_CONDIVISA).doc(pulito.id).set(pulito);
        } catch (errore) {
          console.warn("Importazione condivisa non riuscita:", errore);
          mostraAvviso(spiegaErroreArchivio(errore));
          return;
        }
        if (giaPresente) aggiornati++;
        else nuovi++;
      } else {
        const i = schemiPersonali.findIndex(x => x.id === pulito.id);
        if (i >= 0) {
          schemiPersonali[i] = pulito;
          aggiornati++;
        } else {
          schemiPersonali.push(pulito);
          nuovi++;
        }
      }
    }
    if (!inCondivisione()) salvaSchemi();
    riempiElencoSchemi();
    mostraAvviso(`Schemi caricati: ${nuovi} nuovi, ${aggiornati} aggiornati`);
  };
  lettore.readAsText(file);
}


// ---------------------------------------------------------------------------
// PANNELLI
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// FINESTRA "NUOVO SCHEMA" (nome + tipologia + partenza)
// Si usa in due modi:
//   "nuovo"    → dal pulsante Nuovo schema della cartella: crea lo schema e
//                mette i giocatori nella posizione di partenza della tipologia
//                (es. Schierati, oppure 4-2 / 3-3 per la superiorità)
//   "dettagli" → dalla matita nella barra dei fotogrammi: cambia solo nome e
//                tipologia dello schema aperto (i giocatori restano dove sono)
// ---------------------------------------------------------------------------
let modoFinestra = "nuovo";
let tipologiaScelta = null;
let partenzaScelta = 0; // indice in "partenze" della tipologia scelta

function apriFinestraSchema(modo) {
  if (inRiproduzione) return;
  modoFinestra = modo;
  const nuovo = modo === "nuovo";
  chiudiPannelli();
  document.getElementById("titolo-finestra-schema").textContent = nuovo ? "Nuovo schema" : "Nome e tipologia";
  document.getElementById("conferma-finestra-schema").textContent = nuovo ? "Crea schema" : "Applica";
  document.getElementById("nota-finestra-schema").hidden = !nuovo;
  const campoNome = document.getElementById("nome-nuovo-schema");
  campoNome.value = nuovo ? "" : Stato.nomeSchema;
  tipologiaScelta = nuovo ? null : Stato.categoriaSchema;
  disegnaTipologie();
  document.getElementById("finestra-schema").hidden = false;
  campoNome.focus();
}

function chiudiFinestraSchema() {
  document.getElementById("finestra-schema").hidden = true;
  document.getElementById("nome-nuovo-schema").blur();
}

function scegliTipologia(id) {
  tipologiaScelta = id;
  partenzaScelta = 0; // la prima partenza è quella proposta
  disegnaTipologie();
}

function scegliPartenza(indice) {
  partenzaScelta = indice;
  disegnaTipologie();
}

// I tre pulsanti delle tipologie (le categorie di dati.js) e, sotto,
// i pulsanti della partenza se la tipologia ne ha più di una.
function disegnaTipologie() {
  const contenitore = document.getElementById("tipologie-schema");
  contenitore.replaceChildren();
  for (const c of DATI.categorieSchemi) {
    const b = document.createElement("button");
    b.dataset.tipologia = c.id;
    b.classList.toggle("scelto", c.id === tipologiaScelta);
    b.innerHTML = `<span class="voce">${c.nome}<small>${c.vista === "meta" ? "metà campo" : "campo intero"}</small></span>`;
    contenitore.appendChild(b);
  }

  // Partenza: solo quando si crea uno schema e la tipologia ha più scelte
  const partenze = (categoriaSchema(tipologiaScelta) || {}).partenze || [];
  const sezione = document.getElementById("sezione-partenza");
  sezione.hidden = modoFinestra !== "nuovo" || partenze.length < 2;
  const pulsanti = document.getElementById("partenze-schema");
  pulsanti.replaceChildren();
  partenze.forEach((p, i) => {
    const b = document.createElement("button");
    b.dataset.partenza = i;
    b.textContent = p.nome;
    b.classList.toggle("scelto", i === partenzaScelta);
    pulsanti.appendChild(b);
  });
}

// Mette i giocatori nella partenza scelta (una formazione di dati.js, con la
// sua difesa) senza animazione: diventerà il fotogramma 1 del nuovo schema.
function preparaPartenza(categoria) {
  const partenza = (categoria.partenze || [])[partenzaScelta];
  const formazione = partenza && DATI.formazioni.find(f => f.id === partenza.formazione);
  if (!formazione) return true; // nessuna partenza: si usa la lavagna com'è
  const elenco = formazione.posizioni || formazione.posizioniPalla;
  if (elenco && !elenco[chiaveNumeroGiocatori()]) {
    mostraAvviso(`${partenza.nome}: non disponibile su questo campo`);
    return false;
  }
  if (formazione.squadra === "attacco") {
    applicaAttacco(formazione);
    const difesa = DATI.formazioni.find(f => f.id === formazione.conDifesa);
    if (difesa) applicaDifesa(difesa);
  } else {
    applicaDifesa(formazione);
  }
  Stato.disegni = []; // si parte puliti, senza frecce
  return true;
}

// "Crea schema" / "Applica"
function confermaFinestraSchema() {
  const campoNome = document.getElementById("nome-nuovo-schema");
  const nome = campoNome.value.trim();
  if (!nome) {
    mostraAvviso("Scrivi il nome dello schema");
    campoNome.focus();
    return;
  }
  if (!categoriaSchema(tipologiaScelta)) {
    mostraAvviso("Scegli la tipologia");
    return;
  }
  if (modoFinestra === "nuovo") {
    if (!preparaPartenza(categoriaSchema(tipologiaScelta))) return;
    chiudiFinestraSchema();
    iniziaSchema(tipologiaScelta, nome);
  } else {
    chiudiFinestraSchema();
    Stato.nomeSchema = nome;
    cambiaCategoriaSchema(tipologiaScelta); // ridisegna e salva
    mostraAvviso("Ricordati di salvare lo schema");
  }
}

// Cartelle aperte nel pannello Schemi (si ricordano finché l'app è aperta)
const cartelleAperte = new Set();
function ricordaCartella(id, aperta) {
  if (aperta) cartelleAperte.add(id);
  else cartelleAperte.delete(id);
}

// Pannello "Schemi" (barra destra): una CARTELLA per categoria (si apre e si
// chiude toccandola) con dentro i suoi schemi, della società e personali.
function riempiElencoSchemi() {
  const contenitore = document.getElementById("elenco-schemi");
  contenitore.replaceChildren();
  const schemi = tuttiGliSchemi();

  // Cartelle: le tre categorie di dati.js, più "Altri" solo se serve
  const cartelle = DATI.categorieSchemi.map(c => ({ id: c.id, nome: c.nome, schemi: schemi.filter(s => s.categoria === c.id) }));
  const altri = schemi.filter(s => !categoriaSchema(s.categoria));
  if (altri.length > 0) cartelle.push({ id: "altri", nome: "Altri", schemi: altri });

  // La cartella dello schema aperto si apre da sola
  const aperto = schemi.find(s => s.id === Stato.schemaAperto);
  if (aperto) cartelleAperte.add(categoriaSchema(aperto.categoria) ? aperto.categoria : "altri");

  for (const cartella of cartelle) {
    const intestazione = document.createElement("button");
    intestazione.dataset.tendina = cartella.id;
    intestazione.dataset.cartella = cartella.id;
    intestazione.className = "cartella";
    intestazione.classList.toggle("aperta", cartelleAperte.has(cartella.id));
    intestazione.innerHTML =
      '<svg class="icona" viewBox="0 0 24 24"><path d="M4 6.5h6l2 2h8V19H4z"/></svg>' +
      `<span class="nome-cartella"></span><small>${cartella.schemi.length}</small>` +
      '<svg class="freccia" viewBox="0 0 24 24" width="18" height="18"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    intestazione.querySelector(".nome-cartella").textContent = cartella.nome;
    const dentro = document.createElement("div");
    dentro.className = "tendina";
    contenitore.append(intestazione, dentro);

    if (cartella.schemi.length === 0) {
      const vuota = document.createElement("p");
      vuota.className = "nota";
      vuota.textContent = "Nessuno schema in questa cartella.";
      dentro.appendChild(vuota);
      continue;
    }
    cartella.schemi.sort((a, b) => a.nome.localeCompare(b.nome, "it"));
    for (const s of cartella.schemi) {
      const riga = document.createElement("div");
      riga.className = "riga-schema";
      const apri = document.createElement("button");
      apri.dataset.apriSchema = s.id;
      apri.classList.toggle("scelto", s.id === Stato.schemaAperto);
      apri.innerHTML = `<span class="voce"></span><small></small>`;
      apri.querySelector(".voce").textContent = s.nome;
      apri.querySelector("small").textContent = (s.societa ? "società · " : "") + `${fotogrammiDi(s).length} fot.`;
      riga.appendChild(apri);
      if (schemaModificabile(s)) {
        const elimina = document.createElement("button");
        elimina.dataset.eliminaSchema = s.id;
        elimina.className = "elimina";
        elimina.title = "Elimina";
        elimina.innerHTML = '<svg class="icona" viewBox="0 0 24 24"><path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l1 13h9l1-13"/></svg>';
        riga.appendChild(elimina);
      }
      dentro.appendChild(riga);
    }
  }
}
