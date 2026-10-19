import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acces interzis. Rolul de administrator este necesar.' },
        { status: 403 }
      );
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

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Fetch company settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Eroare la încărcarea setărilor firmei.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acces interzis. Rolul de administrator este necesar.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      companyName,
      cui,
      regCom,
      legalAddress,
      capitalSocial,
      iban,
      bankName,
      contactEmail,
      supportPhone,
      defaultCommission,
      payoutTermsDays,
      returnPolicyDays,
      orderMinimumAmount,
      platformNotice,
    } = body;

    const updated = await prisma.marketplaceSettings.upsert({
      where: { id: 'default' },
      update: {
        companyName: companyName?.trim() || 'S.C. TOPinStock Marketplace S.R.L.',
        cui: cui?.trim() || 'RO48921450',
        regCom: regCom?.trim() || 'J40/14280/2024',
        legalAddress: legalAddress?.trim() || 'București, Sector 1, Calea Floreasca nr. 169',
        capitalSocial: capitalSocial?.trim() || '50.000 LEI',
        iban: iban?.trim() || 'RO49BTRLRONCRT0123456701',
        bankName: bankName?.trim() || 'Banca Transilvania',
        contactEmail: contactEmail?.trim() || 'contact@topinstock.ro',
        supportPhone: supportPhone?.trim() || '0720 123 456',
        defaultCommission: defaultCommission !== undefined ? parseFloat(defaultCommission) : 0.12,
        payoutTermsDays: payoutTermsDays !== undefined ? parseInt(payoutTermsDays, 10) : 14,
        returnPolicyDays: returnPolicyDays !== undefined ? parseInt(returnPolicyDays, 10) : 14,
        orderMinimumAmount: orderMinimumAmount !== undefined ? parseFloat(orderMinimumAmount) : 0,
        platformNotice: platformNotice?.trim() || null,
      },
      create: {
        id: 'default',
        companyName: companyName?.trim() || 'S.C. TOPinStock Marketplace S.R.L.',
        cui: cui?.trim() || 'RO48921450',
        regCom: regCom?.trim() || 'J40/14280/2024',
        legalAddress: legalAddress?.trim() || 'București, Sector 1, Calea Floreasca nr. 169',
        capitalSocial: capitalSocial?.trim() || '50.000 LEI',
        iban: iban?.trim() || 'RO49BTRLRONCRT0123456701',
        bankName: bankName?.trim() || 'Banca Transilvania',
        contactEmail: contactEmail?.trim() || 'contact@topinstock.ro',
        supportPhone: supportPhone?.trim() || '0720 123 456',
        defaultCommission: defaultCommission !== undefined ? parseFloat(defaultCommission) : 0.12,
        payoutTermsDays: payoutTermsDays !== undefined ? parseInt(payoutTermsDays, 10) : 14,
        returnPolicyDays: returnPolicyDays !== undefined ? parseInt(returnPolicyDays, 10) : 14,
        orderMinimumAmount: orderMinimumAmount !== undefined ? parseFloat(orderMinimumAmount) : 0,
        platformNotice: platformNotice?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Detaliile firmei și setările platformei au fost salvate cu succes.',
      settings: updated,
    });
  } catch (error) {
    console.error('Update company settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Eroare la salvarea setărilor firmei.' },
      { status: 500 }
    );
  }
}
