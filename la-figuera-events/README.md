# La Figuera Events

Web estàtica en valencià, reconstruïda a partir de les captures aportades. No necessita instal·lar dependències ni compilar. La icona de marca és una figa oberta en SVG amb el mateix estil i paleta que la flor.

## Previsualització

Des d’aquest directori:

```sh
npm run dev
```

Obri **http://127.0.0.1:4173**. Cal servir-la per HTTP perquè utilitza mòduls JavaScript; no s’ha d’obrir `index.html` amb `file://`.

## Editar els continguts

El contingut està en `dist/content.js`; `dist/app.js` el presenta i `dist/styles.css` en defineix l’aspecte. Les referències C01–C13 corresponen a les captures de la web, sense comptar la primera imatge d’estil. Consulta `docs/inventari.md` i `docs/transcripcio.md`.

Cada cel·la és `cell('Text literal', false)`. Si falta tot el contingut, utilitza `cell('', true)`; si només es conserva un fragment, `cell('fragment visible', true)`. Quan completes una dada confirmada, elimina el seu indicador de pendent. No tractes el fragment com una descripció completa.

Per afegir una columna, afig un objecte a `columns`:

```js
{ key: 'novaOpcio', label: cell('Text de la capçalera') }
```

Després afig `novaOpcio: cell('Text o preu')` a `cells` de cada fila. Les files que encara no tinguen la nova cel·la mostraran «Informació pendent». Es poden afegir tantes columnes com calga; el component i el desplaçament s’adapten automàticament. Per ampliar totes les taules nupcials, modifica `weddingColumns`; per a una sola taula, modifica les seues `columns`.

Les preguntes estan en `sections[].questions`. Per a respostes retallades, conserva `pending: true`. Els fragments sense fila identificable estan en `tables[].fragments`, separats dels productes per evitar associacions no demostrades.

Els fragments d’URL són `#la-carta`, `#tartes-nupcials`, `#bufet-de-tortades`, `#taules-dolces` i `#contacte`.

## Canviar la icona de marca

La icona de figa oberta està en `dist/assets/fig.svg`. Pots editar-la o canviar el `src` de l’element `<img class="brand-logo">` en `dist/index.html`. La mida és de 45 px en PC i 36 px en mòbil, definida en `dist/styles.css`.

## Verificació

```sh
npm run check
npm test
# Amb el servidor de previsualització en execució i Google Chrome instal·lat:
npm run test:browser
```

Les proves del navegador utilitzen Chrome local i Node, sense instal·lar paquets. `CHROME_BIN` permet especificar un altre executable i `PREVIEW_URL` un altre servidor. Comproven les cinc seccions a 320, 360, 390, 768, 1024 i 1440 px, acordions, absència de desbordament, columna fixa, contacte, navegació del navegador, recursos i ampliació de columnes. Les captures es guarden en `artifacts/`, exclòs de Git i del desplegament.

## Publicació en GitHub Pages

El directori públic és `dist/`. El workflow de l’arrel del repositori, `../.github/workflows/pages.yml`, publica aquesta carpeta en GitHub Pages després de comprovar el codi i els continguts. Els documents, proves i fitxers de projecte no s’inclouen en la web publicada.

Per a la primera publicació, puja el repositori complet a `main`, selecciona **Settings → Pages → Source → GitHub Actions** i executa el workflow **Publish GitHub Pages** des de la pestanya **Actions**. Els següents canvis en `main` es publicaran automàticament. Consulta [les instruccions de l’arrel](../README.md) per als detalls.

Tots els recursos es carreguen amb rutes relatives. Les seccions utilitzen fragments d’URL, així que no necessiten redireccions ni configuració de servidor per funcionar dins del subdirectori del repositori.

Les tipografies Titan One, DM Sans i Caveat se serveixen localment. Les llicències OFL estan en `dist/assets/`. Les il·lustracions SVG són elements decoratius originals; no representen productes ni fotografies del negoci.
