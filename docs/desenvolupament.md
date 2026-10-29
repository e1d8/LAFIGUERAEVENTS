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

El catàleg conserva l’estructura de `tables`, amb `columns` i `rows`, però es presenta com a fitxes blanques sense desplegables. Cada fitxa mostra primer el nom, davall la descripció completa i al final les opcions amb els preus. Les notes de producte, com «⚠️ SAP A FORMATGE», apareixen en xicotet al final de la descripció. Les preguntes freqüents continuen sent desplegables i es tanquen en canviar de secció.

Cada columna pot indicar `role: 'name'` (nom), `role: 'detail'` (descripció) o `role: 'option'` (opció amb el seu preu). Tot el contingut és visible. Si no té `role`, es mostra com a opció. Quan el grup no té columna de nom, com en Micotetes, s’utilitza el títol del grup; els noms de producte pendents es mantenen com a pendents.

Per afegir una opció, afig un objecte a `columns`:

```js
{ key: 'novaOpcio', label: cell('Text de la capçalera') }
```

Després afig `novaOpcio: cell('Text o preu')` a `cells` de cada fila. Les files que encara no tinguen la nova cel·la mostraran «Informació pendent». Es poden afegir tantes opcions com calga: es distribueixen en noves línies sense desplaçament horitzontal ni canvis en el component `renderCatalogue`. Per ampliar tots els grups nupcials, modifica `weddingColumns`; per a un sol grup, modifica les seues `columns`. Les etiquetes incompletes conserven també el seu indicador de pendent.

Les preguntes estan en `sections[].questions`. Per a respostes retallades, conserva `pending: true`. Els fragments sense fila identificable estan en `tables[].fragments`, separats dels productes per evitar associacions no demostrades.

Les adreces són l’arrel per a l’inici i `/nupcials`, `/bufet`, `/taules` i `/contacte` per a les seccions. `routes.js` defineix aquesta correspondència. Els antics enllaços amb `#` continuen funcionant i es converteixen a les adreces noves.

Les carpetes `nupcials/`, `bufet/`, `taules/` i `contacte/` contenen una entrada `index.html` amb el mateix esquelet que l’entrada principal, un títol propi i `<base href="../">` per carregar els recursos compartits. Si edites l’estructura HTML de l’entrada principal, actualitza també aquestes quatre entrades. Les proves comproven que es mantinguen sincronitzades. No cal cap generador ni workflow.

## Canviar la icona de marca

La icona de figa oberta està en `assets/fig.svg`. Pots editar-la o canviar el `src` de l’element `<img class="brand-logo">` en `index.html`. La mida és de 45 px en PC i 36 px en mòbil, definida en `styles.css`.

## Verificació

```sh
npm run check
npm test
# Amb el servidor de previsualització en execució i Google Chrome instal·lat:
npm run test:browser
```

Les proves del navegador utilitzen Chrome local i Node, sense instal·lar paquets. `CHROME_BIN` permet especificar un altre executable i `PREVIEW_URL` un altre servidor. Comproven les cinc seccions a 320, 360, 390, 768, 1024 i 1440 px, la conservació del contingut, l’ordre nom/descripció/preus sempre visibles, el fons blanc, les FAQ i el seu tancament en canviar de secció, absència de desbordament, contacte, navegació del navegador, recursos i ampliació d’opcions. Les captures es guarden en `artifacts/`, exclòs de Git.

## Publicació en GitHub Pages

La web està directament a l’arrel del repositori. No té cap workflow de publicació personalitzat.

Configura manualment **Settings → Pages → Source → Deploy from a branch**, amb la branca **main** i la carpeta **/(root)**. Mantín `.nojekyll` a l’arrel. Consulta [les instruccions de l’arrel](../README.md) per als detalls.

Tots els recursos compartits es resolen respecte de l’arrel de l’aplicació, també quan l’adreça visible no acaba en barra. Cada secció té una entrada estàtica que permet obrir-la directament i recarregar-la dins del subdirectori del repositori.

Les tipografies Titan One, DM Sans i Caveat se serveixen localment. Les llicències OFL estan en `assets/`. Les il·lustracions SVG són elements decoratius originals; no representen productes ni fotografies del negoci.
