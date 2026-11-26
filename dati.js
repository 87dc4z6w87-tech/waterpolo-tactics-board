// ============================================================================
// dati.js — DATI DELLA LAVAGNA (questo file si può modificare a mano)
// ----------------------------------------------------------------------------
// È scritto come un file JSON, ma preceduto da "const DATI =".
// Perché non un vero .json? Aprendo l'app con doppio clic (indirizzo file://)
// il browser, per sicurezza, non lascia leggere file .json esterni.
// Un file .js invece viene caricato senza problemi.
//
// REGOLE PER MODIFICARLO
//   - Testi tra virgolette doppie: "così".
//   - Dopo ogni elemento di un elenco ci va la virgola (tranne l'ultimo va bene lo stesso).
//   - Se l'app non parte dopo una modifica, quasi sempre manca una virgola o una parentesi.
//
// COME SI SCRIVE LA POSIZIONE DI UN GIOCATORE
//   d = distanza in metri dalla linea di porta (di base la porta di DESTRA,
//       quella che sta in alto nella vista "metà campo")
//   l = spostamento laterale in metri dal centro della porta
//       (positivo = a destra di chi attacca quella porta, negativo = a sinistra)
//   porta: "sx" = misura dalla porta di SINISTRA invece che da quella di destra
//   ruolo: "portiere" = disco grigio con il numero 1
//   Esempio: { "d": 2.6, "l": 0 } = centroboa, appena fuori dai 2 metri, davanti alla porta.
//   Usando d e l (e non coordinate assolute) le posizioni funzionano con
//   qualsiasi misura di vasca.
// ============================================================================

const DATI = {
  "campo": {
    // Dimensioni del campo selezionabili (lunghezza = da porta a porta).
    // "giocatori" = quanti per squadra, portiere compreso: scegliendo il campo
    // si sceglie anche quanti giocatori vanno in acqua.
    // "lineaVerde" = a quanti metri dalla porta sta la linea verde tratteggiata.
    // "superiorita" = true se su questo campo esiste l'uomo in più (pulsante +/−).
    // Per aggiungerne una basta copiare una riga e cambiare i numeri.
    "dimensioni": [
      { "id": "regolamentare", "nome": "Campo regolamentare", "lunghezza": 25, "larghezza": 20, "giocatori": 7, "lineaVerde": 6, "superiorita": true },
      { "id": "piccoli",       "nome": "Campo piccoli",       "lunghezza": 19, "larghezza": 13, "giocatori": 6, "lineaVerde": 4, "superiorita": false }
    ],
    "dimensionePredefinita": "regolamentare",

    // Colori del bordo della vasca lungo i lati lunghi, misurati dalla linea di porta.
    // (le linee di porta restano bianche). "fino": "meta" = fino a metà campo.
    // ⚠ DA VERIFICARE: il regolamento tecnico FIN 2019 indica giallo dai 2 ai 6 m
    //   e verde dai 6 m a metà campo. Qui c'è la versione richiesta (giallo fino ai 5 m).
    //   Per cambiarla basta mettere 6 al posto di 5.
    "fasce": [
      { "fino": 2,      "colore": "#e5484d" },
      { "fino": 5,      "colore": "#f5c542" },
      { "fino": "meta", "colore": "#3fbf6f" }
    ],

    // Linea che attraversa il campo (distanza dalla linea di porta, in metri).
    // La linea verde tratteggiata invece dipende dal campo: vedi "lineaVerde" sopra.
    "linea2m": 2,   // disegnata solo nel campo PallanuotoItalia

    // Porta: larghezza interna tra i pali e quanto sporge fuori dalla vasca nel disegno
    "porta": { "larghezza": 3, "profondita": 1 },

    // Dove si mette il portiere quando si applica una formazione:
    // distanza in metri dalla linea di porta (piccola = quasi dentro la porta)
    "distanzaPortiere": 0.15,

    // Area tratteggiata rossa intorno alla porta (solo campo internazionale).
    // ⚠ DA VERIFICARE: misure provvisorie, in attesa del regolamento.
    "areaInternazionale": { "larghezza": 6, "profondita": 2 }
  },

  // ==========================================================================
  // SCHEMI DELLA SOCIETÀ
  // --------------------------------------------------------------------------
  // Uno schema è sempre ANIMATO: una sequenza di fotogrammi (posizione 1, 2, 3...).
  // Le categorie sono tre; "vista" è come si apre il campo per quella categoria:
  //   "meta"   = metà campo con la porta in alto
  //   "intero" = campo intero
  // "partenze" = come si mettono i giocatori quando si crea un nuovo schema di
  //   quella categoria: "formazione" è l'id di una formazione (vedi più sotto,
  //   "formazioni"). Se le partenze sono più di una, nella finestra
  //   "Nuovo schema" si sceglie quale usare (la prima è quella proposta).
  "categorieSchemi": [
    { "id": "schierati",   "nome": "Schierati",                 "vista": "meta",
      "partenze": [ { "nome": "Schierati", "formazione": "schierati" } ] },
    { "id": "superiorita", "nome": "Superiorità o inferiorità", "vista": "meta",
      "partenze": [ { "nome": "4-2", "formazione": "sup-4-2" },
                    { "nome": "3-3", "formazione": "sup-3-3" } ] },
    { "id": "transizione", "nome": "Transizione e controfughe", "vista": "intero",
      "partenze": [ { "nome": "Schierati", "formazione": "schierati" } ] }
  ],

  // Schemi "fissi" della società: compaiono nel menu Schemi di TUTTI i
  // dispositivi che usano questo file, con l'etichetta "società" e non si
  // possono cancellare dall'app.
  // Come aggiungerne uno:
  //   1. disegnalo nell'app e salvalo;
  //   2. Schemi → "Scarica tutti gli schemi" crea un file .json;
  //   3. apri il file con un editor di testo, copia il blocco { ... } dello
  //      schema (dentro "schemi": [ ... ]) e incollalo qui sotto tra le [ ].
  // Gli schemi salvati con l'app invece restano sul dispositivo e si passano
  // agli altri allenatori con "Scarica tutti gli schemi" / "Carica da file".
  "schemiSocieta": [
    {
      "id": "smwwtmmyvk7n7",
      "nome": "Transizione 3-3 a 4-2",
      "categoria": "superiorita",
      "aggiornato": "2026-11-26T00:35:27.559Z",
      "impostazioni": {"dimensione": "regolamentare", "tipoCampo": "internazionale"},
      "squadraInAttacco": "rossa",
      "fotogrammi": [
        // fotogramma 1
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 10},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 3.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 16.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.4, "y": 6.1},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19, "y": 10},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.4, "y": 13.9},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.5, "y": 10},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 4.9},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 15.1},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 7.5},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 10.95},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 18.59, "y": 5.47}
          ], "disegni": [] },
        // fotogramma 2
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 10},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 3.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 16.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.4, "y": 6.1},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19, "y": 10},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.4, "y": 13.9},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.5, "y": 10},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 4.9},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 15.1},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 7.9},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 12.1},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 18.05, "y": 10.05}
          ], "disegni": [] },
        // fotogramma 3
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 10},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 3.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 16.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.4, "y": 6.1},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19, "y": 10},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.4, "y": 13.9},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.5, "y": 10},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 4.9},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 15.1},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 9.05},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 12.5},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 18.54, "y": 14.45}
          ], "disegni": [] },
        // fotogramma 4
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 10},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 3.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 16.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.4, "y": 6.1},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19, "y": 10},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.4, "y": 13.9},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.5, "y": 10},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 4.9},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 15.1},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 9.05},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 12.5},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 22.11, "y": 17.1}
          ], "disegni": [] },
        // fotogramma 5
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.42, "y": 7.36},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 3.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 16.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.99, "y": 8.25},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.98, "y": 11.99},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.17, "y": 12.86},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.5, "y": 10},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 4.9},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 15.1},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 9.05},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 12.5},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 22.02, "y": 17.09}
          ], "disegni": [] },
        // fotogramma 6
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.42, "y": 7.36},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 3.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 16.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.99, "y": 8.25},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.98, "y": 11.99},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.17, "y": 12.86},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.5, "y": 10},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 4.9},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 15.1},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 9.05},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 12.5},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 22.93, "y": 12.95}
          ], "disegni": [] },
        // fotogramma 7
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.42, "y": 7.36},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 3.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 16.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.99, "y": 8.25},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.98, "y": 11.99},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.17, "y": 12.86},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.5, "y": 10},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 4.9},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.8, "y": 15.1},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 9.05},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21, "y": 12.5},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 25.38, "y": 8.93}
          ], "disegni": [] }
      ]
    },
    {
      "id": "smwwu0xohdep6",
      "nome": "entrata triangolo chiuso",
      "categoria": "schierati",
      "aggiornato": "2026-11-26T00:46:34.625Z",
      "impostazioni": {"dimensione": "regolamentare", "tipoCampo": "internazionale"},
      "squadraInAttacco": "rossa",
      "fotogrammi": [
        // fotogramma 1
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 10},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 2.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 5.2},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.43, "y": 8.84},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 3.88},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 17.9, "y": 10.7},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 5.96}
          ], "disegni": [] },
        // fotogramma 2
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 10},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 2.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 5.2},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.43, "y": 8.84},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 3.88},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 18.86, "y": 4.66},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 5.96}
          ], "disegni": [] },
        // fotogramma 3
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 10},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 2.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 5.2},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.43, "y": 8.84},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 3.88},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 19.03, "y": 15.48},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 5.96}
          ], "disegni": [] },
        // fotogramma 4
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.46, "y": 8.76},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 2.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.49, "y": 12.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.48, "y": 10.03},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 3.88},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 21.88, "y": 12.91},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 5.96}
          ], "disegni": [] },
        // fotogramma 5
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.45, "y": 8.09},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 2.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.49, "y": 12.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.48, "y": 10.03},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 3.88},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 25.38, "y": 11.01},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 5.96}
          ], "disegni": [] },
        // fotogramma 6
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.45, "y": 8.09},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 2.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.49, "y": 12.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.51, "y": 11.09},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 3.88},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 21.94, "y": 13.05},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 5.96}
          ], "disegni": [] },
        // fotogramma 7
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.45, "y": 8.09},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 2.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.49, "y": 12.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.51, "y": 11.09},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 3.88},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 21.75, "y": 8.21},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 5.96}
          ], "disegni": [] },
        // fotogramma 8
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.45, "y": 8.09},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 2.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.49, "y": 12.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.51, "y": 11.09},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 3.88},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 25.38, "y": 8.97},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 5.96}
          ], "disegni": [] },
        // fotogramma 9
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.45, "y": 8.09},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 2.8},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.49, "y": 12.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.51, "y": 11.09},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 3.88},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 19.02, "y": 15.5},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.21, "y": 8.76}
          ], "disegni": [] },
        // fotogramma 10
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.45, "y": 8.09},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 20.04, "y": 4.36},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.49, "y": 12.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.51, "y": 11.09},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21.61, "y": 4.49},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 19.12, "y": 4.02},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.21, "y": 8.76}
          ], "disegni": [] },
        // fotogramma 11
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.45, "y": 8.09},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 20.04, "y": 4.36},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.49, "y": 12.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.51, "y": 11.09},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21.61, "y": 4.49},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 21.93, "y": 7.33},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.21, "y": 8.76}
          ], "disegni": [] },
        // fotogramma 12
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.45, "y": 8.09},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 20.04, "y": 4.36},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.49, "y": 12.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.51, "y": 11.09},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 21.61, "y": 4.49},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 25.47, "y": 9.13},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.21, "y": 8.76}
          ], "disegni": [] }
      ]
    },
    {
      "id": "smwwu8ul30iu5",
      "nome": "doppia apertura per palla a boa",
      "categoria": "transizione",
      "aggiornato": "2026-11-26T00:52:43.863Z",
      "impostazioni": {"dimensione": "regolamentare", "tipoCampo": "internazionale"},
      "squadraInAttacco": "rossa",
      "fotogrammi": [
        // fotogramma 1
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 10},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 5.2},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 17.2},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 22.4, "y": 2.8},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 19.6, "y": 14.8},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 18.5, "y": 10},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 19.65, "y": 10},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 3.88},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 22.79, "y": 16.12},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 5.96},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 20.46, "y": 14.04},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 24.31, "y": 10.81},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 23.55, "y": 10}
          ], "disegni": [] },
        // fotogramma 2
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.47, "y": 10.0},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.59, "y": 3.31},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.35, "y": 14.38},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 14.06, "y": 6.16},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.35, "y": 16.71},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 3.57, "y": 11.3},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.5, "y": 10.13},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 12.53, "y": 6.58},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.61, "y": 14.59},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.8, "y": 3.11},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.48, "y": 17.12},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 24.31, "y": 10.81},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.38, "y": 10.03}
          ], "disegni": [] },
        // fotogramma 3
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.47, "y": 10.0},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.59, "y": 3.31},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.35, "y": 14.38},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 12.59, "y": 5.48},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.35, "y": 16.71},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 3.58, "y": 11.26},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.5, "y": 10.13},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 12.62, "y": 1.99},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.61, "y": 14.59},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.8, "y": 3.11},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.48, "y": 17.12},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 13.54, "y": 2.73},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.38, "y": 10.03}
          ], "disegni": [] },
        // fotogramma 4
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.47, "y": 10.0},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.57, "y": 4.48},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.35, "y": 14.38},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 12.59, "y": 5.48},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.35, "y": 16.71},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 3.59, "y": 11.27},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.5, "y": 10.13},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 12.62, "y": 1.99},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.61, "y": 14.59},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.8, "y": 4.38},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.48, "y": 17.12},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 13.54, "y": 2.73},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.38, "y": 10.03}
          ], "disegni": [] },
        // fotogramma 5
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.47, "y": 10.0},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.57, "y": 4.48},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.35, "y": 14.38},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 12.59, "y": 5.48},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.35, "y": 16.71},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 3.52, "y": 11.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.5, "y": 10.13},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 12.62, "y": 1.99},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.61, "y": 14.59},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.85, "y": 2.19},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.48, "y": 17.12},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 4.85, "y": 1.94},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.38, "y": 10.03}
          ], "disegni": [] },
        // fotogramma 6
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.47, "y": 10.0},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.57, "y": 4.48},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.35, "y": 14.38},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 12.59, "y": 5.48},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.35, "y": 16.71},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 3.52, "y": 11.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.5, "y": 10.13},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 12.62, "y": 1.99},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.61, "y": 14.59},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.85, "y": 2.19},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.48, "y": 17.12},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": 3.56, "y": 9.25},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.38, "y": 10.03}
          ], "disegni": [] },
        // fotogramma 7
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.47, "y": 10.0},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.57, "y": 4.48},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.35, "y": 14.38},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 12.59, "y": 5.48},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.35, "y": 16.71},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 3.52, "y": 11.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.5, "y": 10.13},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 12.62, "y": 1.99},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.61, "y": 14.59},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.85, "y": 2.19},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.48, "y": 17.12},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": -0.53, "y": 9.16},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.38, "y": 10.03}
          ], "disegni": [] },
        // fotogramma 8
        { "pezzi": [
            {"id": "pmwwt4idl-17", "tipo": "portiere", "squadra": "rossa", "numero": null, "x": 0.15, "y": 10},
            {"id": "pmwwt4idl-18", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.47, "y": 10.0},
            {"id": "pmwwt4idl-19", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.57, "y": 4.48},
            {"id": "pmwwt4idl-20", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 7.35, "y": 14.38},
            {"id": "pmwwt4idl-21", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 12.59, "y": 5.48},
            {"id": "pmwwt4idl-22", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 2.35, "y": 16.71},
            {"id": "pmwwt4idl-23", "tipo": "giocatore", "squadra": "rossa", "numero": null, "x": 3.52, "y": 11.33},
            {"id": "pmwwt4idl-24", "tipo": "portiere", "squadra": "blu", "numero": null, "x": 24.85, "y": 10},
            {"id": "pmwwt4idl-25", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.5, "y": 10.13},
            {"id": "pmwwt4idl-26", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 12.62, "y": 1.99},
            {"id": "pmwwt4idl-27", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.61, "y": 14.59},
            {"id": "pmwwt4idl-28", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.85, "y": 2.19},
            {"id": "pmwwt4idl-30", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 3.48, "y": 17.12},
            {"id": "pmwwt4idl-31", "tipo": "pallone", "x": -0.53, "y": 9.16},
            {"id": "pmwwto3ht-16", "tipo": "giocatore", "squadra": "blu", "numero": null, "x": 8.38, "y": 10.03}
          ], "disegni": [] }
      ]
    }
  ],

  // Posizioni di partenza dei giocatori.
  // La squadra rossa attacca la porta di destra, la blu la difende.
  "schieramentoIniziale": {
    "7": {
      "rossa": [
        { "ruolo": "portiere", "porta": "sx", "d": 0.15, "l": 0 },
        { "d": 2.6, "l": 0 },
        { "d": 2.3, "l": -4.5 },
        { "d": 2.3, "l": 4.5 },
        { "d": 5.5, "l": -5.5 },
        { "d": 6.5, "l": 0 },
        { "d": 5.5, "l": 5.5 }
      ],
      "blu": [
        { "ruolo": "portiere", "d": 0.15, "l": 0 },
        { "d": 1.45, "l": 0 },
        { "d": 1.3, "l": -3.6 },
        { "d": 1.3, "l": 3.6 },
        { "d": 4.5, "l": -4.6 },
        { "d": 5.2, "l": 0 },
        { "d": 4.5, "l": 4.6 }
      ],
      "pallone": { "d": 7.1, "l": 0.7 }
    },
    // 6 per squadra: pensato per il campo piccoli (largo 13 m, quindi l tra -5.5 e 5.5)
    "6": {
      "rossa": [
        { "ruolo": "portiere", "porta": "sx", "d": 0.15, "l": 0 },
        { "d": 2.6, "l": 0 },
        { "d": 2.3, "l": -4 },
        { "d": 2.3, "l": 4 },
        { "d": 5.5, "l": -2.8 },
        { "d": 5.5, "l": 2.8 }
      ],
      "blu": [
        { "ruolo": "portiere", "d": 0.15, "l": 0 },
        { "d": 1.45, "l": 0 },
        { "d": 1.3, "l": -3.4 },
        { "d": 1.3, "l": 3.4 },
        { "d": 4.4, "l": -2.2 },
        { "d": 4.4, "l": 2.2 }
      ],
      "pallone": { "d": 5.9, "l": 3.6 }
    }
  },

  // ==========================================================================
  // FORMAZIONI
  // --------------------------------------------------------------------------
  // Ogni formazione sposta UNA squadra:
  //   "squadra": "attacco" → la squadra che attacca la porta di destra
  //   "squadra": "difesa"  → la squadra che la difende
  // (quale colore attacca si cambia con il pulsante "Inverti squadre").
  //
  // Due modi di descrivere una formazione:
  //   1) "posizioni": elenco di posizioni { d, l } dei giocatori di movimento
  //      (portiere escluso), una lista per "7" e una per "6".
  //      Facoltativo "pallone": dove mettere la palla, per "7" e per "6".
  //   2) "marcatura": la difesa si mette rispetto agli attaccanti, ovunque siano.
  //      "tipo": "uomo"     → ogni difensore tra il suo attaccante e la porta
  //      "tipo": "pressing" → ogni difensore tra il suo attaccante e la palla, un po' verso la porta
  //      "versoPorta" (solo pressing): 0 = tutto verso la palla, 1 = tutto verso la porta
  //      "centroboaDiLato" (solo pressing): true = il marcatore del centroboa si mette solo
  //        a destra o a sinistra del boa (dalla parte della palla), alla sua stessa altezza
  //      "distanza": quanti metri tra il centro dell'attaccante e quello del difensore
  //
  // "categoria" serve a raggrupparle nel menu (es. "Parità", "Superiorità").
  // "gruppo" (facoltativo): le formazioni con lo stesso gruppo finiscono in un
  //   menu a tendina con quel nome (es. "Difesa a zona" → totale, a M, 1-2).
  // Nel menu compaiono nell'ordine in cui sono scritte qui.
  // Per aggiungerne una: copiare un blocco { ... }, cambiare id, nome e posizioni.
  // ==========================================================================
  "formazioni": [
    // ---------------- PARITÀ · ATTACCO ----------------
    {
      "id": "schierati",
      "nome": "Schierati",
      "categoria": "Parità",
      "squadra": "attacco",
      "posizioni": {
        "7": [
          { "d": 2.6,  "l": 0 },
          { "d": 2.6,  "l": -7.2 },
          { "d": 2.6,  "l": 7.2 },
          { "d": 5.4,  "l": -4.8 },
          { "d": 6.5,  "l": 0 },
          { "d": 5.4,  "l": 4.8 }
        ],
        "6": [
          { "d": 2.6,  "l": 0 },
          { "d": 2.6,  "l": -4.6 },
          { "d": 2.6,  "l": 4.6 },
          { "d": 5.4,  "l": -3 },
          { "d": 5.4,  "l": 3 }
        ]
      },
      "pallone": { "7": { "d": 7.1, "l": 0.7 }, "6": { "d": 5.9, "l": 3.7 } },
      // Scegliendo "Schierati" si applica subito anche questa difesa
      "conDifesa": "difesa-uomo"
    },

    // ---------------- PARITÀ · DIFESA ----------------
    {
      "id": "difesa-uomo",
      "nome": "Difesa a uomo",
      "categoria": "Parità",
      "squadra": "difesa",
      "marcatura": { "tipo": "uomo", "distanza": 1.15 }
    },
    {
      "id": "pressing",
      "nome": "Pressing",
      "categoria": "Parità",
      "squadra": "difesa",
      "marcatura": { "tipo": "pressing", "distanza": 1.15, "versoPorta": 0.3, "centroboaDiLato": true }
    },
    // Le tre zone (versione a 7) sono misurate sulle immagini dell'allenatore.
    // Le versioni a 6 (campo piccoli, 5 difensori) sono un adattamento.
    {
      // Zona totale: un difensore accanto al centroboa, due all'altezza delle ali
      // ma stretti, due a 4 m e uno davanti, in mezzo
      "id": "zona-totale",
      "nome": "Zona totale",
      "gruppo": "Difesa a zona",
      "categoria": "Parità",
      "squadra": "difesa",
      "posizioni": {
        "7": [
          { "d": 1.85, "l": -1.05 },
          { "d": 2.15, "l": -3.85 },
          { "d": 2.15, "l": 3.85 },
          { "d": 3.9,  "l": -2.65 },
          { "d": 3.9,  "l": 2.65 },
          { "d": 4.7,  "l": 0 }
        ],
        "6": [
          { "d": 1.85, "l": -1.0 },
          { "d": 2.15, "l": -2.6 },
          { "d": 2.15, "l": 2.6 },
          { "d": 3.8,  "l": -1.8 },
          { "d": 3.8,  "l": 1.8 }
        ]
      }
    },
    {
      // Zona a M: difensori delle ali larghi e vicini alla porta, uno accanto
      // al centroboa, uno davanti a lui e due più fuori (il disegno forma una "M")
      "id": "zona-m",
      "nome": "Zona a M",
      "gruppo": "Difesa a zona",
      "categoria": "Parità",
      "squadra": "difesa",
      "posizioni": {
        "7": [
          { "d": 1.85, "l": -1.05 },
          { "d": 1.6,  "l": -6.15 },
          { "d": 1.6,  "l": 6.15 },
          { "d": 3.9,  "l": 0 },
          { "d": 4.3,  "l": -3.05 },
          { "d": 4.3,  "l": 3.05 }
        ],
        "6": [
          { "d": 1.85, "l": -1.0 },
          { "d": 1.6,  "l": -3.6 },
          { "d": 1.6,  "l": 3.6 },
          { "d": 4.0,  "l": -1.6 },
          { "d": 4.0,  "l": 1.6 }
        ]
      }
    },
    {
      // Zona 1-2: uno accanto al centroboa, due stretti all'altezza delle ali,
      // due fuori a 4,6 m e uno più avanti al centro, sul tiratore
      "id": "zona-1-2",
      "nome": "Zona 1-2",
      "gruppo": "Difesa a zona",
      "categoria": "Parità",
      "squadra": "difesa",
      "posizioni": {
        "7": [
          { "d": 1.9,  "l": -1.05 },
          { "d": 2.1,  "l": -3.9 },
          { "d": 2.1,  "l": 3.9 },
          { "d": 4.65, "l": -3.8 },
          { "d": 4.65, "l": 3.8 },
          { "d": 5.3,  "l": 0 }
        ],
        "6": [
          { "d": 1.9,  "l": -1.0 },
          { "d": 2.1,  "l": -2.7 },
          { "d": 2.1,  "l": 2.7 },
          { "d": 4.6,  "l": -2.0 },
          { "d": 4.6,  "l": 2.0 }
        ]
      }
    },

    // ---------------- SUPERIORITÀ · ATTACCO (pulsante "uomo in più") ----------------
    // Solo campo regolamentare: l'attacco ha 6 giocatori di movimento contro 5.
    // "conDifesa" sistema la difesa con un uomo in meno: il difensore in più
    // viene TOLTO dal campo (espulso). Rientra quando si sceglie una formazione
    // in parità (la difesa a uomo / pressing / zona ricrea chi manca).
    {
      // 4-2: quattro sulla linea davanti (fuori dai 2 m) e due dietro.
      // Posizioni misurate sulle immagini dell'allenatore.
      "id": "sup-4-2",
      "nome": "Superiorità 4-2",
      "categoria": "Superiorità",
      "squadra": "attacco",
      "posizioni": {
        "7": [
          { "d": 2.6, "l": -6.9 },
          { "d": 2.6, "l": -2.0 },
          { "d": 2.6, "l": 2.0 },
          { "d": 2.6, "l": 6.9 },
          { "d": 6.5, "l": -2.9 },
          { "d": 6.5, "l": 2.9 }
        ]
      },
      "pallone": { "7": { "d": 7.4, "l": 3.3 } },
      "conDifesa": "inf-4-2"
    },
    {
      // 3-3: tre davanti (centroboa e due ali, fuori dai 2 m) e tre dietro.
      // Posizioni misurate sulle immagini dell'allenatore.
      "id": "sup-3-3",
      "nome": "Superiorità 3-3",
      "categoria": "Superiorità",
      "squadra": "attacco",
      "posizioni": {
        "7": [
          { "d": 2.6, "l": -6.2 },
          { "d": 2.6, "l": 0 },
          { "d": 2.6, "l": 6.2 },
          { "d": 5.6, "l": -3.9 },
          { "d": 6.0, "l": 0 },
          { "d": 5.6, "l": 3.9 }
        ]
      },
      "pallone": { "7": { "d": 6.9, "l": 0 } },
      "conDifesa": "inf-3-3"
    },

    // ---------------- DIFESE CON UN UOMO IN MENO (usate in automatico) ----------------
    // "nascosta": true = non compaiono nei menu (le difese in inferiorità
    // verranno aggiunte in futuro). "espulso": true = il difensore che resta
    // senza posizione viene tolto dal campo.
    //
    // "posizioniPalla": la difesa cambia in base a dove si trova la palla.
    //   Ogni voce ha "palla" (una posizione di riferimento) e le "posizioni"
    //   dei difensori. Si usa la voce con la palla di riferimento più vicina
    //   alla palla vera: spostando la palla, la difesa scivola sulla voce giusta.
    {
      // Contro il 4-2: misurata sulle quattro immagini dell'allenatore.
      // Tre difensori davanti scivolano verso il lato della palla,
      // due dietro a ~4,5 m (si abbassano a ~4 m quando la palla è sull'ala).
      "id": "inf-4-2",
      "nome": "Difesa in inferiorità (contro 4-2)",
      "nascosta": true,
      "categoria": "Inferiorità",
      "squadra": "difesa",
      "espulso": true,
      "posizioniPalla": {
        "7": [
          {
            // palla al giocatore dietro a destra (disposizione base)
            "palla": { "d": 7.4, "l": 3.3 },
            "posizioni": [
              { "d": 2.6,  "l": -3.2 },
              { "d": 2.55, "l": 0.85 },
              { "d": 2.5,  "l": 5.75 },
              { "d": 4.5,  "l": -2.2 },
              { "d": 4.5,  "l": 2.2 }
            ]
          },
          {
            // palla all'ala destra
            "palla": { "d": 2.8, "l": 7.75 },
            "posizioni": [
              { "d": 2.6,  "l": -3.2 },
              { "d": 2.55, "l": 0.85 },
              { "d": 2.5,  "l": 5.75 },
              { "d": 4.0,  "l": -2.0 },
              { "d": 3.95, "l": 2.1 }
            ]
          },
          {
            // palla al giocatore dietro a sinistra
            "palla": { "d": 7.4, "l": -3.3 },
            "posizioni": [
              { "d": 2.5,  "l": -5.75 },
              { "d": 2.55, "l": -0.85 },
              { "d": 2.6,  "l": 3.2 },
              { "d": 4.5,  "l": -2.2 },
              { "d": 4.5,  "l": 2.2 }
            ]
          },
          {
            // palla all'ala sinistra
            "palla": { "d": 2.8, "l": -7.75 },
            "posizioni": [
              { "d": 2.5,  "l": -5.75 },
              { "d": 2.55, "l": -0.85 },
              { "d": 2.6,  "l": 3.2 },
              { "d": 3.95, "l": -2.1 },
              { "d": 4.0,  "l": 2.0 }
            ]
          }
        ]
      }
    },
    {
      // Contro il 3-3: misurata sulle tre immagini dell'allenatore.
      // Due difensori sulle ali, uno dietro al centroboa (fermi);
      // i due a 4 m scivolano verso il lato della palla.
      "id": "inf-3-3",
      "nome": "Difesa in inferiorità (contro 3-3)",
      "nascosta": true,
      "categoria": "Inferiorità",
      "squadra": "difesa",
      "espulso": true,
      "posizioniPalla": {
        "7": [
          {
            // palla al centrale dietro (disposizione base)
            "palla": { "d": 6.9, "l": 0 },
            "posizioni": [
              { "d": 2.2, "l": -5.1 },
              { "d": 1.5, "l": 0 },
              { "d": 2.2, "l": 5.1 },
              { "d": 4.0, "l": -2.1 },
              { "d": 4.0, "l": 2.1 }
            ]
          },
          {
            // palla al dietro di destra
            "palla": { "d": 6.5, "l": 4.3 },
            "posizioni": [
              { "d": 2.2, "l": -5.1 },
              { "d": 1.5, "l": 0 },
              { "d": 2.2, "l": 5.1 },
              { "d": 4.0, "l": -0.95 },
              { "d": 4.0, "l": 2.5 }
            ]
          },
          {
            // palla al dietro di sinistra
            "palla": { "d": 6.5, "l": -4.3 },
            "posizioni": [
              { "d": 2.2, "l": -5.1 },
              { "d": 1.5, "l": 0 },
              { "d": 2.2, "l": 5.1 },
              { "d": 4.0, "l": -2.5 },
              { "d": 4.0, "l": 0.95 }
            ]
          }
        ]
      }
    }
  ]
};
