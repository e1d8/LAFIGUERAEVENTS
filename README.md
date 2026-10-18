# La Figuera Events

Web estàtica en valencià, preparada per publicar-se amb **GitHub Pages**. La web funciona amb HTML, CSS i JavaScript, sense servidor, comptes de tercers ni passos de compilació.

## Primera publicació

1. Puja el repositori complet a la branca `main`, incloent-hi la carpeta `.github` de l’arrel.
2. En GitHub, obri **Settings → Pages → Build and deployment → Source** i selecciona **GitHub Actions**.
3. En **Actions**, obri **Publish GitHub Pages** i executa **Run workflow** sobre `main`. Els següents canvis pujats a `main` es publicaran automàticament.
4. Quan finalitze, obri l’enllaç de l’entorn **github-pages** que apareix en el desplegament.

Amb el nom i propietari actuals del repositori, l’adreça prevista és **https://e1d8.github.io/LAFIGUERAEVENTS/**. Aquesta URL estarà disponible després d’activar Pages i completar la primera publicació.

No crees un altre workflow a partir de les plantilles: ja està inclòs en [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Cal seleccionar **GitHub Actions**, perquè el directori publicable està dins del projecte i no en l’arrel del repositori.

El workflow comprova el JavaScript i els continguts abans de publicar. En les pull requests només executa les comprovacions. No cal afegir secrets ni tokens manuals: utilitza els permisos temporals del workflow. Només es publica `la-figuera-events/dist/`; la documentació i les proves queden fora de la web.

[Instruccions oficials per activar GitHub Actions com a origen de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow).

## Treballar en local

Des de l’arrel del repositori:

```sh
npm --prefix la-figuera-events run dev
```

Obri **http://127.0.0.1:4173**. No cal executar `npm install` perquè el projecte no té dependències.

```sh
npm --prefix la-figuera-events run check
npm --prefix la-figuera-events test
```

Les instruccions per editar textos, taules i il·lustracions estan en [la documentació del projecte](la-figuera-events/README.md).

## Estructura

- `.github/workflows/pages.yml`: comprovacions i publicació en GitHub Pages.
- `la-figuera-events/dist/`: fitxers de la web; edita’ls directament.
- `la-figuera-events/docs/`: transcripció original i inventari de dades pendents.
- `la-figuera-events/tests/`: comprovacions de contingut i navegador.

Les rutes dels recursos són relatives i les seccions utilitzen fragments (`#contacte`, per exemple), de manera que funcionen dins de `/LAFIGUERAEVENTS/` sense configuració de redireccions.
