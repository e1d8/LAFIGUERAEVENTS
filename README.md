# La Figuera Events

Web estàtica en valencià, amb els fitxers directament a l’arrel del repositori. Funciona amb HTML, CSS i JavaScript, sense dependències ni passos de compilació.

## Publicar manualment en GitHub Pages

1. Puja els canvis del repositori a la branca `main`.
2. En GitHub, obri **Settings → Pages → Build and deployment**.
3. En **Source**, selecciona **Deploy from a branch**.
4. En **Branch**, selecciona **main** i la carpeta **/(root)**.
5. Prem **Save** i espera que GitHub publique la web. L’enllaç apareixerà en aquesta mateixa pantalla.

Amb el nom i propietari actuals del repositori, l’adreça prevista és **https://e1d8.github.io/LAFIGUERAEVENTS/**. Aquesta URL estarà disponible després d’activar Pages i completar la primera publicació.

`index.html` és directament a l’arrel. El fitxer `.nojekyll` indica que els fitxers s’han de servir com a web estàtica. No cal crear un workflow, seleccionar GitHub Actions ni instal·lar cap generador.

Una vegada configurat Pages, GitHub publicarà els canvis que puges a `main`.

[Instruccions oficials per publicar des d’una branca](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-from-a-branch).

## Treballar en local

Des de l’arrel del repositori:

```sh
npm run dev
```

Obri **http://127.0.0.1:4173**. No cal executar `npm install` perquè el projecte no té dependències.

```sh
npm run check
npm test
```

Les instruccions per editar textos, taules i il·lustracions estan en [la documentació de desenvolupament](docs/desenvolupament.md).

## Estructura

- `index.html`: entrada de la web.
- `app.js`, `content.js` i `styles.css`: funcionament, contingut i estètica.
- `assets/`: il·lustracions, tipografies i llicències.
- `docs/`: instruccions, transcripció original i inventari de dades pendents.
- `tests/`: comprovacions de contingut i navegador.
- `.nojekyll`: publicació estàtica sense Jekyll.

Les rutes dels recursos són relatives i les seccions utilitzen fragments (`#contacte`, per exemple), de manera que funcionen dins de `/LAFIGUERAEVENTS/` sense configuració de redireccions.
