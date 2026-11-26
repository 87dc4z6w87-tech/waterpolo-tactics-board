// ============================================================================
// app.js — avvio dell'app e collegamento dei pulsanti
// ----------------------------------------------------------------------------
// Qui non si disegna nulla direttamente: si leggono i tocchi sui pulsanti,
// si cambia lo Stato e si chiama ridisegnaTutto().
// ============================================================================

// Ridisegna campo e pezzi, aggiorna i pulsanti e salva.
function ridisegnaTutto() {
  aggiornaVista();
  disegnaCampo();
  disegnaDisegni();
  disegnaPezzi();
  aggiornaInterfaccia();
  salvaStato();
}

// Evidenzia le opzioni scelte nei pannelli e nelle barre.
function aggiornaInterfaccia() {
  document.querySelectorAll("[data-imposta]").forEach(bottone => {
    const chiave = bottone.dataset.imposta;
    bottone.classList.toggle("scelto", String(Stato.impostazioni[chiave]) === bottone.dataset.valore);
  });
  document.querySelector('[data-azione="numeri"]').classList.toggle("attivo", modalitaNumeri);
  document.getElementById("nome-schema").textContent = Stato.nomeSchema;
  const nomi = { rossa: "rossi", blu: "blu" };
  document.getElementById("info-attacco").textContent =
    `Attaccano i ${nomi[Stato.squadraInAttacco]}, difendono i ${nomi[squadraInDifesa()]}. Per scambiarli usa "Inverti squadre".`;
  document.getElementById("info-superiorita").textContent =
    `I ${nomi[Stato.squadraInAttacco]} attaccano con un uomo in più: un difensore dei ${nomi[squadraInDifesa()]} viene tolto (espulso).`;
  // Uomo in più / in meno: solo sul campo regolamentare (per i piccoli non esiste)
  document.getElementById("pulsante-superiorita").hidden = !campoScelto().superiorita;

  // Disegno: matita accesa se c'è uno strumento attivo, strumento e colore scelti,
  // annulla/ripeti spenti se non c'è niente da annullare/ripetere
  document.getElementById("pulsante-disegno").classList.toggle("attivo", !!strumento);
  document.querySelectorAll("[data-strumento]").forEach(b => {
    b.classList.toggle("scelto", (b.dataset.strumento === "sposta" ? null : b.dataset.strumento) === strumento);
  });
  document.querySelectorAll("[data-colore]").forEach(b => b.classList.toggle("scelto", b.dataset.colore === coloreDisegno));
  document.querySelector('[data-azione="annulla"]').disabled = Storia.passati.length === 0;
  document.querySelector('[data-azione="ripeti"]').disabled = Storia.futuri.length === 0;

  // Schemi animati: barra dei fotogrammi in basso
  aggiornaBarraFotogrammi();
}

// Annulla o ripeti l'ultima modifica (pedine, formazioni, numeri, disegni).
function annullaORipeti(indietro) {
  if (inRiproduzione) return;
  const fatto = indietro ? annulla() : ripeti();
  if (!fatto) return;
  tracciaInCorso = null;
  ridisegnaTutto();
}

// ---------------------------------------------------------------------------
// PANNELLI (i menu che si aprono accanto alle barre)
// ---------------------------------------------------------------------------
function chiudiPannelli() {
  document.querySelectorAll(".pannello.aperto").forEach(p => p.classList.remove("aperto"));
  document.querySelectorAll(".barra button.aperto").forEach(b => b.classList.remove("aperto"));
}

function apriPannello(id, bottone) {
  const pannello = document.getElementById(id);
  const eraAperto = pannello.classList.contains("aperto");
  chiudiPannelli();
  if (eraAperto) return; // secondo tocco sulla stessa icona = chiudi

  aggiornaInterfaccia(); // es. annulla/ripeti accesi o spenti
  if (id === "pannello-schemi") riempiElencoSchemi();
  pannello.classList.add("aperto");
  bottone.classList.add("aperto");

  // Posiziona il pannello accanto all'icona, dalla parte del campo
  const r = bottone.getBoundingClientRect();
  const daSinistra = bottone.closest(".barra").id === "barra-sinistra";
  pannello.style.left = daSinistra ? `${r.right + 12}px` : "";
  pannello.style.right = daSinistra ? "" : `${window.innerWidth - r.left + 12}px`;
  const altezza = pannello.offsetHeight;
  const top = Math.min(Math.max(12, r.top + r.height / 2 - altezza / 2), window.innerHeight - altezza - 12);
  pannello.style.top = `${top}px`;
}

// ---------------------------------------------------------------------------
// CAMBIO DELLE IMPOSTAZIONI
// ---------------------------------------------------------------------------
async function cambiaImpostazione(chiave, valore) {
  const imp = Stato.impostazioni;

  if (chiave === "dimensione") {
    // Cambiare campo cambia anche il numero di giocatori (7 o 6):
    // i giocatori tornano nelle posizioni iniziali del nuovo campo.
    if (valore === imp.dimensione) return;
    chiudiPannelli();
    const avviso = inSchema()
      ? "Cambiando le dimensioni del campo lo schema aperto viene chiuso e i giocatori tornano nelle posizioni iniziali."
      : "Cambiando le dimensioni del campo i giocatori tornano nelle posizioni iniziali.";
    if (!(await chiediConferma(avviso, "Cambia campo"))) return;
    imp.dimensione = valore;
    creaPezziIniziali();
    Stato.disegni = []; // i disegni erano fatti per l'altro campo
    if (inSchema()) {
      // anche i fotogrammi erano fatti per l'altro campo
      Stato.fotogrammi = null;
      Stato.categoriaSchema = null;
      Stato.schemaAperto = null;
      Stato.nomeSchema = "Lavagna libera";
    }
  } else {
    imp[chiave] = valore;
  }
  ridisegnaTutto();
}

// ---------------------------------------------------------------------------
// ELENCO DELLE FORMAZIONI in un pannello
// Prende da dati.js le formazioni che passano il "filtro", le raggruppa per
// categoria e poi Attacco/Difesa. Quelle con lo stesso "gruppo" vanno in un
// menu a tendina (un pulsante che apre/chiude un contenitore con le varianti).
// ---------------------------------------------------------------------------
function riempiElencoFormazioni(contenitore, filtro) {
  const formazioni = DATI.formazioni.filter(f => !f.nascosta && filtro(f));
  const categorie = [...new Set(formazioni.map(f => f.categoria))];
  for (const categoria of categorie) {
    for (const parte of ["attacco", "difesa"]) {
      const gruppo = formazioni.filter(f => f.categoria === categoria && f.squadra === parte);
      if (gruppo.length === 0) continue;
      const titolo = document.createElement("h3");
      titolo.textContent = `${categoria} · ${parte === "attacco" ? "Attacco" : "Difesa"}`;
      contenitore.appendChild(titolo);
      const tendine = new Map(); // nome del gruppo → contenitore della tendina
      for (const f of gruppo) {
        let genitore = contenitore;
        if (f.gruppo) {
          if (!tendine.has(f.gruppo)) {
            const apri = document.createElement("button");
            apri.dataset.tendina = f.gruppo;
            apri.innerHTML = `${f.gruppo}<svg class="freccia" viewBox="0 0 24 24" width="18" height="18">` +
              `<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const tendina = document.createElement("div");
            tendina.className = "tendina";
            contenitore.append(apri, tendina);
            tendine.set(f.gruppo, tendina);
          }
          genitore = tendine.get(f.gruppo);
        }
        const b = document.createElement("button");
        b.dataset.formazione = f.id;
        b.textContent = f.nome;
        genitore.appendChild(b);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// AVVIO
// ---------------------------------------------------------------------------
function avvia() {
  caricaStato();
  caricaSchemi();
  avviaCondivisione(); // solo online (dentro claude.ai): schemi condivisi tra allenatori

  // Elenco delle dimensioni del campo, preso da dati.js
  // (nome in grande, misure e giocatori in piccolo sotto)
  const elenco = document.getElementById("elenco-dimensioni");
  for (const d of DATI.campo.dimensioni) {
    const b = document.createElement("button");
    b.dataset.imposta = "dimensione";
    b.dataset.valore = d.id;
    b.innerHTML = `<span class="voce">${d.nome}<small>${d.lunghezza} × ${d.larghezza} m · ${d.giocatori} contro ${d.giocatori}</small></span>`;
    elenco.appendChild(b);
  }

  // Elenco delle formazioni, preso da dati.js (vedi riempiElencoFormazioni).
  // Le formazioni "Superiorità" vanno nel pannello Uomo in più, le altre in Formazioni.
  // Quelle con "nascosta": true non compaiono in nessun menu.
  riempiElencoFormazioni(document.getElementById("elenco-formazioni"), f => f.categoria !== "Superiorità");
  riempiElencoFormazioni(document.getElementById("elenco-superiorita"), f => f.categoria === "Superiorità");

  // Pallini dei colori per i disegni, presi da disegno.js
  const colori = document.getElementById("colori-disegno");
  for (const colore of COLORI_DISEGNO) {
    const b = document.createElement("button");
    b.dataset.colore = colore;
    b.style.background = colore;
    b.title = "Colore";
    colori.appendChild(b);
  }

  // Frecce e penna: ascolta il dito sul campo quando uno strumento è attivo
  attivaDisegno();

  // Un solo "ascoltatore" per tutti i clic: guarda quale pulsante è stato toccato
  document.addEventListener("click", evento => {
    const bottone = evento.target.closest("button");
    if (!bottone) return;
    const d = bottone.dataset;

    // Durante la riproduzione di uno schema si può solo fermarla
    if (inRiproduzione && d.azione !== "riproduci") {
      mostraAvviso("Ferma prima la riproduzione (■)");
      return;
    }

    if (d.numero) scegliNumero(d.numero);
    else if (d.formazione) applicaFormazione(d.formazione);
    else if (d.tendina) {
      // apre/chiude il menu a tendina (o la cartella degli schemi)
      bottone.classList.toggle("aperta");
      if (d.cartella) ricordaCartella(d.cartella, bottone.classList.contains("aperta"));
    }
    else if (d.pannello) apriPannello(d.pannello, bottone);
    else if (d.imposta) cambiaImpostazione(d.imposta, d.valore);
    else if (d.aggiungi) { aggiungiPezzo(d.aggiungi, d.squadra); chiudiPannelli(); }
    else if (d.arrivo) mostraAvviso(`${d.arrivo}: in arrivo nei prossimi passi`);
    else if (d.azione === "inverti") { invertiSquadre(); aggiornaInterfaccia(); mostraAvviso("Squadre invertite"); }
    else if (d.azione === "numeri") {
      if (!modalitaNumeri && strumento) scegliStrumento(null); // numeri e disegno non insieme
      attivaModalitaNumeri(!modalitaNumeri);
      aggiornaInterfaccia();
    }
    else if (d.strumento) { scegliStrumento(d.strumento === "sposta" ? null : d.strumento); chiudiPannelli(); }
    else if (d.colore) { coloreDisegno = d.colore; aggiornaInterfaccia(); }
    else if (d.azione === "annulla") annullaORipeti(true);
    else if (d.azione === "ripeti") annullaORipeti(false);
    else if (d.azione === "cancella-disegni") { cancellaTuttiDisegni(); aggiornaInterfaccia(); }
    else if (d.azione === "esporta") esportaPNG();
    // Schemi della società (schemi.js)
    else if (d.apriSchema) apriSchema(d.apriSchema);
    else if (d.eliminaSchema) eliminaSchema(d.eliminaSchema);
    // Finestra "Nuovo schema" / "Nome e tipologia"
    else if (d.azione === "apri-nuovo-schema") apriFinestraSchema("nuovo");
    else if (d.azione === "dettagli-schema") apriFinestraSchema("dettagli");
    else if (d.tipologia) scegliTipologia(d.tipologia);
    else if (d.partenza !== undefined) scegliPartenza(Number(d.partenza));
    else if (d.azione === "conferma-finestra") confermaFinestraSchema();
    else if (d.azione === "chiudi-finestra") chiudiFinestraSchema();
    else if (d.conferma) rispondiConferma(d.conferma === "si");
    // Barra dei fotogrammi: salva e chiudi lo schema
    else if (d.azione === "salva-schema") salvaSchema();
    else if (d.azione === "chiudi-schema") chiudiSchema();
    else if (d.azione === "nuova-lavagna") nuovaLavagna();
    // Schemi animati: barra dei fotogrammi (animazione.js)
    else if (d.fotogramma !== undefined) vaiAFotogramma(Number(d.fotogramma));
    else if (d.azione === "riproduci") riproduci();
    else if (d.azione === "aggiungi-fotogramma") aggiungiFotogramma();
    else if (d.azione === "elimina-fotogramma") eliminaFotogramma();
    else if (d.azione === "esporta-schemi") esportaSchemi();
    else if (d.azione === "importa-schemi") document.getElementById("file-schemi").click();
  });

  // File scelto con "Carica schemi da file"
  const sceltaFile = document.getElementById("file-schemi");
  sceltaFile.addEventListener("change", () => {
    if (sceltaFile.files[0]) importaSchemi(sceltaFile.files[0]);
    sceltaFile.value = ""; // così si può ricaricare lo stesso file
  });

  // Invio nella casella del nome = conferma la finestra
  document.getElementById("nome-nuovo-schema").addEventListener("keydown", evento => {
    if (evento.key === "Enter") confermaFinestraSchema();
  });

  // Tocco sullo sfondo scuro fuori dalla finestra = chiudi la finestra
  document.getElementById("finestra-schema").addEventListener("click", evento => {
    if (evento.target.id === "finestra-schema") chiudiFinestraSchema();
  });
  document.getElementById("finestra-conferma").addEventListener("click", evento => {
    if (evento.target.id === "finestra-conferma") rispondiConferma(false);
  });

  // Tastiera (sul computer): Esc chiude il pannello, Cmd/Ctrl+Z annulla,
  // Cmd/Ctrl+Maiusc+Z ripete
  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
      chiudiPannelli();
      chiudiFinestraSchema();
      if (!document.getElementById("finestra-conferma").hidden) rispondiConferma(false);
    }
    const scrivendo = evento.target.closest("input, textarea");
    if (!scrivendo && (evento.metaKey || evento.ctrlKey) && evento.key.toLowerCase() === "z") {
      evento.preventDefault();
      annullaORipeti(!evento.shiftKey);
    }
  });

  // Tocco fuori da un pannello = chiudi il pannello
  document.addEventListener("pointerdown", evento => {
    if (!evento.target.closest(".pannello, [data-pannello]")) chiudiPannelli();
  });
  window.addEventListener("resize", chiudiPannelli);

  ridisegnaTutto();
}

avvia();
