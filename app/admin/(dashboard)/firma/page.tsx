import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import CompanySettingsForm from '@/components/admin/CompanySettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminCompanyPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/admin');
  }

  let settings = await prisma.marketplaceSettings.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    settings = await prisma.marketplaceSettings.create({
      data: {
        id: 'default',
        companyName: 'S.C. TOPinStock Marketplace S.R.L.',
        cui: 'RO48921450',
        regCom: 'J40/14280/2024',
        legalAddress: 'București, Sector 1, Calea Floreasca nr. 169, Etaj 4',
        capitalSocial: '50.000 LEI',
        iban: 'RO49BTRLRONCRT0123456701',
        bankName: 'Banca Transilvania',
        contactEmail: 'contact@topinstock.ro',
        supportPhone: '0720 123 456',
        defaultCommission: 0.12,
        payoutTermsDays: 14,
        returnPolicyDays: 14,
        orderMinimumAmount: 0,
      },
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs font-semibold text-gray-500 hover:text-blue-900 flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Înapoi la Dashboard</span>
            </Link>
            <span className="text-gray-300">•</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-800 border border-amber-300">
              Modul Super-Admin
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <span>Datele Firmei &amp; Setări Marketplace</span>
            <ShieldCheck size={26} className="text-amber-500" />
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configurează datele juridice și fiscale ale companiei mamă TOPinStock S.R.L., conturile bancare și politicile de comisionare pentru toți comercianții.
          </p>
        </div>
      </div>

      {/* ── Settings Form ── */}
      <CompanySettingsForm initialSettings={settings} />
    </div>
  );
}
