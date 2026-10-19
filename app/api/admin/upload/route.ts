import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'VENDOR')) {
      return NextResponse.json(
        { success: false, error: 'Neautorizat.' },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Niciun fișier încărcat.' },
        { status: 400 }
      );
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Format fișier nepermis. Doar imagini JPG, PNG, WEBP.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = path.extname(file.name) || '.jpg';
    const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFilename = `${cleanName}-${Date.now().toString().slice(-6)}${ext}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const { mkdir } = await import('fs/promises');
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, uniqueFilename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: 'A apărut o eroare la salvarea fișierului.' },
      { status: 500 }
    );
  }
}
