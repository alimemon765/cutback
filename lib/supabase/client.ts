import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // #region agent log
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const urlTrimmed = supabaseUrl?.trim();
  const keyTrimmed = supabaseAnonKey?.trim();
  const envCheck = {
    urlDefined: !!supabaseUrl,
    urlLength: supabaseUrl?.length || 0,
    urlLengthTrimmed: urlTrimmed?.length || 0,
    urlPrefix: supabaseUrl?.substring(0, 40) || 'undefined',
    urlHasSpaces: supabaseUrl?.includes(' ') || false,
    urlStartsWith: supabaseUrl?.startsWith('https://') || false,
    keyDefined: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
    keyLengthTrimmed: keyTrimmed?.length || 0,
    keyPrefix: supabaseAnonKey?.substring(0, 50) || 'undefined',
    keySuffix: supabaseAnonKey?.substring(Math.max(0, (supabaseAnonKey?.length || 0) - 20)) || 'undefined',
    keyHasSpaces: supabaseAnonKey?.includes(' ') || false,
    keyStartsWithEyJ: supabaseAnonKey?.startsWith('eyJ') || false,
    keyHasQuotes: (supabaseAnonKey?.startsWith('"') && supabaseAnonKey?.endsWith('"')) || (supabaseAnonKey?.startsWith("'") && supabaseAnonKey?.endsWith("'")) || false,
  };
  console.log('🔍 [ENV CHECK] Detailed environment variables:', envCheck);
  fetch('http://127.0.0.1:7242/ingest/63acc359-d200-4cf4-abe5-60688b560998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/client.ts:7',message:'Detailed env vars check',data:envCheck,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [ENV CHECK] Missing environment variables!', {
      urlDefined: !!supabaseUrl,
      keyDefined: !!supabaseAnonKey,
    });
  }
  
  // Use trimmed values to handle any whitespace issues
  const finalUrl = urlTrimmed || supabaseUrl!;
  const finalKey = keyTrimmed || supabaseAnonKey!;
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/63acc359-d200-4cf4-abe5-60688b560998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/client.ts:30',message:'Using final values',data:{finalUrlLength:finalUrl.length,finalKeyLength:finalKey.length,finalUrlPrefix:finalUrl.substring(0,40),finalKeyPrefix:finalKey.substring(0,50)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  return createBrowserClient(
    finalUrl,
    finalKey
  );
}

