// Transcripció de les captures aportades. C01–C13 exclouen la imatge d'estil.
// Un camp `pending` indica text absent, retallat o una associació no confirmada.
export const cell = (text = '', pending = false) => ({ text, pending });
export const pickup = '*No incloem transport. Els productes s’han d’arreplegar a l’obrador.';

export const contact = {
  phone: '649656652', email: 'lafigueravlc@gmail.com', handle: '@lafigueravlc',
  website: 'www.lafigueravlc.com',
};

export const introduction = {
  greeting: 'Primer que res… ENHORABONA!',
  text: 'Ací teniu una relació de possibilitats de tortades meravelloses per tal que el vostre dia siga el més dolç possible, així com opcions de bufets de tartes per quedar-vos amb tota la vostra gent o taules dolces figtàstiques.',
  source: ['C01', 'C02'],
};

const weddingColumns = [
  { key: 'name', label: cell('Tarta:') },
  { key: 'description', label: cell('Què du?') },
  { key: 'two', label: cell('Tarta nupcial 2 pisos (35/37 porcions)') },
  { key: 'three', label: cell('Tarta nupcial 3 pisos (85/87 porcions)') },
];

export const tables = {
  classics: {
    title: 'Les clàssiques:', source: ['C02', 'C03'], columns: weddingColumns.map(c => ({ ...c })),
    rows: [
      { id: 'carrot', source: ['C02'], cells: {
        name: cell('Carrot cake'), description: cell('Biscuit de carlota i espècies amb crema de formatge i fruits secs.'),
        two: cell('165€ (sense IVA)'), three: cell('', true),
      } },
      { id: 'pastis-fragment', source: ['C02'], cells: {
        name: cell('Pastís de', true), description: cell('biscuit de', true),
        two: cell('165€', true), three: cell('', true),
      } },
      { id: 'lotus-fragment', source: ['C03'], cells: {
        name: cell('e lotus', true), description: cell('biscuit de xocolata banyat amb café i buttercream de la famosa galeta lotus.'),
        two: cell('165€ (sense IVA)'), three: cell('390€', true),
      } },
    ],
    fragments: [{
      text: 'amb crema de formatge i xoco blanc i coulis de fruita (trieu la vostra preferida!)',
      source: ['C03'], note: 'L’inici de la fila i el nom de la tarta no es veuen. No es pot confirmar a quina fila correspon.',
    }],
  },
  premium: {
    title: 'Les premium:', source: ['C03', 'C04'], columns: weddingColumns.map(c => ({ ...c })),
    rows: [
      { id: 'premium-1', source: ['C03'], cells: {
        name: cell('', true),
        description: cell('Tarta de biscuit de xoco banyat amb café, buttercream de dulce de leche, fruits secs', true),
        two: cell('185€ (sense IVA)'), three: cell('435€ (sense IVA)'),
      } },
      { id: 'premium-2', source: ['C04'], cells: {
        name: cell('', true),
        description: cell('Biscuit llima humit, crema de formatge i xoco blanc, anous de macadàmia caramelitzades.'),
        two: cell('185€ (sense IVA)'), three: cell('435€ (sense IVA)'),
      } },
    ],
    fragments: [{ text: 'crunch avellana.', source: ['C04'], note: 'Fragment al final d’una fila anterior. L’enllaç amb la descripció de C03 queda pendent de confirmar.' }],
  },
  marquesa: {
    title: 'Tartes marquesa:', source: ['C04'], columns: weddingColumns.map(c => ({ ...c })),
    rows: [{ id: 'carabassa', source: ['C04'], cells: {
      name: cell('Carabassa i pistatxo'),
      description: cell('biscuit de carabassa, buttercream de pistatxo, crunch de pistatxo caramelitzat.'),
      two: cell('200€ (sense IVA)'), three: cell('', true),
    } }],
  },
  buffet: {
    title: 'Bufet de tortades', source: ['C08', 'C09'],
    columns: [
      { key: 'name', label: cell('Tarta:') },
      { key: 'description', label: cell('Què du?') },
      { key: 'normal', label: cell('Tamany (12/', true) },
      { key: 'flowers', label: cell('', true) },
    ],
    rows: [
      { id: 'favorita', source: ['C08'], cells: {
        name: cell('LA FAVORITA'),
        description: cell('SAP A FORMATGE:\n\nAmb un toc de formatge blau d’Auvergne DOP, base de galeta lotus, figues i mel, pistatxos (adaptable a la fruita de temporada).'),
        normal: cell('Amb decoració normal:\n\n45€'), flowers: cell('', true),
      } },
      { id: 'parmigiana', source: ['C08'], cells: {
        name: cell('PARMIGIANA'),
        description: cell('SAP A FORMATGE:\n\nDe parmesà, base de galeta maria i fruits secs caramelitzats, raïm fresc (adaptable a la fruita de temporada).'),
        normal: cell('Amb decoració normal:\n\n45€'), flowers: cell('', true),
      } },
      { id: 'cafe-fragment', source: ['C09'], cells: {
        name: cell('', true),
        description: cell('Base de galeta maria i mulada amb café d’especialitat, xocolate 85%, fruita de temporada.', true),
        normal: cell('normal:\n\n45€', true), flowers: cell('50€', true),
      } },
      { id: 'pistatxo-fragment', source: ['C09'], cells: {
        name: cell('', true),
        description: cell('PREMIUM:\n\nBase de galeta maria i pistatxos, amb crema de pistatxo casolana, decorada amb més pistatxo i fruita de temporada.'),
        normal: cell('Amb decoració normal:\n\n50€'), flowers: cell('Amb flors de la boda:\n\n55€'),
      } },
    ],
  },
  cookies: {
    title: 'Micotetes', source: ['C11'],
    columns: [
      { key: 'description', label: cell('De què son?') },
      { key: 'twentyfive', label: cell('25 micotetes (1,8€ ud)') },
      { key: 'fifty', label: cell('50 micotetes (1,6€ ud)') },
    ],
    rows: [{ id: 'micotetes', source: ['C11'], cells: {
      description: cell('Sabors variats (xoco negre i sal, cacahuet fregit amb mel, 3 xocolates…)'),
      twentyfive: cell('45€ (sense IVA)'), fifty: cell('80€ (sense IVA)'),
    } }],
  },
};

const transportAnswer = 'Pel moment no tenim un transport adaptat al transport dels nostres productes, pel que caldria arreplegar-los a l’obrador. Sí podem posar-nos en contacte amb la sala per veure si podem buscar una solució i oferim el servei de muntatge tant de taula com de decoració dels pastissos in situ per un suplement. Pregunteu-nos i ho aclarim!';

export const sections = [
  {
    id: 'la-carta', label: 'La carta', title: 'LA FIGUERA EVENTS', number: '01', kind: 'home',
  },
  {
    id: 'tartes-nupcials', label: 'Tartes nupcials', title: 'TARTES NUPCIALS:', number: '02',
    intro: 'Totes les nostres tartes són 100% artesanals, (no usem cap crema ni preparació industrial) utilitzem productes de proximitat i de temporada i decorem amb tot l’amor mundial cada pastís utilitzant elements naturals, flors i fruita fresca coherent cromàticament amb la decoració de tot l’event, pel que la vostra tortada va a ser única i irrepetible. I, com que som un obrador familiar, NO AGAFEM MÉS D’UN EVENT PER DATA per poder dedicar tot el nostre temps al vostre dia.',
    source: ['C02'], tableIds: ['classics', 'premium', 'marquesa'],
    questions: [
      { q: 'Què inclou el preu?', source: ['C05'], a: 'El preu inclou una reunió presencial o per telemàtica per tal de coneixer-nos i veure quines són les vostres preferències/gustos, assessorament personal i la tortada nupcial. No inclou el muntatge de cap taula dolça ni el transport. Es pot fer una prova amb dos sabors distints del mateix preu o gama abans de la cerimònia que inclouria dues tartes (cadascuna del seu sabor corresponent) d’unes 6/8 racions per 50€. (Els preus es presenten sense el 21% d’IVA)' },
      { q: 'Com es decoren?', source: ['C05'], a: 'Totes les tartes es poden decorar amb fruita, flors, o una combinació de les dues. Podem posar-nos en contacte amb la persona encarregada de les flors per tal que el pastís tinga la mateixa decoració que la resta de la celebració. Ens podem reunir i veure diferents dissenys per trobar la vostra tortada ideal. Contacta’ns i ho organitzem! (Hi haurà un recàrrec si hem de fer-nos càrrec de comprar flors a conjunt amb l’event, tot i que moltes vegades es pot demanar de manera gratuïta que la persona encarregada deixe una bossa amb flors per tal de decorar el', pending: true },
      { q: 'Feu tartes de fondant?', source: ['C06'], a: 'No. No és la nostra especialitat. Nosaltres ens centrem en un tipus de tarta natural, amb fruita fresca, fruits secs, brots, fulles i flors comestibles. Tot i això, podem adaptar el disseny a les vostres preferències.' },
      { q: 'La tarta pot ser blanca encara que triem una de xocolata o lotus?', source: ['C06'], a: 'Sense problema. Tot i què algunes cremes siguen obscures, podem fer una crema distinta per a l’exterior de la tarta i que quede del color que trieu :)' },
      { q: 'Teniu opcions adaptades per a intoleràncies?', source: ['C06'], a: 'Sí! Es poden adaptar pastissos sense gluten, sense lactosa, vegans, sense sucre... Contacta’ns per veure quines necessitats teniu i quines possibilitats podem oferir-vos.' },
      { q: 'Els 3 pisos de la tortada han de ser iguals?', source: ['C06'], a: 'No cal. Les tortades nupcials es poden fer combinant sabors (que cada pis de la tarta tinga un sabor destint) per un suplement de 20€. No es podran fer combinacions de sabors de tartes de diferent preu (per exemple, es pot fer una tarta de', pending: true },
      { q: 'Què passa si som més de 85 persones?', source: ['C07'], a: 'Fem una tortada nupcial per a les fotografies i el record de tallar-la, però després oferim tartes d’uns 20cm de diàmetre i uns 10/12cm d’altura (4 capes de biscuit) que donen unes 25 porcions fins que tothom tinga pastís. El preu de cada tarta extra és de 50€.' },
      { q: 'Ens porteu vosaltres les tortades?', source: ['C07'], a: transportAnswer },
    ],
  },
  {
    id: 'bufet-de-tortades', label: 'Bufet de tortades', title: 'BUFET DE TORTADES:', number: '03',
    intro: 'Com ja sabeu, som un obrador especialitzat en tartes de formatge, pel que oferim l’opció de montar, en compte d’una taula dolça, una taula de tartes de formatge dels sabors que trieu i que vos adjuntem a continuació. Aquesta és una opció perfecta perquè la vostra gent puga triar i servir-se el que vulga quan vulga (com entra un tros de pastís de resopó…?)',
    source: ['C07', 'C08'], tableIds: ['buffet'],
    questions: [
      { q: 'Quantes tortades inclou el bufet?', source: ['C09'], a: 'Les que vulgueu, així de simple! Pagueu per les que contracteu a preus normals de carta 🙂' },
      { q: 'Com es decoren?', source: ['C10'], a: 'Com veieu a la taula, teniu l’opció de que les decorem com de normal a l’obrador, amb fruita de temporada, o de decorar-les amb les flors de la vostra boda. Contacteu-nos i ho parlem!' },
      { q: 'Es poden combinar les dues coses?', source: ['C10'], a: 'Clar que sí! Entenem que moltes parelles volen una tortada especial per a les fotos, però també és cert que, moltes vegades, aplegat el moment de servir el pastís, la gent ja té ganes de ballar i es tira molt de menjar. Amb aquesta opció, és un win win. Podeu agafar una tortada de dos o tres pisos (el que preferiu) i després fer una taula dolça combinant tortades i altres dolcets o simplement de pastissos de formatge per a tots els gustos i sabors!' },
      { q: 'Adapteu per a intoleràncies, celiaquies...?', source: ['C10'], a: 'Sempre sí! Intentem que tothom puga gaudir del dia. Pregunta’ns i et donem opcions!' },
      { q: 'Monteu vosaltres la taula amb el bufet?', source: ['C10'], a: 'Pel moment no tenim un transport adaptat al transport dels nostres productes, pel que caldria arreplegar-los a l’obrador. Sí podem posar-nos en', pending: true },
    ],
  },
  {
    id: 'taules-dolces', label: 'Taules dolces', title: 'TAULES DOLCES:', number: '04',
    intro: 'L’última opció que vos podem donar és la de la taula dolça completa, en la que podeu tenir tant tartes de distints sabors (que podeu triar de la taula de dalt), com micotetes (mini cookies de 30gr casolanes) de sabors variats embossades de manera individual perquè les vostres personetes preferides se les puguen endur o menjar fresques al moment.',
    source: ['C11'], tableIds: ['cookies'],
    questions: [
      { q: 'Es poden triar els sabors?', source: ['C11', 'C12'], a: 'Els sabors es posen en funció de disponibilitat a l’obrador, ja que tenim un espai molt limitat, però sí atenem a preferències i adaptacions.' },
      { q: 'Es poden combinar tartes i cookies?', source: ['C12'], a: 'Clar que sí! Podem fer una taula amb les tartes i cookies que vulgueu. Amb tota la informació al document, es podeu organitzar i decidir què vos va millor. Nosaltres estem sempre ahí per assessorar-vos. Hem fet bodes en les que hem posat una tarta nupcial de dos pisos al centre de la taula, vàries tartes de formatge i pots amb micotetes, i han sigut una sensació! :)' },
      { q: 'Monteu vosaltres la taula dolça?', source: ['C12', 'C13'], a: transportAnswer },
    ],
  },
  {
    id: 'contacte', label: 'Contacte', title: 'CONTACTE:', number: '05', kind: 'contact',
    intro: 'Moltes gràcies per pensar amb nosaltres! Si teniu qualsevol dubte, contacteu-nos per qualsevol d’aquests mitjans:',
    source: ['C13'],
  },
];
