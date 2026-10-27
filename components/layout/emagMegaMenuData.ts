import React from 'react';
import {
  Smartphone,
  Zap,
  UtensilsCrossed,
  Home,
  Gamepad2,
  Sparkles,
  Gift,
  Tent,
  Car,
  Shirt,
  Gem,
  Lightbulb,
} from 'lucide-react';

export interface EmagSubItem {
  name: string;
  href: string;
  badge?: string;
}

export interface EmagSubGroup {
  title: string;
  href: string;
  items: EmagSubItem[];
}

export interface EmagCategory {
  id: string;
  name: string;
  slug: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  productCount: string;
  groups: EmagSubGroup[];
  topBrands?: string[];
}

export const EMAG_CATALOG: EmagCategory[] = [
  {
    id: 'gsm-gadgets',
    name: 'Telefoane, Tablete & GSM',
    slug: 'gsm-si-gadgets',
    href: '/gsm-si-gadgets/c',
    icon: Smartphone,
    productCount: '3.300+ produse',
    topBrands: ['TOPinStock', 'Apple', 'Samsung', 'Xiaomi', 'Huawei'],
    groups: [
      {
        title: 'Huse & Carcase Telefoane',
        href: '/huse-telefoane/c',
        items: [
          { name: 'Toate Husele de Telefon', href: '/huse-telefoane/c', badge: 'POPULAR' },
          { name: 'Liquid Silicone Cases', href: '/liquid-silicone/c', badge: 'TOP' },
          { name: 'TPU Matte Slim', href: '/tpu-matte/c' },
          { name: 'TPU Antișoc Ranforsat', href: '/tpu-antisoc/c' },
          { name: 'Gama MagSafe Magnetică', href: '/gama-magsafe/c', badge: 'NOU' },
        ],
      },
      {
        title: 'Folii & Protecție Ecran',
        href: '/folii-protectie-telefoane/c',
        items: [
          { name: 'Folii Protecție Telefoane', href: '/folii-protectie-telefoane/c' },
          { name: 'Folie Sticlă Securizată 111D', href: '/folie-sticla-securizata-111d/c', badge: 'HOT' },
          { name: 'Folie Sticlă Full Glue', href: '/folie-sticla-securizata-full-glue/c' },
          { name: 'Folie Sticlă Privacy Confidențială', href: '/folie-sticla-securizata-privacy/c' },
        ],
      },
      {
        title: 'Încărcătoare & Cabluri',
        href: '/cabluri-de-date-telefoane/c',
        items: [
          { name: 'Cabluri Date USB-C & Lightning', href: '/cabluri-de-date-telefoane/c' },
          { name: 'Încărcătoare Rapide Fast Charge', href: '/incarcatoare-telefoane/c' },
          { name: 'Suporturi Telefoane Auto & Birou', href: '/suporturi-telefoane/c' },
        ],
      },
      {
        title: 'Smartwatch & Audio',
        href: '/smartwatch-uri/c',
        items: [
          { name: 'Smartwatch-uri & Brățări', href: '/smartwatch-uri/c' },
          { name: 'Accesorii & Curele Smartwatch', href: '/accesorii-smartwatch/c' },
          { name: 'Huse Căști AirPods', href: '/huse-airpods/c' },
        ],
      },
    ],
  },
  {
    id: 'electrocasnice',
    name: 'Electrocasnice & Climatizare',
    slug: 'electrocasnice',
    href: '/electrocasnice/c',
    icon: Zap,
    productCount: '400+ produse',
    topBrands: ['Victronic', 'Oliver Voltz', 'Hausberg', 'Grünberg'],
    groups: [
      {
        title: 'Climatizare & Încălzire',
        href: '/calorifere-tip-panou/c',
        items: [
          { name: 'Calorifere Electrice cu Ulei', href: '/calorifere-tip-panou/c', badge: 'SEZON' },
          { name: 'Ventilatoare & Climatizare', href: '/ventilator/c' },
          { name: 'Aeroterme & Convectoare', href: '/aeroterme-si-convectori/c' },
          { name: 'Încălzire pe Lemne & Șeminee', href: '/incalzire-pe-lemne/c' },
        ],
      },
      {
        title: 'Electrocasnice Bucătărie',
        href: '/mixere-roboti-blendere/c',
        items: [
          { name: 'Mixere, Roboți & Blendere', href: '/mixere-roboti-blendere/c', badge: '139 MODELE' },
          { name: 'Mașini de Tocat Carne', href: '/masini-de-tocat-carne/c', badge: 'TOP' },
          { name: 'Echipamente Electrice Bucătărie', href: '/echipamente-bucatarie/c' },
          { name: 'Plite & Aragaze Portabile', href: '/aragaze-camping-portabile/c' },
        ],
      },
      {
        title: 'Îngrijire & Curățenie',
        href: '/electrocasnice/c',
        items: [
          { name: 'Mese de Călcat & Accesorii', href: '/mese-de-calcat-si-accesorii/c' },
          { name: 'Aspiratoare & Curățare Rapidă', href: '/aspirator-vertical/c' },
        ],
      },
    ],
  },
  {
    id: 'bucatarie-menaj',
    name: 'Bucătărie & Menaj',
    slug: 'bucatarie-menaj',
    href: '/bucatarie-menaj/c',
    icon: UtensilsCrossed,
    productCount: '1.200+ produse',
    topBrands: ['Grünberg', 'TOPinStock', 'Royalty Line', 'Herevin'],
    groups: [
      {
        title: 'Gătit & Oale Inox',
        href: '/oale/c',
        items: [
          { name: 'Seturi Oale Inox Profesionale', href: '/oale/c', badge: '390+ MODELE' },
          { name: 'Seturi Oale & Tigăi Granit', href: '/seturi-oale-si-tigai/c', badge: 'BESTSELLER' },
          { name: 'Materiale & Accesorii Gătit', href: '/materiale-pentru-gatit-si-servire/c' },
          { name: 'Echipamente & Piese Bucătărie', href: '/echipamente-bucatarie/c' },
        ],
      },
      {
        title: 'Ustensile & Preparare',
        href: '/ustensile-pentru-bucatarie/c',
        items: [
          { name: 'Ustensile Bucătărie & Spatule', href: '/ustensile-pentru-bucatarie/c', badge: '340+ ARTICOLE' },
          { name: 'Ustensile Menaj & Pregătire', href: '/ustensile-bucatarie-menaj/c' },
          { name: 'Cuțite Inox & Seturi Profesionale', href: '/cutit-si-set-de-cutite/c' },
          { name: 'Tocătoare din Lemn & Plastic', href: '/tocatoare/c' },
        ],
      },
      {
        title: 'Veselă & Servire Masă',
        href: '/articole-servire-masa/c',
        items: [
          { name: 'Articole Servire Masă & Veselă', href: '/articole-servire-masa/c', badge: '130+ ARTICOLE' },
          { name: 'Seturi Veselă Porțelan', href: '/seturi-vesela/c' },
          { name: 'Termosuri & Ceainice Inox', href: '/termos/c' },
        ],
      },
      {
        title: 'Păstrare & Organizare',
        href: '/organizatoare-si-depozitare-bucatarie/c',
        items: [
          { name: 'Organizatoare & Suporturi Bucătărie', href: '/organizatoare-si-depozitare-bucatarie/c', badge: '220+ MODELE' },
          { name: 'Caserole Alimentare Hermetice', href: '/caserole-pentru-mancare/c' },
        ],
      },
    ],
  },
  {
    id: 'casa-curatenie-bricolaj',
    name: 'Casă, Curățenie & Bricolaj',
    slug: 'casa-si-bricolaj',
    href: '/casa-si-bricolaj/c',
    icon: Home,
    productCount: '8.100+ produse',
    topBrands: ['TOPinStock', 'Detoolz', 'Almaz', 'Evotools'],
    groups: [
      {
        title: 'Curățenie & Menaj',
        href: '/articole-pentru-casa-si-curatenie/c',
        items: [
          { name: 'Articole Curățenie & Menaj', href: '/articole-pentru-casa-si-curatenie/c', badge: '1.500+ PRODUSE' },
          { name: 'Articole & Accesorii Baie', href: '/articole-pentru-baie/c', badge: '410+ ARTICOLE' },
          { name: 'Cutii & Coșuri Depozitare', href: '/cutii-depozitare/c', badge: '210+ ARTICOLE' },
          { name: 'Articole Bucătărie & Casă', href: '/articole-pentru-bucatarie/c' },
          { name: 'Coșuri de Gunoi cu Pedală', href: '/cos-de-gunoi/c' },
        ],
      },
      {
        title: 'Scule, Grădină & Pompe',
        href: '/scule-si-unelte/c',
        items: [
          { name: 'Motocoase pe Benzină & Piese', href: '/motocoase/c', badge: '160+ MODELE' },
          { name: 'Scule & Unelte TOPinStock', href: '/scule-si-unelte/c', badge: 'TOP' },
          { name: 'Articole Grădină & Bricolaj', href: '/articole-pentru-gradina-si-bricolaj/c' },
          { name: 'Pompe Submersibile & Hidrofoare', href: '/pompe-submersibile/c' },
          { name: 'Pompe de Suprafață & Aspirație', href: '/pompe-de-suprafata/c' },
        ],
      },
      {
        title: 'Iluminat & Animale',
        href: '/articole-pentru-iluminat/c',
        items: [
          { name: 'Corpuri & Surse Iluminat Casă', href: '/articole-pentru-iluminat/c', badge: '1.300+ ARTICOLE' },
          { name: 'Lămpi Solare LED Curte & Grădină', href: '/lampi-solare/c', badge: '200+ MODELE' },
          { name: 'Articole pentru Animale de Companie', href: '/articole-pentru-animale/c' },
        ],
      },
    ],
  },
  {
    id: 'jucarii-copii',
    name: 'Jucării, Copii & Bebe',
    slug: 'articole-pentru-copii',
    href: '/articole-pentru-copii/c',
    icon: Gamepad2,
    productCount: '1.700+ produse',
    topBrands: ['TOPinStock', 'Splendor', 'Victronic', 'KinderKraft'],
    groups: [
      {
        title: 'Jucării & Jocuri',
        href: '/jucarii-si-jocuri/c',
        items: [
          { name: 'Jucării & Jocuri de Societate', href: '/jucarii-si-jocuri/c', badge: '410+ JOCURI' },
          { name: 'Jucării Interactive & Robotice', href: '/jucarii-interactive/c', badge: '220+ MODELE' },
          { name: 'Jucării Educative & Montessori', href: '/jucarii-educative/c', badge: '110+ ARTICOLE' },
          { name: 'Jucării Senzoriale & Fidget Toys', href: '/jucarii-senzoriale-fidget-toys/c', badge: '180+ ARTICOLE' },
          { name: 'Squishy & Jucării Antistres', href: '/jucarii-squishy-si-gonggi/c', badge: '100+ MODELE' },
          { name: 'NeeDoh & Jucării de Frământat', href: '/needoh-si-dumpling/c' },
        ],
      },
      {
        title: 'Vehicule & Mișcare',
        href: '/masinute-triciclete-si-masinute-electrice/c',
        items: [
          { name: 'Mașinuțe & Vehicule Electrice', href: '/masinute-triciclete-si-masinute-electrice/c', badge: '100+ MODELE' },
          { name: 'Biciclete Copii Splendor (12"-24")', href: '/biciclete-pentru-copii/c', badge: 'TOP' },
          { name: 'Biciclete cu Trei Roți & Triciclete', href: '/biciclete-cu-trei-roti-pentru-copii/c' },
        ],
      },
      {
        title: 'Articole Școală & Bebe',
        href: '/genti-portofele-penare/c',
        items: [
          { name: 'Ghiozdane, Penare & Rechizite', href: '/genti-portofele-penare/c', badge: '60+ ARTICOLE' },
          { name: 'Accesorii & Articole Diverse Copii', href: '/articole-diverse-copii/c' },
          { name: 'Tatuaje Temporare & Stickere', href: '/tatuaje-temporare-si-stikere/c' },
          { name: 'Premergătoare Bebeluși', href: '/premergatoare/c' },
        ],
      },
    ],
  },
  {
    id: 'frumusete-ingrijire',
    name: 'Îngrijire Personală & Cosmetice',
    slug: 'ingrijire-personala-si-cosmetice',
    href: '/ingrijire-personala-si-cosmetice/c',
    icon: Sparkles,
    productCount: '4.300+ produse',
    topBrands: ['TOPinStock Care', "L'Oreal", 'Nivea', 'Dove', 'Philips'],
    groups: [
      {
        title: 'Îngrijire Păr & Coafură',
        href: '/ingrijire-par-si-accesorii/c',
        items: [
          { name: 'Îngrijire Păr & Accesorii', href: '/ingrijire-par-si-accesorii/c', badge: '1.050+ ARTICOLE' },
          { name: 'Plăci Îndreptat Părul Profesionale', href: '/placi-de-indreptat-parul/c' },
          { name: 'Perii Electrice & Ondulatoare', href: '/perii-electrice/c' },
          { name: 'Uscătoare de Păr Rapide', href: '/uscator-de-par/c' },
          { name: 'Șampoane & Tratamente Nutritive', href: '/sampon/c' },
        ],
      },
      {
        title: 'Igienă & Sănătate',
        href: '/deodorante-si-antiperspirante/c',
        items: [
          { name: 'Deodorante & Antiperspirante', href: '/deodorante-si-antiperspirante/c', badge: '660+ ARTICOLE' },
          { name: 'Geluri de Duș Hidratante', href: '/geluri-de-dus/c', badge: '410+ ARTICOLE' },
          { name: 'Igiena Dentară & Periuțe', href: '/igiena-dentara/c', badge: '310+ ARTICOLE' },
          { name: 'Articole Sănătate & Măsurare', href: '/articole-sanatate/c', badge: '190+ ARTICOLE' },
          { name: 'Aparate de Tuns & Trimmere', href: '/aparate-de-tuns/c' },
        ],
      },
      {
        title: 'Parfumuri & Make-Up',
        href: '/parfumuri-si-seturi/c',
        items: [
          { name: 'Parfumuri & Seturi Cadou', href: '/parfumuri-si-seturi/c', badge: '460+ PARFUMURI' },
          { name: 'Îngrijire Ten & Măști', href: '/ingrijire-ten-si-corp/c', badge: '420+ ARTICOLE' },
          { name: 'Loțiuni & Creme de Corp', href: '/lotiuni-si-creme-de-corp/c', badge: '250+ ARTICOLE' },
          { name: 'Palete Farduri & Truse Make-Up', href: '/palete-farduri-si-truse-make-up/c', badge: '140+ TRUSE' },
        ],
      },
    ],
  },
  {
    id: 'craciun',
    name: 'Crăciun & Sezon Festiv',
    slug: 'craciun',
    href: '/craciun/c',
    icon: Gift,
    productCount: '4.700+ produse',
    topBrands: ['TOPinStock Festive', 'TOPinStock Christmas'],
    groups: [
      {
        title: 'Iluminat Festiv & Turturi',
        href: '/turturi-franjuri/c',
        items: [
          { name: 'Turturi / Franjuri LED Exterior', href: '/turturi-franjuri/c', badge: '1.360+ MODELE' },
          { name: 'Instalații Liniar / Șir LED', href: '/liniar-sir/c', badge: '1.090+ MODELE' },
          { name: 'Plase Luminoase pentru Gard & Fațadă', href: '/plasa/c', badge: '470+ MODELE' },
          { name: 'Perdele Luminoase Interconectabile', href: '/perdea/c', badge: '450+ MODELE' },
          { name: 'Decorațiuni Luminoase cu Flash', href: '/decoratiuni-luminoase/c' },
        ],
      },
      {
        title: 'Brazi & Ornamente',
        href: '/ornamente-brad/c',
        items: [
          { name: 'Ornamente & Globuri Brad', href: '/ornamente-brad/c', badge: '190+ MODELE' },
          { name: 'Brazi Artificiali Premium Ace 3D', href: '/brazi-craciun/c', badge: 'TOP' },
          { name: 'Beteală Bogată & Vârfuri Brad', href: '/beteala-craciun/c' },
        ],
      },
      {
        title: 'Decorațiuni & Costume',
        href: '/decoratiuni-craciun/c',
        items: [
          { name: 'Decorațiuni Festive Masă & Cameră', href: '/decoratiuni-craciun/c', badge: '140+ ARTICOLE' },
          { name: 'Figurine Decorative Moș Crăciun & Reni', href: '/figurine-decorative-craciun/c' },
          { name: 'Costume & Accesorii Crăciun', href: '/costume-craciun/c' },
        ],
      },
    ],
  },
  {
    id: 'sport-outdoor',
    name: 'Sport, Camping & Grătare',
    slug: 'sport-outdoor',
    href: '/sport-outdoor/c',
    icon: Tent,
    productCount: '150+ produse',
    topBrands: ['Victronic Outdoor', 'Campingaz', 'Joma'],
    groups: [
      {
        title: 'Camping & Grătare',
        href: '/aragaze-camping-portabile/c',
        items: [
          { name: 'Aragaze Camping Portabile', href: '/aragaze-camping-portabile/c', badge: 'POPULAR' },
          { name: 'Grătare de Grădină Cărbuni & Gaz', href: '/gratare/c' },
          { name: 'Pirostrii Tradiționale din Fontă', href: '/pirostrii/c' },
        ],
      },
      {
        title: 'Outdoor & Mișcare',
        href: '/accesorii-biciclete/c',
        items: [
          { name: 'Accesorii & Piese Biciclete', href: '/accesorii-biciclete/c', badge: '33 ARTICOLE' },
          { name: 'Articole Sportive & Mișcare', href: '/articole-sportive/c' },
          { name: 'Lăzi Frigorifice Portabile', href: '/lazi-frigorifice-frigidere-si-congelatoare-portabile/c' },
          { name: 'Echipamente Fitness & Sport', href: '/fitness-si-sport/c' },
        ],
      },
    ],
  },
  {
    id: 'auto-moto',
    name: 'Auto, Moto & Utilaje',
    slug: 'articole-auto',
    href: '/articole-auto/c',
    icon: Car,
    productCount: '450+ produse',
    topBrands: ['TOPinStock Auto', 'TOPinStock Tehnic'],
    groups: [
      {
        title: 'Accesorii Auto',
        href: '/articole-auto/c',
        items: [
          { name: 'Toate Articolele Auto', href: '/articole-auto/c', badge: '360+ PRODUSE' },
          { name: 'Accesorii Interior & Confort', href: '/accesorii-auto/c', badge: '130+ ARTICOLE' },
          { name: 'Electrice & Becuri Auto', href: '/electrice-auto/c' },
          { name: 'Roți, Pompe & Compresoare', href: '/roti-auto/c' },
        ],
      },
      {
        title: 'Gadgeturi & Conectică Auto',
        href: '/suporturi-telefoane/c',
        items: [
          { name: 'Suporturi Telefoane Auto Grilă & Parbriz', href: '/suporturi-telefoane/c', badge: 'TOP' },
          { name: 'Încărcătoare Rapide Brichetă Auto', href: '/incarcatoare-telefoane/c' },
        ],
      },
    ],
  },
  {
    id: 'moda-genti',
    name: 'Modă, Genți & Încălțăminte',
    slug: 'genti-accesorii',
    href: '/genti-accesorii/c',
    icon: Shirt,
    productCount: '320+ produse',
    topBrands: ['Desigual', 'Joma', 'Wrangler'],
    groups: [
      {
        title: 'Bărbați',
        href: '/geci-barbati/c',
        items: [
          { name: 'Geci & Jachete Bărbați Iarnă', href: '/geci-barbati/c', badge: '130+ MODELE' },
          { name: 'Încălțăminte & Adidași Bărbați', href: '/incaltaminte-barbati/c', badge: 'HOT' },
          { name: 'Îmbrăcăminte Casual Bărbați', href: '/imbracaminte-barbati/c' },
        ],
      },
      {
        title: 'Femei',
        href: '/imbracaminte-femei/c',
        items: [
          { name: 'Îmbrăcăminte Femei Elegant & Casual', href: '/imbracaminte-femei/c' },
          { name: 'Rochii & Fuste Moderne', href: '/rochii-femei/c' },
          { name: 'Accesorii & Eșarfe Damă', href: '/accesorii-femei/c' },
        ],
      },
      {
        title: 'Genți & Rucsacuri',
        href: '/genti-de-mana/c',
        items: [
          { name: 'Genți de Mână Elegante', href: '/genti-de-mana/c', badge: 'TOP' },
          { name: 'Rucsacuri Urbane & Laptop Desigual', href: '/rucsacuri/c' },
          { name: 'Portofele Din Piele & Material', href: '/portofele/c' },
          { name: 'Genți de Voiaj & Valize', href: '/genti-de-voiaj/c' },
        ],
      },
    ],
  },
  {
    id: 'bijuterii-petreceri',
    name: 'Bijuterii Argint & Cadouri',
    slug: 'bijuterii-argint',
    href: '/bijuterii-argint/c',
    icon: Gem,
    productCount: '1.200+ produse',
    topBrands: ['TOPinStock Silver', 'TOPinStock Party'],
    groups: [
      {
        title: 'Bijuterii Argint 925',
        href: '/pandantive-argint/c',
        items: [
          { name: 'Pandantive Argint 925', href: '/pandantive-argint/c', badge: '210+ MODELE' },
          { name: 'Brățări cu Șnur Roșu & Argint', href: '/bratari-cu-snur/c', badge: '140+ MODELE' },
          { name: 'Inele Elegante Argint', href: '/inele/c' },
          { name: 'Cercei Argint Finisați Manual', href: '/cercei/c' },
          { name: 'Coliere & Lănțișoare Argint', href: '/coliere/c' },
        ],
      },
      {
        title: 'Petreceri & Evenimente',
        href: '/articole-servire-masa/c',
        items: [
          { name: 'Articole Servire Masă Petrecere', href: '/articole-servire-masa/c', badge: '130+ ARTICOLE' },
          { name: 'Accesorii & Decorațiuni Petreceri', href: '/accesorii-petrecere/c', badge: '60+ ARTICOLE' },
          { name: 'Baloane Latex & Decorațiuni', href: '/baloane-latex/c' },
        ],
      },
      {
        title: 'Mărțișoare & Sezon',
        href: '/seturi-martisoare/c',
        items: [
          { name: 'Seturi Mărțișoare Tradiționale', href: '/seturi-martisoare/c', badge: '360+ SETURI' },
          { name: 'Brățări Mărțișor Șnur Alb-Roșu', href: '/martisor-bratara-snur-alb-rosu/c' },
          { name: 'Brățări Mărțișor cu Ciucure', href: '/martisor-bratara-cu-ciucure/c' },
          { name: 'Brățări Simbol Primăvară', href: '/bratara-primavara/c' },
        ],
      },
    ],
  },
  {
    id: 'materiale-electrice',
    name: 'Materiale Electrice (En-Gross)',
    slug: 'materiale-electrice-engross',
    href: '/materiale-electrice-engross/c',
    icon: Lightbulb,
    productCount: '750+ produse',
    topBrands: ['Schneider', 'Legrand', 'Philips LED', 'TOPinStock Pro'],
    groups: [
      {
        title: 'Cabluri & Conductori',
        href: '/cabluri-conductori-engross/c',
        items: [
          { name: 'Cabluri & Conductori Electrice Cupru', href: '/cabluri-conductori-engross/c', badge: '270+ TIPURI' },
          { name: 'Tuburi, Canale Cablu PVC & Copex', href: '/tuburi-conectica-engross/c', badge: '190+ ARTICOLE' },
        ],
      },
      {
        title: 'Tablouri & Protecție',
        href: '/tablouri-sigurante-engross/c',
        items: [
          { name: 'Tablouri & Siguranțe Automate', href: '/tablouri-sigurante-engross/c', badge: '100+ ARTICOLE' },
          { name: 'Instalații & Automatizări Industriale', href: '/instalatii-automatizari-engross/c', badge: '70+ ARTICOLE' },
          { name: 'Prize, Întrerupătoare & Smart Home', href: '/prize-intrerupatoare-engross/c' },
        ],
      },
      {
        title: 'Iluminat Profesional & Solare',
        href: '/lampi-solare/c',
        items: [
          { name: 'Lămpi Solare LED Stradale & Grădină', href: '/lampi-solare/c', badge: '200+ MODELE' },
          { name: 'Corpuri & Surse Iluminat LED', href: '/corpuri-iluminat-engross/c' },
        ],
      },
    ],
  },
];
