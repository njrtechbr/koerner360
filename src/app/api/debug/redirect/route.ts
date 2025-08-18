import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[Debug Redirect API] Redirecionando para /login');
  return NextResponse.redirect(new URL('/login', 'http://localhost:3000'));
}