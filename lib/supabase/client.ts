import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // #region agent log
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const envCheck = {
    urlDefined: !!supabaseUrl,
    urlLength: supabaseUrl?.length || 0,
    urlPrefix: supabaseUrl?.substring(0, 30) || 'undefined',
    keyDefined: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
    keyPrefix: supabaseAnonKey?.substring(0, 30) || 'undefined',
  };
  console.log('🔍 [ENV CHECK] Environment variables:', envCheck);
  fetch('http://127.0.0.1:7242/ingest/63acc359-d200-4cf4-abe5-60688b560998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/client.ts:7',message:'Env vars check',data:envCheck,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [ENV CHECK] Missing environment variables!', {
      urlDefined: !!supabaseUrl,
      keyDefined: !!supabaseAnonKey,
    });
  }
  
  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  );
}

