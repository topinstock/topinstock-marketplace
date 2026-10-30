import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface QuoteRequestPayload {
  clubName: string;
  contactName: string;
  phone: string;
  email: string;
  model: string;
  color?: string;
  quantity: number;
  sizesNote?: string;
  customization: {
    crest: boolean;
    numbers: boolean;
    names: boolean;
    sponsor: boolean;
  };
  notes?: string;
}

export async function POST(req: Request) {
  try {
    const data: QuoteRequestPayload = await req.json();

    if (!data.clubName || !data.contactName || !data.phone || !data.email) {
      return NextResponse.json(
        { error: 'Te rugăm să completezi toate câmpurile de contact obligatorii.' },
        { status: 400 }
      );
    }

    if (!data.quantity || data.quantity < 8) {
      return NextResponse.json(
        { error: 'Comanda minimă pentru echipamente de club este de 8 seturi.' },
        { status: 400 }
      );
    }

    const record = {
      id: `REQ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...data,
    };

    // Save quotation to persistent leads log
    const leadsDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(leadsDir)) {
      fs.mkdirSync(leadsDir, { recursive: true });
    }
    const leadsFile = path.join(leadsDir, 'club_quote_requests.jsonl');
    fs.appendFileSync(leadsFile, JSON.stringify(record) + '\n', 'utf8');

    console.log(`[B2B JOMA LEAD] Ofertă nouă de club de la ${data.clubName} (${data.contactName}, ${data.phone}): ${data.quantity} buc model ${data.model}`);

    return NextResponse.json({
      success: true,
      requestId: record.id,
      message: 'Cererea ta a fost înregistrată cu succes! Te vom contacta în cel mai scurt timp cu oferta dedicată și simularea grafică gratuită.',
    });
  } catch (error: any) {
    console.error('Eroare la procesarea cererii de ofertă club:', error);
    return NextResponse.json(
      { error: 'A apărut o eroare internă. Te rugăm să ne contactezi telefonic sau prin WhatsApp.' },
      { status: 500 }
    );
  }
}

