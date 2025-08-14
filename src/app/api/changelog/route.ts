import { NextResponse } from 'next/server';
import { getChangelogData } from '@/lib/changelog-parser';

export async function GET() {
  try {
    const changelogData = getChangelogData();
    
    return NextResponse.json({
      success: true,
      data: changelogData,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar dados do changelog:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        data: []
      },
      { status: 500 }
    );
  }
}