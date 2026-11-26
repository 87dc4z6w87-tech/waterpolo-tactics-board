// ============================================================================
// esporta.js — immagine PNG della lavagna (da mandare su WhatsApp)
// ----------------------------------------------------------------------------
// Come funziona:
//   1. si fa una copia del disegno SVG così com'è sullo schermo
//      (stessa vista: campo intero o metà campo), con lo sfondo blu notte;
//   2. la copia diventa un'immagine che viene "dipinta" su un Canvas;
//   3. il Canvas viene salvato come file PNG.
// Su tablet e telefono si apre il menu "Condividi" (WhatsApp, ecc.);
// sul computer il file viene scaricato.
// ============================================================================

const PIXEL_PER_METRO = 60; // risoluzione dell'immagine (60 px ogni metro di vasca)

async function esportaPNG() {
  const svg = document.getElementById("lavagna");
  const [vx, vy, vw, vh] = svg.getAttribute("viewBox").split(" ").map(Number);
  const larghezza = Math.round(vw * PIXEL_PER_METRO);
  const altezza = Math.round(vh * PIXEL_PER_METRO);

  // 1. Copia dell'SVG con dimensioni in pixel e sfondo
  const copia = svg.cloneNode(true);
  copia.removeAttribute("id");
  copia.setAttribute("xmlns", NS_SVG);
  copia.setAttribute("width", larghezza);
  copia.setAttribute("height", altezza);
  copia.querySelector("#traccia")?.remove();

  const defs = copia.querySelector("defs");
  const sfumatura = creaSVG("radialGradient", { id: "sfondo-esporta", cx: "50%", cy: "50%", r: "75%" }, defs);
  creaSVG("stop", { offset: "0%", "stop-color": "#18325c" }, sfumatura);
  creaSVG("stop", { offset: "55%", "stop-color": "#0c1a35" }, sfumatura);
  creaSVG("stop", { offset: "100%", "stop-color": "#060d1c" }, sfumatura);
  const sfondo = creaSVG("rect", { x: vx, y: vy, width: vw, height: vh, fill: "url(#sfondo-esporta)" });
  copia.insertBefore(sfondo, copia.querySelector("#contenuto"));

  // Nome dello schema in alto a destra, piccolo e grigio come nell'app
  const nome = creaSVG("text", {
    x: vx + vw - 0.3, y: vy + 0.6, "text-anchor": "end", "font-size": 0.45,
    fill: "#7f8ba0", "font-family": "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
  }, copia);
  nome.textContent = Stato.nomeSchema;

  // 2. Da SVG a immagine, e da immagine a Canvas
  const testo = new XMLSerializer().serializeToString(copia);
  const indirizzo = URL.createObjectURL(new Blob([testo], { type: "image/svg+xml" }));
  try {
    const immagine = await caricaImmagine(indirizzo);
    const canvas = document.createElement("canvas");
    canvas.width = larghezza;
    canvas.height = altezza;
    canvas.getContext("2d").drawImage(immagine, 0, 0, larghezza, altezza);

    // 3. Canvas → file PNG
    const blob = await new Promise(risolvi => canvas.toBlob(risolvi, "image/png"));
    const nomeFile = `${nomePerFile(Stato.nomeSchema)}.png`;
    await condividiOScarica(blob, nomeFile);
  } catch (errore) {
    console.warn("Esportazione non riuscita:", errore);
    mostraAvviso("Non sono riuscito a creare l'immagine");
  } finally {
    URL.revokeObjectURL(indirizzo);
  }
}

function caricaImmagine(indirizzo) {
  return new Promise((risolvi, rifiuta) => {
    const img = new Image();
    img.onload = () => risolvi(img);
    img.onerror = rifiuta;
    img.src = indirizzo;
  });
}

// "Lavagna libera" → "lavagna-libera" (senza spazi né caratteri strani)
function nomePerFile(testo) {
  return testo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "schema";
}

// Su dispositivi touch prova il menu "Condividi"; altrimenti scarica il file.
// Usata sia per le immagini PNG sia per il file degli schemi (.json).
// Online (dentro claude.ai) i download normali sono bloccati: si usa la
// capacità "downloads", che chiede conferma a chi guarda.
async function condividiOScarica(blob, nomeFile, tipo = "image/png") {
  if (window.claude && typeof window.claude.use === "function") {
    const downloads = await window.claude.use("downloads");
    if (!downloads) {
      mostraAvviso("In questa pagina non si possono scaricare file");
      return;
    }
    try {
      await downloads.save({ filename: nomeFile, data: blob });
      mostraAvviso(`File salvato: ${nomeFile}`);
    } catch (errore) {
      if (errore && errore.code === "declined") return; // ha detto di no
      if (errore && errore.code === "rate_limited") mostraAvviso("Attendi un attimo e riprova");
      else mostraAvviso("Non sono riuscito a scaricare il file");
    }
    return;
  }
  const file = new File([blob], nomeFile, { type: tipo });
  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (touch && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: Stato.nomeSchema });
      return;
    } catch (errore) {
      if (errore.name === "AbortError") return; // l'utente ha chiuso il menu
      // altri errori: si prova a scaricare
    }
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nomeFile;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  mostraAvviso(`File salvato: ${nomeFile}`);
}
