# La Figuera Events

Web estàtica en valencià, reconstruïda a partir de les captures aportades. No necessita instal·lar dependències ni compilar. La icona de marca és la figa oberta de `assets/figa-256.png`, aportada per l’usuari.

## Previsualització

Des de l’arrel del repositori:

```sh
npm run dev
```

Obri **http://127.0.0.1:4173**. Cal servir-la per HTTP perquè utilitza mòduls JavaScript; no s’ha d’obrir `index.html` amb `file://`.

El servidor local `dev_server.py` serveix sempre l’arrel d’aquest repositori i desactiva la memòria cau de l’HTML, CSS, JavaScript, imatges i fonts. Després de guardar un fitxer, recarrega la pàgina per vore el canvi; no hi ha recàrrega automàtica. Mantín `npm run dev` en execució. Açò afecta només la previsualització local; GitHub Pages continua publicant els fitxers estàtics de l’arrel.

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

La tipografia de la marca en la capçalera és EB Garamond Medium (pes 500) per a «La figuera» i Futura Bold (pes 700) per a «EVENTS». Les fonts se serveixen localment en WOFF2: `assets/eb-garamond-medium.woff2` i `assets/futura-bold.woff2`. S’han convertit a partir dels arxius aportats per l’usuari; el TTC conté Futura Bold, no Futura ND Bold. La portada mostra només la felicitació manuscrita «Primer que res… ENHORABONA!» i la descripció, sense el títol gran ni la imatge de la tortada.

El text normal utilitza Futura Book (pes CSS 400) i els destacats Futura ND DemiBold (pes CSS 600), agrupades en la família CSS «Futura Text». Els fitxers `assets/futura-book.woff2` i `assets/futura-nd-demibold.woff2` s’han convertit a partir de l’OTF i el TTF facilitats per l’usuari. La font Book aportada és Futura Book, no Futura ND Book. Les negretes utilitzen la variant real, sense engreixat artificial; el text manuscrit manté Caveat.

Els títols principals de Nupcials, Bufet, Taules i Contacte utilitzen EB Garamond Medium (pes 500), amb mides adaptades a PC i mòbil.

Les quatre introduccions comparteixen el component `sectionLead`, les mateixes columnes, una àrea reservada per als títols i un marc d’imatge de proporció 4:3. Les descripcions tenen sempre la mateixa tipografia, mida i interlineat per amplària de pantalla, també en Contacte; la seua altura varia segons la llargària del text. En mòbil es mostra títol, imatge i descripció en el mateix ordre i amb el mateix espaiat.

Tartes nupcials utilitza `assets/nupcial-painted.png`, Bufet de tortades `assets/torta-painted.png` i Taules dolces `assets/galetes-painted.png`, les il·lustracions aportades per l’usuari. Es mostren completes, sense retallar-les, dins del mateix marc que les altres seccions. La correspondència d’imatges es defineix en `sectionImages`, dins d’`app.js`.

La icona de figa oberta està en `assets/figa-256.png` i s’utilitza tant en la capçalera com en la pestanya del navegador. Per substituir-la, actualitza el `src` de `<img class="brand-logo">` i l’`href` i el tipus de `<link rel="icon">` en les cinc entrades HTML. La mida del logotip és de 45 px en PC i 36 px en mòbil, definida en `styles.css`.

## Verificació

Els noms dels productes utilitzen quatre subratllats fixos: l’original i tres variants de retolador definides en `styles.css`. `productNameText`, en `app.js`, reparteix els quatre traços en ordre aleatori, utilitzant-los tots abans de tornar-los a barrejar i evitant dues formes iguals consecutives. La selecció es fa una vegada en carregar la pàgina: es manté en canviar de pestanya o redimensionar i pot variar en recarregar. Els colors continuen alternant entre groc i rosenc al llarg de cada secció.

La paleta actual pren com a referència «Estil artistic.jpg», aportada per l’usuari: fons lila blavós `#d8dbfa`, gris `#676767` als títols, mostassa `#ddc17c` a la pestanya seleccionada i malva `#cca8c5` als accents. Els textos menuts utilitzen grisos més foscos per mantindre la llegibilitat; les targetes tenen un fons lila molt clar. Els colors es defineixen en les variables de `:root` de `styles.css`. Les imatges, la distribució i la tipografia es mantenen.

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

Les tipografies actives Caveat, EB Garamond i les variants Futura se serveixen localment. Titan One es conserva com a recurs anterior. Les llicències OFL de Titan One, Caveat i EB Garamond estan en `assets/`, juntament amb l’anterior font DM Sans i la seua llicència. Les variants Futura provenen dels arxius TTC, OTF i TTF aportats per l’usuari. Les il·lustracions SVG són elements decoratius originals; no representen productes ni fotografies del negoci.
