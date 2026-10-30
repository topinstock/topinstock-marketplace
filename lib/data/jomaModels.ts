export interface JomaColorVariant {
  name: string;
  code: string;
  image: string;
}

export interface JomaTracksuitModel {
  id: string;
  name: string;
  code: string;
  category: 'academy' | 'championship' | 'danubio' | 'phoenix' | 'campus' | 'geci';
  categoryLabel: string;
  description: string;
  composition: string;
  fit: string;
  availableSizes: string[];
  colors: JomaColorVariant[];
  features: string[];
}

export const JOMA_TRACKSUIT_MODELS: JomaTracksuitModel[] = [
  {
    id: 'joma-academy-iv',
    name: 'Trening Joma Academy IV',
    code: '101966',
    category: 'academy',
    categoryLabel: 'Academy Series',
    description: 'Cel mai popular trening de antrenament și prezentare pentru academii de fotbal și cluburi. Jachetă cu fermoar complet și inserții geometrice contrastante, pantaloni asortați cu buzunare și fermoar la gleznă.',
    composition: '100% Poliester Tricotat (Durable Interlock)',
    fit: 'Regular Athletic Fit',
    availableSizes: ['4XS-3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: [
      { name: 'Albastru Royal / Bleumarin', code: '703', image: '/images/joma/academy_iv_royal_navy.jpg' },
      { name: 'Roșu / Negru', code: '601', image: '/images/joma/academy_iv_red_black.jpg' },
      { name: 'Galben / Negru', code: '901', image: '/images/joma/academy_iv_yellow_black.jpg' },
      { name: 'Alb / Bleumarin', code: '203', image: '/images/joma/academy_iv_white_navy.jpg' },
      { name: 'Negru Integral', code: '100', image: '/images/joma/101966_100.jpg' },
    ],
    features: [
      'Fermoar frontal complet cu protecție pentru bărbie',
      'Manșete și talie canelate pentru stabilitate în mișcare',
      'Pantaloni cu talie elastică, șnur interior și fermoar la terminație',
      'Material rezistent la frecare și spălări repetate',
      'Ideal pentru transfer termic și broderie cu stema clubului'
    ]
  },
  {
    id: 'joma-championship-vii',
    name: 'Trening Joma Championship VII',
    code: '103200',
    category: 'championship',
    categoryLabel: 'Championship Series',
    description: 'Linia premium de prezentare pentru echipele de seniori și juniori avansați. Design modern cu linii dinamice pe umeri și brațe, finisaje fine și confort termic optim pentru deplasări și pre-meci.',
    composition: '100% Poliester Fleece Interlock',
    fit: 'Slim Athletic Fit',
    availableSizes: ['3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: [
      { name: 'Negru / Roșu', code: '106', image: '/images/joma/championship_vii_black_red.jpg' },
      { name: 'Bleumarin / Albastru Royal', code: '331', image: '/images/joma/103200_331.jpg' },
      { name: 'Roșu / Alb', code: '600', image: '/images/joma/103200_600.jpg' },
      { name: 'Verde / Negru', code: '450', image: '/images/joma/103200_450.jpg' },
    ],
    features: [
      'Guler înalt căptușit pentru protecție împotriva vântului',
      'Buzunare laterale cu fermoar invizibil la jachetă și pantaloni',
      'Pantaloni conici cu fermoare inferioare rapide',
      'Logo Joma brodat de înaltă densitate',
      'Spațiu optimizat pe piept și spate pentru sponsori'
    ]
  },
  {
    id: 'joma-eco-championship',
    name: 'Trening Joma Eco-Championship',
    code: '102751',
    category: 'championship',
    categoryLabel: 'Eco Championship',
    description: 'Linia ecologică oficială realizată din 100% poliester reciclat, oferind respirabilitate superioară, elasticitate și impact ecologic redus. Folosită de cluburile profesioniste partenere Joma.',
    composition: '100% Poliester Reciclat (Eco-Tech Interlock)',
    fit: 'Ergonomic Athletic',
    availableSizes: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: [
      { name: 'Albastru Royal / Bleumarin', code: '703', image: '/images/joma/eco_championship_royal_navy.jpg' },
      { name: 'Negru / Roșu', code: '106', image: '/images/joma/championship_vii_black_red.jpg' },
      { name: 'Bleumarin / Turcoaz', code: '342', image: '/images/joma/102740_331.jpg' },
    ],
    features: [
      'Țesătură tehnică din fibre reciclate certificate',
      'Manșete elastice raglan pentru libertate totală a brațelor',
      'Talie reglabilă cu cordon plat ranforsat',
      'Tratament anti-scămoșare și uscare ultra-rapidă',
      'Suprafață mată premium pentru inscripționări de calitate'
    ]
  },
  {
    id: 'joma-phoenix-ii',
    name: 'Trening Joma Phoenix II',
    code: '103121',
    category: 'phoenix',
    categoryLabel: 'Phoenix Series',
    description: 'Costum complet de antrenament și încălzire format din hanorac tehnic cu glugă și fermoar plus pantaloni asortați. Special gândit pentru condiții de temperaturi scăzute și antrenamente de seară.',
    composition: '100% Poliester Fleece periat interior',
    fit: 'Standard Training Fit',
    availableSizes: ['4XS-3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: [
      { name: 'Negru / Alb', code: '102', image: '/images/joma/phoenix_ii_black_white.jpg' },
      { name: 'Bleumarin / Galben', code: '339', image: '/images/joma/103121_900.jpg' },
      { name: 'Roșu / Negru', code: '601', image: '/images/joma/103121_600.jpg' },
    ],
    features: [
      'Glugă reglabilă cu protecție împotriva ploii ușoare',
      'Interior plușat pentru retenție termică optimă',
      'Buzunare încăpătoare de tip marsupiu cu fermoare',
      'Cusături plate (flatlock) pentru prevenirea frecării',
      'Compatibil cu seturile oficiale de meci Phoenix'
    ]
  },
  {
    id: 'joma-danubio-iii',
    name: 'Trening Joma Danubio III',
    code: '102740',
    category: 'danubio',
    categoryLabel: 'Danubio Series',
    description: 'Modelul clasic al cluburilor de tradiție. Combinație bicoloră cu blocuri simetrice pe piept și umeri, oferind o identitate vizuală puternică pe teren și în cantonamente.',
    composition: '100% Poliester Shiny / Matte Twill',
    fit: 'Regular Team Fit',
    availableSizes: ['3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: [
      { name: 'Bleumarin / Alb', code: '331', image: '/images/joma/102740_331.jpg' },
      { name: 'Negru / Alb', code: '100', image: '/images/joma/102740_100.jpg' },
      { name: 'Roșu / Alb', code: '600', image: '/images/joma/102740_600.jpg' },
      { name: 'Albastru Royal / Alb', code: '700', image: '/images/joma/102740_700.jpg' },
    ],
    features: [
      'Blocuri mari de culoare pentru contrast maxim al siglei',
      'Fermoar integral robust cu cursor metalic',
      'Pantaloni drepți cu terminație reglabilă',
      'Rezistență ridicată la rupere și uzură intensivă',
      'Recomandat pentru grupe de juniori și școli de fotbal'
    ]
  },
  {
    id: 'joma-campus-iv',
    name: 'Trening Joma Campus IV',
    code: '102103',
    category: 'campus',
    categoryLabel: 'Campus Series',
    description: 'Linia de prezentare sofisticată, ideală pentru staff-ul tehnic, deplasări oficiale și cantonamente. Design curat, finisaje mate și material elastic extrem de confortabil.',
    composition: '95% Poliester, 5% Elastan Spandex',
    fit: 'Modern Slim Fit',
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: [
      { name: 'Negru Carbon', code: '100', image: '/images/joma/102103_100.jpg' },
      { name: 'Bleumarin Clasic', code: '331', image: '/images/joma/102103_331.jpg' },
      { name: 'Roșu Bordeaux', code: '600', image: '/images/joma/102103_600.jpg' },
    ],
    features: [
      'Compoziție cu adaos de elastan pentru mobilitate maximă',
      'Guler bomber elegant cu bordură fină',
      'Buzunare laterale securizate cu fermoare ascunse',
      'Finisaj hidrofob ușor respirabil',
      'Aspect impecabil la conferințe de presă și călătorii'
    ]
  },
  {
    id: 'joma-montreal-track',
    name: 'Jachetă & Trening Joma Montreal',
    code: '102744',
    category: 'campus',
    categoryLabel: 'Montreal Series',
    description: 'Echipament tehnic complet pentru încălzire și antrenamente pe teren sintetic sau iarbă. Guler special cu protecție pentru gât și inserții laterale din plasă micro-mesh pentru ventilație.',
    composition: '100% Poliester Tehnic Micro-Mesh',
    fit: 'Athletic Slim Fit',
    availableSizes: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
    colors: [
      { name: 'Alb / Bleumarin', code: '203', image: '/images/joma/montreal_jacket_white_navy.jpg' },
      { name: 'Negru / Gri', code: '100', image: '/images/joma/102744_100.jpg' },
      { name: 'Bleumarin / Roșu', code: '331', image: '/images/joma/102744_331.jpg' },
    ],
    features: [
      'Zone speciale de ventilație sub braț și pe laterale',
      'Guler ergonomic anti-frecare',
      'Menține temperatura corpului constantă în efort',
      'Uscare rapidă fără reținere de umiditate',
      'Personalizabil cu nume și număr mic pe piept'
    ]
  },
  {
    id: 'joma-islandia-iii',
    name: 'Geacă de Iarnă & Cantonament Joma Islandia III',
    code: '101697',
    category: 'geci',
    categoryLabel: 'Geci & Iarnă',
    description: 'Geacă lungă termoizolată pentru rezerve, antrenori și deplasări de iarnă. Căptușeală polară călduroasă, material exterior impermeabil și glugă protectivă detașabilă.',
    composition: '100% Poliamidă impermeabilă / Căptușeală Polar Fleece',
    fit: 'Loose Winter Bench Fit',
    availableSizes: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: [
      { name: 'Bleumarin Închis', code: '331', image: '/images/joma/islandia_iii_navy.jpg' },
      { name: 'Negru', code: '100', image: '/images/joma/101664_100.jpg' },
    ],
    features: [
      'Izolație termică superioară pentru temperaturi scăzute (-10°C)',
      'Buzunare duble căptușite cu polar pentru mâini',
      'Fermoar dublu sens pentru flexibilitate pe banca de rezerve',
      'Glugă adâncă cu șnur de strângere',
      'Impermeabilitate și rezistență la vânt puternic'
    ]
  },
  {
    id: 'joma-combi-jacket',
    name: 'Jachetă de Ploaie & Antrenament Joma Combi',
    code: '101664',
    category: 'geci',
    categoryLabel: 'Geci Antrenament',
    description: 'Fâș impermeabil cu fermoar complet pentru antrenamente în condiții meteo nefavorabile. Foarte ușoară, rezistentă la ploaie și vânt, prevăzută cu manșete elastice.',
    composition: '100% Poliester Taslan Impermeabil',
    fit: 'Regular Protective Fit',
    availableSizes: ['4XS-3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: [
      { name: 'Roșu Red', code: '600', image: '/images/joma/combi_jacket_red.jpg' },
      { name: 'Negru', code: '100', image: '/images/joma/combi_jacket_black.jpg' },
      { name: 'Bleumarin', code: '331', image: '/images/joma/101664_331.jpg' },
    ],
    features: [
      'Tratament impermeabil Water-Resistant (1500mm)',
      'Glugă retractabilă în guler',
      'Buzunare laterale securizate',
      'Compactă: se pliază ușor în geanta de echipament',
      'Recomandată pentru toate grupele clubului în sezonul rece'
    ]
  }
];

