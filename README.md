# Servidor de actualizaciones — Redmine Dark Mode

Sirve los manifiestos de actualización y los paquetes de la extensión
"Redmine Dark Mode" para que Chrome y Firefox se actualicen solos en todas
las PCs, sin pasar por la Chrome Web Store ni por AMO.

**Todo es estático y lo publica GitHub Pages desde la carpeta `docs/`.**

```
https://lucasvgm.github.io/redmine-extension-updates/
```

## Por qué estático y no un servidor

Antes esto corría como un proceso Node en Railway (`server.js`). Servir dos
archivos que solo cambian al publicar no justifica un servidor: era un
proceso que había que mantener vivo, y cuando se cayó el hosting las
actualizaciones se cortaron sin ningún aviso.

GitHub Pages da HTTPS propio — requisito de Firefox para la `update_url` —,
`Content-Type: application/json` correcto, y publicar es un `git push`.
No hay nada que se pueda caer.

`server.js` queda en el repo solo como referencia histórica. **No se usa.**

## Rutas publicadas

| Archivo | Para |
|---|---|
| `docs/updates.json` | Firefox — manifiesto de actualización (JSON) |
| `docs/redmine-dark-mode.xpi` | Firefox — paquete **firmado por Mozilla** |
| `docs/update.xml` | Chrome — manifiesto de actualización (XML) |
| `docs/redmine-dark-mode.crx` | Chrome — paquete empaquetado |

`docs/.nojekyll` evita que GitHub corra Jekyll sobre la carpeta.

## Configurar GitHub Pages (una sola vez)

Settings → Pages → Source: `Deploy from a branch`, rama `main`, carpeta
`/docs`. Guardar y esperar el primer deploy.

Verificar que responda antes de seguir:

```
https://lucasvgm.github.io/redmine-extension-updates/updates.json
```

## Publicar una versión nueva

### Firefox

1. En `redmine-dark-mode/`, subir `"version"` en **los dos** manifests.
2. `powershell -ExecutionPolicy Bypass -File .\build.ps1`
3. Subir `dist/redmine-dark-mode-<version>-firefox.zip` a AMO como
   *self-distribution*.
4. Bajar el **`.xpi` firmado** del Developer Hub. El `.zip` del build no
   sirve: un paquete sin firmar no lo instala ningún Firefox de release
   ni ESR.
5. Copiarlo a `docs/redmine-dark-mode.xpi`.
6. Actualizar el `"version"` de `docs/updates.json` para que coincida.
7. `git push`.

### Chrome

1. Re-empaquetar con la **misma clave privada** (guardada fuera del repo —
   es lo que mantiene el Extension ID `iebpkhmlapcdgpboknmejaalpjmgneda`;
   si se pierde hay que reinstalar a mano en todas las PCs con un ID nuevo):

   ```
   chrome.exe --pack-extension="ruta\a\redmine-dark-mode" --pack-extension-key="ruta\a\redmine-dark-mode.pem"
   ```

2. Copiar el `.crx` a `docs/redmine-dark-mode.crx`.
3. Actualizar el `version` de `docs/update.xml`.
4. `git push`.

## ⚠️ El error que ya pasó una vez

El número de versión está en **tres lugares** que tienen que coincidir: el
manifest de la extensión, el paquete publicado, y el manifiesto de
actualización (`updates.json` / `update.xml`).

Si el manifiesto anuncia una versión **menor o igual** a la instalada, el
navegador considera que no hay nada nuevo y **no actualiza a nadie**. No
falla, no loguea, no avisa: las máquinas se quedan en la versión vieja para
siempre. Así estuvo este repo anunciando `1.0` mientras la extensión real
iba por `1.6.4`.

Después de cada publicación, abrir las dos URLs y confirmar a ojo que la
versión anunciada es la nueva.

## Instalación en las máquinas

### Chrome

Ejecutar `install-extension-policy.reg` (doble click, requiere permisos de
administrador) una sola vez por máquina. A partir de ahí Chrome instala y
actualiza solo.

Si cambia el dominio de Pages, hay que actualizar la URL en ese `.reg`.

### Firefox

El `.xpi` firmado se instala arrastrándolo a la ventana de Firefox. Como el
manifest declara la `update_url`, a partir de ahí se actualiza solo.
