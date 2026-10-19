import Link from 'next/link';
import {
  HelpCircle,
  Truck,
  RotateCcw,
  CreditCard,
  ShoppingBag,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const metadata = {
  title: 'Centru de Ajutor & Asistență | TOPinStock',
  description: 'Găsește răspunsuri rapide la întrebări despre comenzi, livrare, retururi și plăți pe TOPinStock România.',
};

const FAQ_ITEMS = [
  {
    q: 'Care este valoarea minimă a unei comenzi pe TOPinStock?',
    a: 'Comanda minimă pentru expediere pe TOPinStock este de 50 LEI (valoarea produselor din coș). Pentru comenzi sub 50 LEI, vă rugăm să mai adăugați produse în coș pentru a putea finaliza comanda.',
  },
  {
    q: 'Cât durează livrarea comenzii?',
    a: 'Comenzile plasate pe TOPinStock sunt livrate în termen de 2-3 zile lucrătoare oriunde în România prin partenerii noștri de curierat rapid (DPD, Fan Courier).',
  },
  {
    q: 'Cum funcționează garanția produselor?',
    a: 'Garanția este oferită de către furnizor și se găsește la ei pe website.',
  },
  {
    q: 'Cum pot returna un produs?',
    a: 'Ai la dispoziție 30 de zile calendaristice de la primirea coletului pentru a solicita returul. Produsul trebuie să fie în starea inițială, cu accesoriile și ambalajul original.',
  },
  {
    q: 'Ce opțiuni de plată am?',
    a: 'Poți alege plata Ramburs la livrare (numerar direct la curier) sau plata online securizată cu Cardul Bancar (Visa, Mastercard) prin sistemul securizat 3D Secure.',
  },
  {
    q: 'Cum pot urmări statusul comenzii mele?',
    a: 'Imediat ce comanda este expediată, vei primi un SMS și un email cu numărul de AWB pentru urmărire live. De asemenea, poți vizualiza statusul în secțiunea "Contul meu" -> "Comenzile mele".',
  },
  {
    q: 'Ce fac dacă produsul primit este deteriorat sau defect?',
    a: 'Dacă ai primit un produs neconform, te rugăm să ne contactezi în termen de 48 de ore pe contact@topinstock.ro. Înlocuirea sau rambursarea contravalorii se face fără costuri suplimentare.',
  },
];

export default function AjutorPage() {
  return (
    <div className="min-h-screen bg-gray-50/60 py-12">
      <div className="container-app max-w-5xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Centru de Asistență</span>
        </nav>

        {/* Hero Banner */}
        <div
          className="rounded-3xl p-8 sm:p-12 text-white mb-12 shadow-lg text-center"
          style={{
            background: 'linear-gradient(135deg, #008fa8 0%, #006b80 100%)',
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto mb-4 backdrop-blur-xs">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">
            Cum te putem ajuta astăzi?
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Răspunsuri la cele mai frecvente întrebări despre comenzi, livrare, garanție și retururi.
          </p>
        </div>

        {/* Quick Links Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {[
            {
              title: 'Cum cumpăr?',
              desc: 'Ghid pas cu pas pentru plasarea unei comenzi',
              href: '/ajutor/cum-cumpar',
              icon: ShoppingBag,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              title: 'Livrare & Curierat',
              desc: 'Termene de livrare, tarife și parteneri AWB',
              href: '/ajutor/livrare',
              icon: Truck,
              color: 'text-emerald-600 bg-emerald-50',
            },
            {
              title: 'Politica de Retur',
              desc: 'Condiții de returnare în 30 de zile și rambursare',
              href: '/ajutor/returnuri',
              icon: RotateCcw,
              color: 'text-amber-600 bg-amber-50',
            },
            {
              title: 'Metode de Plată',
              desc: 'Plată ramburs la livrare și card securizat',
              href: '/ajutor/plata',
              icon: CreditCard,
              color: 'text-rose-600 bg-rose-50',
            },
          ].map((topic, i) => {
            const Icon = topic.icon;
            return (
              <Link
                key={i}
                href={topic.href}
                className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${topic.color} flex items-center justify-center font-bold mb-3`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-900 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {topic.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-blue-700 mt-4 group-hover:translate-x-1 transition-transform">
                  <span>Află mai multe</span>
                  <ChevronRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">
            Întrebări Frecvente (FAQ)
          </h2>
          <div className="divide-y divide-gray-100">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="py-5">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                  {item.q}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Box */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Phone size={22} />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Telefon Suport</span>
                <span className="font-bold text-gray-900 text-sm sm:text-base">0371 900 123</span>
                <span className="text-xs text-gray-500 block">Luni - Vineri: 09:00 - 18:00</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Asistență Email</span>
                <span className="font-bold text-gray-900 text-sm sm:text-base">contact@topinstock.ro</span>
                <span className="text-xs text-gray-500 block">Răspundem în max. 2 ore</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Program Depozit</span>
                <span className="font-bold text-gray-900 text-sm sm:text-base">Procesare 24/7</span>
                <span className="text-xs text-gray-500 block">Expedieri zilnice la curier</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
