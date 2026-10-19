import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/health — Server & DB health check
export async function GET() {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      app: 'TOPinStock Marketplace',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        database: 'error',
        error: error instanceof Error ? error.message : 'Database ping failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
