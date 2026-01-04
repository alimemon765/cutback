import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return safe debug info (don't expose full keys)
  return NextResponse.json({
    urlDefined: !!supabaseUrl,
    urlLength: supabaseUrl?.length || 0,
    urlPrefix: supabaseUrl?.substring(0, 30) || 'undefined',
    urlSuffix: supabaseUrl?.substring(Math.max(0, (supabaseUrl?.length || 0) - 10)) || 'undefined',
    keyDefined: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
    keyPrefix: supabaseAnonKey?.substring(0, 30) || 'undefined',
    nodeEnv: process.env.NODE_ENV,
  });
}

