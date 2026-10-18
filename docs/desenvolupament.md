# La Figuera Events

Web estàtica en valencià, reconstruïda a partir de les captures aportades. No necessita instal·lar dependències ni compilar. La icona de marca és una figa oberta en SVG amb el mateix estil i paleta que la flor.

## Previsualització

Des de l’arrel del repositori:

```sh
npm run dev
```

Obri **http://127.0.0.1:4173**. Cal servir-la per HTTP perquè utilitza mòduls JavaScript; no s’ha d’obrir `index.html` amb `file://`.

## Editar els continguts

El contingut està en `content.js`; `app.js` el presenta i `styles.css` en defineix l’aspecte. Les referències C01–C13 corresponen a les captures de la web, sense comptar la primera imatge d’estil. Consulta `docs/inventari.md` i `docs/transcripcio.md`.

Cada cel·la és `cell('Text literal', false)`. Si falta tot el contingut, utilitza `cell('', true)`; si només es conserva un fragment, `cell('fragment visible', true)`. Quan completes una dada confirmada, elimina el seu indicador de pendent. No tractes el fragment com una descripció completa.

Per afegir una columna, afig un objecte a `columns`:

```js
{ key: 'novaOpcio', label: cell('Text de la capçalera') }
```

Després afig `novaOpcio: cell('Text o preu')` a `cells` de cada fila. Les files que encara no tinguen la nova cel·la mostraran «Informació pendent». Es poden afegir tantes columnes com calga; el component i el desplaçament s’adapten automàticament. Per ampliar totes les taules nupcials, modifica `weddingColumns`; per a una sola taula, modifica les seues `columns`.

Les preguntes estan en `sections[].questions`. Per a respostes retallades, conserva `pending: true`. Els fragments sense fila identificable estan en `tables[].fragments`, separats dels productes per evitar associacions no demostrades.

Els fragments d’URL són `#la-carta`, `#tartes-nupcials`, `#bufet-de-tortades`, `#taules-dolces` i `#contacte`.

## Canviar la icona de marca

La icona de figa oberta està en `assets/fig.svg`. Pots editar-la o canviar el `src` de l’element `<img class="brand-logo">` en `index.html`. La mida és de 45 px en PC i 36 px en mòbil, definida en `styles.css`.

## Verificació

```sh
npm run check
npm test
# Amb el servidor de previsualització en execució i Google Chrome instal·lat:
npm run test:browser
```

Les proves del navegador utilitzen Chrome local i Node, sense instal·lar paquets. `CHROME_BIN` permet especificar un altre executable i `PREVIEW_URL` un altre servidor. Comproven les cinc seccions a 320, 360, 390, 768, 1024 i 1440 px, acordions, absència de desbordament, columna fixa, contacte, navegació del navegador, recursos i ampliació de columnes. Les captures es guarden en `artifacts/`, exclòs de Git.

## Publicació en GitHub Pages

La web està directament a l’arrel del repositori. No té cap workflow de publicació personalitzat.

Configura manualment **Settings → Pages → Source → Deploy from a branch**, amb la branca **main** i la carpeta **/(root)**. Mantín `.nojekyll` a l’arrel. Consulta [les instruccions de l’arrel](../README.md) per als detalls.

Tots els recursos es carreguen amb rutes relatives. Les seccions utilitzen fragments d’URL, així que no necessiten redireccions ni configuració de servidor per funcionar dins del subdirectori del repositori.

Les tipografies Titan One, DM Sans i Caveat se serveixen localment. Les llicències OFL estan en `assets/`. Les il·lustracions SVG són elements decoratius originals; no representen productes ni fotografies del negoci.
