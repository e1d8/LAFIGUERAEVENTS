# Informació recuperada de la web antiga

## Font i mètode

**O01** és `/Users/Fenikkel/Downloads/web/lafigueraevents.my.canva.site/lafigueravlc.html`, la còpia local aportada per l’usuari. El text no està en taules HTML: està en la variable `bootstrap`, com a JSON incrustat dins d’un script.

S’ha descodificat el literal de dades sense executar cap script de la web. La col·lecció de contingut és `bootstrap.page.A.V[0].A.A`. [original-canva.json](original-canva.json) conserva les taules per coordenada, la correspondència de capçaleres fusionades, les tres respostes recuperades i el SHA-256 del fitxer d’origen. Els salts U+2028 i les línies buides de maquetació s’han normalitzat; no s’han reordenat fragments de files diferents.

La còpia original només serveix per completar dades pendents i afegir productes o formats absents. Les correccions posteriors de l’usuari prevalen.

## Correspondència amb el catàleg actual

Les files s’enumeren segons les coordenades de la taula original. La fila 1 és la capçalera. Les columnes A/B són nom/ingredients; C/D són 2/3 pisos en les nupcials, i decoració normal/flors en el bufet.

| Taula | Element original | Files i correspondència actual |
| --- | --- | --- |
| Les clàssiques | 27 | 2 Carrot cake (`carrot`); 3 Pastís de xocolate (`xocolate`); 4 Pastís de llima (`llima`); 5 Pastís de lotus (`lotus`) |
| Les premium | 34 | 2 Fruits secs i dulce de leche (`premium-1`); 3 Praliné d’avellanes (`praline-avellanes`); 4 Macadàmia (`premium-2`) |
| Tartes marquesa | 42 | 2 Carabassa i pistatxo (`carabassa`); 3 Gerds, formatge i pistatxo (`gerds-formatge-pistatxo`); 4 Personalitzada (`personalitzada`) |
| Bufet | 102 | 2 LA FAVORITA (`favorita`); 3 PARMIGIANA (`parmigiana`); 4 MATÓ I MEL (`mato-mel`); 5 LA VALENCIANA (`valenciana`); 6 XOCO BLANC (`xoco-blanc`); 7 XOCO AMB LLET: (`xoco-llet`); 8 XOCO PUR: (`cafe-fragment`); 9 PISTATXO: (`pistatxo-fragment`) |
| Micotetes | 135 | Fila 2, columnes B–F: 25, 50, 75, 100 i +100 micotetes |

Els identificadors anteriors es conserven, inclosos els dos que acabaven en `-fragment`, perquè ara s’han identificat les mateixes files. No s’han creat duplicats d’estos productes. El catàleg passa de 10 a 19 ítems; Micotetes continua sent un ítem amb cinc formats.

La mida **«Tamany (12/15 racions)»** ocupa una capçalera fusionada: en l’estructura de l’element 102, tant C com D apunten a C1. Per això s’ha aplicat a les dues opcions, sense inventar un encapçalament per a la quarta columna.

## FAQ completades

| Pregunta | Element original | Part recuperada |
| --- | --- | --- |
| Nupcials: Com es decoren? | 62 | Final «pastís).» de la condició sobre les flors |
| Els 3 pisos de la tortada han de ser iguals? | 82 | Exemple complet de combinacions de tres pisos i exclusió d’una tarta d’una altra gamma |
| Monteu vosaltres la taula amb el bufet? | 127 | Final sobre contacte amb la sala, muntatge i decoració in situ per un suplement |

S’ha conservat «tarta», ja present en el text vigent, on l’original de la resposta sobre pisos diu «tarat». La resposta de muntatge del bufet s’ha contrastat directament amb el seu element 127, sense completar-la només per semblança amb una altra FAQ.

## Canvis voluntaris conservats

- Presentació acurtada i sense repetir els contactes, sense tornar a afegir els textos eliminats sobre l’organització de la celebració i les preguntes freqüents.
- Descripcions de Carrot cake, Pastís de lotus, la primera premium i Carabassa i pistatxo tal com les va corregir l’usuari.
- En particular, la primera premium conserva «fruits secs i crunch d'avellana». L’original de la fila 2 diu «fruits secs caramelitzats». El nom recuperat correspon al nucli de la descripció —xoco, café i dulce de leche—; no s’ha substituït la versió corregida pels ingredients antics. La fila de Praliné d’avellanes és un producte separat en l’original i s’ha afegit com a tal.
- Etiquetes nupcials breus («2 pisos…», «3 pisos…»), preus amb asterisc i avís compartit «Preu sense IVA…».
- «SAP A FORMATGE» en xicotet a la part superior dreta de les dues fitxes corresponents, sense recuperar el prefix antic.
- Contacte limitat a WhatsApp, correu i Instagram; no es recuperen els altres mitjans del peu original.
- Presentació actual de les seccions, navegació, il·lustracions, tipografies i animacions.

S’han conservat les formes literals dels productes nous, incloses «buttecream», «frambueses», els dos punts en alguns noms del bufet i la capçalera original de 100 micotetes («100 micotetes 1,2€ ud)»), que no té el parèntesi d’obertura. No es tracta d’informació pendent: així apareix en l’arxiu d’origen.

## Únic import absent

Les cel·les C4/D4 de Personalitzada contenen un guió. Per indicació posterior de l’usuari, les opcions de 2 i 3 pisos mostren «Contacta’ns i et fem preu!». No s’ha deduït cap import ni s’ha marcat el producte com a no disponible.

## Verificació

Les comprovacions de `tests/recovery.test.mjs` contrasten tots els noms, imports, ingredients recuperats, l’ordre de les files, les cinc opcions de Micotetes, la capçalera fusionada del bufet i les tres FAQ amb l’extracció guardada. Les descripcions corregides i la presentació acurtada tenen comprovacions separades perquè una futura recuperació no les sobreescriga.

Després de la recuperació, l’usuari ha unificat també els imports del bufet i de Micotetes amb el format d’asterisc. Les quantitats i els imports són els recuperats; les etiquetes del bufet passen a «Decoració normal (12/15 racions)» i «Flors de boda (12/15 racions)». L’extracció `original-canva.json` es conserva intacta com a font històrica.
