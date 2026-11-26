// ============================================================================
// utilita.js — piccoli strumenti usati da tutti gli altri file
// ============================================================================

// Gli elementi SVG vanno creati con un "namespace" diverso da quelli HTML.
const NS_SVG = "http://www.w3.org/2000/svg";

// Crea un elemento SVG, gli assegna gli attributi e (se indicato) lo aggiunge
// dentro a "genitore". Esempio:
//   creaSVG("circle", { cx: 5, cy: 5, r: 1, fill: "red" }, gruppo)
function creaSVG(tag, attributi = {}, genitore = null) {
  const elemento = document.createElementNS(NS_SVG, tag);
  for (const [nome, valore] of Object.entries(attributi)) {
    elemento.setAttribute(nome, valore);
  }
  if (genitore) genitore.appendChild(elemento);
  return elemento;
}

// Copia "profonda" di un oggetto (anche degli oggetti al suo interno):
// modificando la copia, l'originale non cambia.
function copia(valore) {
  return JSON.parse(JSON.stringify(valore));
}

// Chiede conferma con una finestra dell'app (al posto di confirm() del browser,
// che nella versione online non funziona). Restituisce una Promise:
//   if (!(await chiediConferma("Eliminare?", "Elimina"))) return;
let rispostaConferma = null;
function chiediConferma(testo, etichettaSi = "Continua") {
  document.getElementById("testo-conferma").textContent = testo;
  document.getElementById("pulsante-conferma-si").textContent = etichettaSi;
  document.getElementById("finestra-conferma").hidden = false;
  return new Promise(risolvi => { rispostaConferma = risolvi; });
}
// Chiamata dai pulsanti della finestra (o da Esc / tocco fuori = no)
function rispondiConferma(si) {
  document.getElementById("finestra-conferma").hidden = true;
  if (rispostaConferma) rispostaConferma(si);
  rispostaConferma = null;
}

// Mostra per un paio di secondi un messaggio in alto al centro.
let timerAvviso = null;
function mostraAvviso(testo) {
  const avviso = document.getElementById("avviso");
  avviso.textContent = testo;
  avviso.classList.add("visibile");
  clearTimeout(timerAvviso);
  timerAvviso = setTimeout(() => avviso.classList.remove("visibile"), 2000);
}

// Converte la posizione del dito/mouse (in pixel dello schermo) nelle
// coordinate interne del disegno SVG (in metri, nella vista attuale).
function puntoNelloSVG(evento) {
  const svg = document.getElementById("lavagna");
  const punto = new DOMPoint(evento.clientX, evento.clientY);
  return punto.matrixTransform(svg.getScreenCTM().inverse());
}
