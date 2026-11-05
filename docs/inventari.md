# Inventari de reconstrucció

## Font i criteri

Les tretze captures de la web s’identifiquen com C01–C13 segons l’ordre aportat, després de la imatge d’estil. Els adjunts originals no estan disponibles com a fitxers al repositori: la transcripció s’ha fet a partir de les imatges visibles a la conversa. La recuperació inicial es va fer només amb estes captures. Posteriorment s’ha incorporat O01, la còpia local de la web antiga aportada per l’usuari, per completar les dades absents sense actualitzar els preus amb fonts externes.

S’han conservat formes originals com «figtàstiques», «montar», «destint», «embossades», els imports sense IVA i el text que menciona el 21% d’IVA. La tipografia i els salts de línia de maquetació canvien; el contingut es conserva. Les limitacions de les captures es documenten davall com a registre històric; les dades completades amb O01 s’identifiquen en l’apartat de recuperació.

## Correspondència de captures

Aquest apartat descriu les captures originals. Les correccions aportades després per l’usuari prevalen en la web; la transcripció original es conserva com a arxiu.

| Captura | Informació recuperada | Limitacions |
| --- | --- | --- |
| C01 | LA FIGUERA EVENTS, LA CARTA, felicitació i presentació | El final de contacte continua en C02. La marca utilitza la figa oberta `figa-256.png`, aportada posteriorment per l’usuari. |
| C02 | Final de presentació, contacte, introducció nupcial, clàssiques, Carrot cake 165€, inici de Pastís de | Columnes de la dreta retallades; segona fila tallada per baix. |
| C03 | Fragment de crema de formatge/xoco blanc/coulis, fragment «e lotus» 165€/390€, avís de transport, inici premium 185€/435€ | No es pot confirmar a quina fila correspon el fragment de coulis. Noms de productes i parts de descripcions fora de la imatge. |
| C04 | Fragment «crunch avellana.», premium de llima 185€/435€, avís, marquesa Carabassa i pistatxo 200€ | Noms premium fora de la imatge; falta el preu de marquesa de tres pisos. El fragment superior no s’ha unit a una altra descripció. |
| C05 | Avís de transport, Què inclou el preu?, Com es decoren? | Final de la resposta sobre decoració ocult. |
| C06 | Fondant, exterior blanc, intoleràncies, pisos amb sabors diferents i suplement 20€ | Exemple final de combinació de sabors tallat. |
| C07 | Més de 85 persones, extres 50€, transport, presentació del bufet | Capçalera i dades de la taula següent no llegibles ací. |
| C08 | Continuació del bufet, LA FAVORITA i PARMIGIANA, ingredients, 45€ amb decoració normal | Capçalera «Tamany (12/» retallada. Columnes dretes no visibles. |
| C09 | Fragment de café/xocolate 45€/50€, premium de pistatxo 50€/55€, avís, quantitat de tortades | Noms de les dues files ocults. Inici de línies de la descripció del café retallat. |
| C10 | Decoració del bufet, combinació de nupcial i bufet, intoleràncies, inici de muntatge | Final de la resposta de muntatge absent. No s’ha copiat el final d’una resposta semblant d’una altra secció. |
| C11 | Taules dolces, micotetes 30gr, sabors, lots 25/50, preus 45€/80€ sense IVA, avís, inici de sabors | La pregunta sobre sabors continua en C12; poden existir columnes no visibles. |
| C12 | Sabors, combinació de tartes i cookies, muntatge de taula dolça, inici de comiat | Comiat complet en C13. |
| C13 | Final del muntatge, comiat, marca, Whatsapp, Instagram, TikTok, web i correu | El logotip original no s’ha recuperat; la nova icona de marca és una figa oberta. |

## Recuperació de la web original (O01)

Font: `/Users/Fenikkel/Downloads/web/lafigueraevents.my.canva.site/lafigueravlc.html`. El contingut està en el JSON incrustat en l’HTML, incloses les coordenades de les cel·les i les capçaleres fusionades. No s’han executat els scripts de la còpia antiga ni consultat serveis externs.

Vegeu [el detall de la recuperació](recuperacio-original.md) i [l’extracció de les cel·les i respostes originals](original-canva.json), amb la petjada SHA-256 de l’HTML. `source: ['O01']` identifica la informació recuperada en `content.js`; les referències C01–C13 es conserven on ja existien.

- **Clàssiques:** afegits Pastís de xocolate i Pastís de llima entre Carrot cake i Pastís de lotus, amb 165€/390€ i els ingredients originals.
- **Premium:** recuperats els noms Fruits secs i dulce de leche i Macadàmia. Afegit Praliné d’avellanes en la seua posició original, amb 185€/435€.
- **Marquesa:** recuperat el preu de tres pisos de Carabassa i pistatxo, 475€. Afegides Gerds, formatge i pistatxo (200€/475€) i Personalitzada.
- **Bufet:** recuperades les 12/15 racions per a les dues decoracions, els imports de les flors i els noms XOCO PUR: i PISTATXO:. Afegides MATÓ I MEL, LA VALENCIANA, XOCO BLANC i XOCO AMB LLET:, amb les seues descripcions i imports.
- **Micotetes:** afegits els formats de 75 (105€ sense IVA), 100 (120€ sense IVA) i +100 («Contacta’ns i et fem preu!»), inclosos els preus per unitat presents en les capçaleres originals.
- **FAQ:** completades les respostes de decoració nupcial, combinació de sabors per pisos i muntatge del bufet.

## Dades que continuen pendents

Només els preus de 2 i 3 pisos de **Personalitzada**. Les cel·les C4 i D4 de la taula original de marquesa contenen «-», sense cap import. La web manté «Informació pendent» en les dues opcions; no s’interpreta com zero ni com falta de disponibilitat.

Les descripcions nupcials corregides expressament per l’usuari es mantenen, inclosa la de Fruits secs i dulce de leche, que difereix de l’HTML antic. Els detalls es documenten en `recuperacio-original.md`. `transcripcio.md` continua sent l’arxiu de les captures i no es reescriu amb la informació recuperada després.

## Interfície nova

Les tartes nupcials mantenen les descripcions corregides per l’usuari i incorporen els productes i camps que s’han pogut recuperar d’O01. Les opcions s’etiqueten «2 pisos (35/37 porcions)» i «3 pisos (85/87 porcions)». Els preus nupcials coneguts porten un asterisc i l’avís compartit és «Preu sense IVA. No incloem transport. Els productes s’han d’arreplegar a l’obrador.».

«Preguntes freqüents», les indicacions de desplaçament, els títols de contacte i els avisos de dades pendents són etiquetes de la nova interfície. No són informació comercial recuperada. Les condicions no s’han resumit ni substituït per aquestes etiquetes.

Per indicació de l’usuari, s’han retirat «Parlem?», la pestanya «La carta» i els números dels accessos i de la navegació. La figa i el nom de la marca són un únic enllaç a l’inici. La portada actual té quatre accessos il·lustrats i amaga la barra de navegació; dins de les seccions reapareixen les pestanyes.

La web manté la presentació acurtada: omet el paràgraf que comença «Com que organitzar una celebració» i el text des de «Al final d’aquest document» fins al telèfon, per indicació de l’usuari. `transcripcio.md` conserva aquest text com a registre del contingut de les captures.

Contacte mostra únicament WhatsApp, correu i Instagram, en files amb il·lustracions pròpies al costat del contacte. Els altres mitjans de la captura es conserven en la transcripció arxivada. Les FAQ mostren només «Preguntes freqüents», sense el text introductori «PER RESOLDRE ELS DUBTES».

Les capçaleres de les seccions utilitzen la il·lustració corresponent en lloc de la flor. El títol del navegador és «La Figuera Events» en la portada i «La Figuera Events · Nupcials/Bufet/Taules/Contacte» en les seccions, amb un únic nom segons la secció oberta. Totes les entrades HTML inclouen les metadades per compartir: títol «La Figuera Events» i descripció «Tartes nupcials, bufet de tortades i taules dolces», tant en Open Graph com en Twitter Cards.
