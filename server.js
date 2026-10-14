const http = require("http");
const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────────────────
//  VERSIONES — actualizar SIEMPRE al publicar, y que coincidan EXACTAMENTE
//  con el "version" del manifest de cada paquete.
//
//  Si el numero de aca es MENOR que el instalado, el navegador considera que
//  no hay nada nuevo y no actualiza a nadie. No falla, no avisa: simplemente
//  las maquinas se quedan en la version vieja para siempre.
// ─────────────────────────────────────────────────────────────────────────
const CHROME_VERSION = "1.6.4";
const FIREFOX_VERSION = "1.6.4";

const CHROME_ID = "iebpkhmlapcdgpboknmejaalpjmgneda";
const FIREFOX_ID = "redmine-dark-mode@vgmsistemas.com.ar";

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, "public");
const CRX_PATH = path.join(PUBLIC, "redmine-dark-mode.crx");
const XPI_PATH = path.join(PUBLIC, "redmine-dark-mode.xpi");

function sendFile(res, filePath, contentType, faltaMsg) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(faltaMsg);
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const host = req.headers.host;

  // ── Chrome ────────────────────────────────────────────────────────────
  if (req.url === "/update.xml") {
    const codebase = `https://${host}/redmine-dark-mode.crx`;
    const xml = `<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='${CHROME_ID}'>
    <updatecheck codebase='${codebase}' version='${CHROME_VERSION}' />
  </app>
</gupdate>`;
    res.writeHead(200, { "Content-Type": "application/xml" });
    res.end(xml);
    return;
  }

  if (req.url === "/redmine-dark-mode.crx") {
    sendFile(res, CRX_PATH, "application/x-chrome-extension",
      "crx no encontrado — copialo a public/redmine-dark-mode.crx");
    return;
  }

  // ── Firefox ───────────────────────────────────────────────────────────
  //
  // Formato del manifiesto de actualizacion de Firefox (JSON, no XML como
  // Chrome). La clave de "addons" es el id de gecko del manifest.
  //
  // Firefox exige que la update_url sea HTTPS. Railway ya la da, por eso
  // este servidor sirve para las dos cosas.
  //
  // El .xpi que se sirve tiene que ser el FIRMADO POR MOZILLA que se baja
  // del Developer Hub, no el .zip del build. Un zip sin firmar no lo
  // instala ningun Firefox de release ni ESR.
  if (req.url === "/updates.json") {
    const updates = {
      addons: {
        [FIREFOX_ID]: {
          updates: [
            {
              version: FIREFOX_VERSION,
              update_link: `https://${host}/redmine-dark-mode.xpi`,
              applications: {
                gecko: { strict_min_version: "115.0" }
              }
            }
          ]
        }
      }
    };
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(updates, null, 2));
    return;
  }

  if (req.url === "/redmine-dark-mode.xpi") {
    sendFile(res, XPI_PATH, "application/x-xpinstall",
      "xpi no encontrado — baja el firmado del Developer Hub de AMO y copialo a public/redmine-dark-mode.xpi");
    return;
  }

  // ── Estado ────────────────────────────────────────────────────────────
  // Sirve para verificar de un vistazo, sin abrir Railway, que versiones
  // esta anunciando el servidor y si los paquetes estan realmente ahi.
  if (req.url === "/" || req.url === "/estado") {
    const estado = [
      "Servidor de actualizaciones de extensiones VGM.",
      "",
      "Chrome",
      `  version anunciada : ${CHROME_VERSION}`,
      `  paquete presente  : ${fs.existsSync(CRX_PATH) ? "si" : "NO — falta public/redmine-dark-mode.crx"}`,
      "  rutas             : /update.xml  /redmine-dark-mode.crx",
      "",
      "Firefox",
      `  version anunciada : ${FIREFOX_VERSION}`,
      `  paquete presente  : ${fs.existsSync(XPI_PATH) ? "si" : "NO — falta public/redmine-dark-mode.xpi"}`,
      "  rutas             : /updates.json  /redmine-dark-mode.xpi",
      ""
    ].join("\n");
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(estado);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("No existe. Ver / para el estado del servidor.");
});

server.listen(PORT, () => {
  console.log(`Update server escuchando en el puerto ${PORT}`);
  console.log(`  Chrome  -> ${CHROME_VERSION}`);
  console.log(`  Firefox -> ${FIREFOX_VERSION}`);
});
