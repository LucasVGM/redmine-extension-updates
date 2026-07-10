const http = require("http");
const fs = require("fs");
const path = require("path");

// Actualizar esta versión cada vez que se re-empaquete la extensión con
// una versión nueva de manifest.json (tiene que coincidir exactamente).
const EXTENSION_ID = "iebpkhmlapcdgpboknmejaalpjmgneda";
const EXTENSION_VERSION = "1.0";

const PORT = process.env.PORT || 3000;
const CRX_PATH = path.join(__dirname, "public", "redmine-dark-mode.crx");

const server = http.createServer((req, res) => {
  if (req.url === "/update.xml") {
    const codebase = `https://${req.headers.host}/redmine-dark-mode.crx`;
    const xml = `<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='${EXTENSION_ID}'>
    <updatecheck codebase='${codebase}' version='${EXTENSION_VERSION}' />
  </app>
</gupdate>`;
    res.writeHead(200, { "Content-Type": "application/xml" });
    res.end(xml);
    return;
  }

  if (req.url === "/redmine-dark-mode.crx") {
    fs.readFile(CRX_PATH, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("crx no encontrado — copialo a public/redmine-dark-mode.crx");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/x-chrome-extension" });
      res.end(data);
    });
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Servidor de actualizaciones de extensiones VGM.\nRutas: /update.xml y /redmine-dark-mode.crx");
});

server.listen(PORT, () => {
  console.log(`Update server escuchando en el puerto ${PORT}`);
});
