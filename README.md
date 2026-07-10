# Servidor de actualizaciones — Redmine Dark Mode

Sirve `update.xml` y el `.crx` empaquetado para que Chrome instale y
actualice la extensión "Redmine Dark Mode" solo, en todas las PCs, sin
pasar por la Chrome Web Store.

- **Extension ID (fijo, no cambia nunca):** `iebpkhmlapcdgpboknmejaalpjmgneda`
- **Clave privada de firma:** guardada fuera de este repo (no se sube a git).
  Es la que permite re-empaquetar futuras versiones con el MISMO ID. Si se
  pierde, hay que reinstalar la extensión a mano en todas las PCs con un ID
  nuevo — cuidarla.

## Deploy inicial en Railway

1. `railway login` (o conectar este folder a un repo de GitHub y hacerlo
   desde el dashboard de Railway — "New Project" → "Deploy from GitHub repo").
2. `railway up` (si usás la CLI) o dejá que Railway detecte `package.json`
   y lo despliegue automáticamente al pushear.
3. Copiá el dominio que te asigna Railway (`https://algo.up.railway.app`).
4. Editá `install-extension-policy.reg` y reemplazá
   `REEMPLAZAR-CON-TU-DOMINIO-RAILWAY.up.railway.app` por ese dominio real.
5. Ejecutá ese `.reg` (doble click, requiere permisos de administrador) en
   cada PC de la empresa — una sola vez por máquina. A partir de ahí, Chrome
   instala y actualiza la extensión solo, sin más pasos manuales.

## Cómo publicar una actualización nueva

Cada vez que se modifique algo en `redmine-dark-mode/`:

1. Subir el número de `"version"` en `redmine-dark-mode/manifest.json`
   (ej. `"1.0"` → `"1.1"`) — Chrome solo actualiza si el número es mayor.
2. Re-empaquetar con la MISMA clave privada:
   ```
   chrome.exe --pack-extension="ruta\a\redmine-dark-mode" --pack-extension-key="ruta\a\redmine-dark-mode.pem"
   ```
3. Copiar el `.crx` resultante a `redmine-extension-updates/public/redmine-dark-mode.crx`,
   reemplazando el anterior.
4. Actualizar la constante `EXTENSION_VERSION` en `server.js` para que
   coincida con el nuevo número de versión.
5. `git push` (o `railway up`) para redeployar.

Chrome revisa `update.xml` cada pocas horas en cada PC — no hace falta
avisarle a nadie, la actualización llega sola.
