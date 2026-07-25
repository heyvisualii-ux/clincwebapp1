import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    // Exchange the code for a session using the server-side admin client so we can
    // read the resulting user even without cookies being forwarded in this route.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      const provider = user.app_metadata?.provider ?? 'google';
      const email = user.email ?? null;

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('auth_providers')
        .eq('id', user.id)
        .maybeSingle();

      const currentProviders: string[] = existingProfile?.auth_providers ?? [];
      const updatedProviders = currentProviders.includes(provider)
        ? currentProviders
        : [...currentProviders, provider];

      await supabase.from('profiles').upsert(
        {
          id: user.id,
          email,
          auth_providers: updatedProviders,
          full_name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
        },
        { onConflict: 'id' },
      );
    }
  }

  // Redirect and let the client-side auth state pick up the session from the URL hash
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
