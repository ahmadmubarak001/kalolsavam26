/* Optional Supabase cloud adapter for GitHub Pages. */
(() => {
  const cfg = window.KALOLSAVAM_SUPABASE_CONFIG || {};
  let client = null;
  const ready = Boolean(cfg.url && cfg.anonKey && window.supabase?.createClient);
  if (ready) client = window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  const api = {
    ready,
    client,
    async session() { if (!client) return null; const { data, error } = await client.auth.getSession(); if (error) throw error; return data.session; },
    async signIn(email, password) { if (!client) throw new Error('Cloud is not configured. See SUPABASE-SETUP.md.'); const { data, error } = await client.auth.signInWithPassword({ email, password }); if (error) throw error; if (data.user?.app_metadata?.role !== 'admin') { await client.auth.signOut(); throw new Error('This account is not authorised as a Kalolsavam administrator.'); } return data; },
    async signOut() { if (client) { const { error } = await client.auth.signOut(); if (error) throw error; } },
    async load(isAdmin = false) {
      if (!client) return null;
      const [ev, rs, st] = await Promise.all([
        client.from('kalolsavam_events').select('*').order('date', { ascending: true }),
        client.from('kalolsavam_results').select('*').order('place', { ascending: true }),
        client.from('kalolsavam_settings').select('site').eq('id', 1).maybeSingle()
      ]);
      for (const r of [ev, rs, st]) if (r.error) throw r.error;
      return {
        events: (ev.data || []).map(({ id, name, category, date, time, venue, status, icon }) => ({ id, name, category, date, time, venue, status, icon })),
        results: (rs.data || []).map(({ id, name, event_id, class_name, place, score, published }) => ({ id, name, eventId: event_id, className: class_name, place, score, published })),
        site: st.data?.site || null
      };
    },
    async save(state) {
      if (!client) return;
      const ev = state.events.map(e => ({ id: String(e.id), name: e.name, category: e.category, date: e.date || null, time: e.time || '', venue: e.venue || '', status: e.status || 'upcoming', icon: e.icon || '' }));
      const rs = state.results.map(r => ({ id: String(r.id), name: r.name, event_id: String(r.eventId), class_name: r.className || '', place: Number(r.place) || 0, score: r.score === '' || r.score == null ? null : Number(r.score), published: Boolean(r.published) }));
      // RLS restricts these writes to authenticated administrators.
      const delR = await client.from('kalolsavam_results').delete().not('id', 'is', null); if (delR.error) throw delR.error;
      const delE = await client.from('kalolsavam_events').delete().not('id', 'is', null); if (delE.error) throw delE.error;
      if (ev.length) { const x = await client.from('kalolsavam_events').insert(ev); if (x.error) throw x.error; }
      if (rs.length) { const x = await client.from('kalolsavam_results').insert(rs); if (x.error) throw x.error; }
      const setting = await client.from('kalolsavam_settings').upsert({ id: 1, site: state.site || {} }); if (setting.error) throw setting.error;
    },
    async subscribe(onChange) {
      if (!client) return null;
      return client.channel('kalolsavam-live-results').on('postgres_changes', { event: '*', schema: 'public', table: 'kalolsavam_events' }, onChange).on('postgres_changes', { event: '*', schema: 'public', table: 'kalolsavam_results' }, onChange).on('postgres_changes', { event: '*', schema: 'public', table: 'kalolsavam_settings' }, onChange).subscribe();
    }
  };
  window.KalolsavamCloud = api;
})();
