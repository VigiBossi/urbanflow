/* =====================================================================
   STORE — accounts (name only), per-user progress, offline queue, sync.

   Everything is saved locally first (localStorage), then sent to Supabase.
   If the network is down, changes wait in a queue and are sent later.
   If APP_CONFIG has no Supabase URL/key, the app runs in "local demo mode"
   (everything stays in this browser).
   ===================================================================== */
(function (root) {
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const emptyData = () => ({ progress: {}, mistakes: [], exams: [], cards: {} });

  const Store = {
    configured: false,
    client: null,
    session: null,          // { id, name }
    data: emptyData(),
    queue: [],
    status: 'idle',         // idle | syncing | offline | error | local
    statusMsg: '',
    listeners: [],

    init() {
      const cfg = root.APP_CONFIG || {};
      this.configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && !/YOUR-PROJECT|PASTE/i.test(cfg.SUPABASE_URL + cfg.SUPABASE_ANON_KEY) && root.supabase);
      this.session = LS.get('dbt.session', null);
      if (this.session) this._loadLocal();
      this._makeClient();
      root.addEventListener && root.addEventListener('online', () => this.flush());
      setInterval(() => { if (this.queue.length) this.flush(); }, 30000);
      if (this.session) this.refresh();
      this._setStatus(this.configured ? 'idle' : 'local');
    },
    onChange(fn) { this.listeners.push(fn); },
    /** called when fresh data arrived from the server (e.g. first login on a new device) */
    onData(fn) { (this.dataListeners = this.dataListeners || []).push(fn); },
    _emit() { this.listeners.forEach(f => { try { f(this); } catch (e) { console.error(e); } }); },
    _setStatus(s, msg) { this.status = s; this.statusMsg = msg || ''; this._emit(); },
    _makeClient() {
      if (!this.configured) { this.client = null; return; }
      const cfg = root.APP_CONFIG;
      const headers = this.session ? { 'x-user-id': this.session.id } : {};
      this.client = root.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { headers }
      });
    },
    _key(k) { return `dbt.${k}.${this.session.id}`; },
    _loadLocal() { this.data = Object.assign(emptyData(), LS.get(this._key('data'), {})); this.queue = LS.get(this._key('queue'), []); },
    _saveLocal() { if (!this.session) return; LS.set(this._key('data'), this.data); LS.set(this._key('queue'), this.queue); },

    // ---------------- ACCOUNTS ----------------
    cleanName(n) { return String(n || '').trim().replace(/\s+/g, ' '); },
    validName(n) {
      if (n.length < 2) return 'Please type at least 2 characters.';
      if (n.length > 30) return 'Please use at most 30 characters.';
      if (!/^[\p{L}\p{N} ._'-]+$/u.test(n)) return 'Use letters, numbers, spaces, dots, dashes or apostrophes only.';
      return null;
    },
    async _findUser(name) {
      if (!this.configured) {
        const users = LS.get('dbt.localUsers', []);
        return users.find(u => u.name.toLowerCase() === name.toLowerCase()) || null;
      }
      const pattern = name.replace(/[\\%_]/g, m => '\\' + m);
      const { data, error } = await this.client.from('users').select('id,name').ilike('name', pattern).limit(1);
      if (error) throw new Error(this._netMsg(error));
      return data && data[0] || null;
    },
    /** returns {ok:true} or {ok:false, reason:'taken'|'invalid'|'error', message} */
    async signUp(raw) {
      const name = this.cleanName(raw);
      const v = this.validName(name); if (v) return { ok: false, reason: 'invalid', message: v };
      try {
        const existing = await this._findUser(name);
        if (existing) return { ok: false, reason: 'taken', message: 'This name is already used, try another', existing };
        let user;
        if (!this.configured) {
          user = { id: (crypto.randomUUID ? crypto.randomUUID() : 'u' + Date.now() + Math.random().toString(16).slice(2)), name };
          const users = LS.get('dbt.localUsers', []); users.push(user); LS.set('dbt.localUsers', users);
        } else {
          const { data, error } = await this.client.from('users').insert({ name }).select('id,name').single();
          if (error) {
            if (error.code === '23505') return { ok: false, reason: 'taken', message: 'This name is already used, try another' };
            throw new Error(this._netMsg(error));
          }
          user = data;
        }
        this._startSession(user);
        return { ok: true, user };
      } catch (e) { return { ok: false, reason: 'error', message: e.message }; }
    },
    async logIn(raw) {
      const name = this.cleanName(raw);
      if (!name) return { ok: false, reason: 'invalid', message: 'Please type your name.' };
      try {
        const user = await this._findUser(name);
        if (!user) return { ok: false, reason: 'notfound', message: `No account called "${name}" yet. Do you want to sign up with this name?` };
        this._startSession(user);
        return { ok: true, user };
      } catch (e) {
        // offline: allow known users of this device
        const known = LS.get('dbt.knownUsers', []).find(u => u.name.toLowerCase() === name.toLowerCase());
        if (known) { this._startSession(known); return { ok: true, user: known, offline: true }; }
        return { ok: false, reason: 'error', message: e.message };
      }
    },
    _startSession(user) {
      this.session = { id: user.id, name: user.name };
      LS.set('dbt.session', this.session);
      const known = LS.get('dbt.knownUsers', []).filter(u => u.id !== user.id); known.push(this.session); LS.set('dbt.knownUsers', known);
      this._loadLocal();
      this._makeClient();
      this.refresh();
      this._emit();
    },
    logOut() {
      this._saveLocal();
      this.session = null; this.data = emptyData(); this.queue = [];
      LS.del('dbt.session');
      this._makeClient();
      this._emit();
    },
    knownUsers() { return LS.get('dbt.knownUsers', []); },

    // ---------------- READ ----------------
    getProgress(id) { return this.data.progress[id] || null; },
    isSolved(id) { const p = this.data.progress[id]; return !!p && (p.status === 'solved' || p.status === 'done'); },
    get(id, field) { const p = this.data.progress[id]; return p ? p[field] : undefined; },

    // ---------------- WRITE (local first, then queue) ----------------
    setProgress(itemId, patch) {
      if (!this.session) return;
      const old = this.data.progress[itemId] || { status: null, score: null, attempts: 0 };
      const row = { ...old, ...patch, updated_at: new Date().toISOString() };
      this.data.progress[itemId] = row;
      this._enqueue({ t: 'upsert', table: 'progress', key: 'progress:' + itemId, row: { user_id: this.session.id, item_id: itemId, status: row.status, score: row.score == null ? null : Math.round(row.score), attempts: row.attempts || 0, updated_at: row.updated_at } });
    },
    recordAttempt(itemId, correct, score) {
      const old = this.getProgress(itemId) || { attempts: 0 };
      const wasSolved = old.status === 'solved';
      this.setProgress(itemId, { status: correct || wasSolved ? 'solved' : 'attempted', attempts: (old.attempts || 0) + 1, score: Math.max(old.score || 0, score == null ? (correct ? 100 : 0) : score) });
      this.touchStreak();
    },
    addMistake(category, itemId) {
      if (!this.session || !category) return;
      const row = { category, item_id: itemId, created_at: new Date().toISOString() };
      this.data.mistakes.push(row);
      this._enqueue({ t: 'insert', table: 'mistakes', row: { user_id: this.session.id, ...row } });
    },
    addExam(score, max, breakdown) {
      if (!this.session) return;
      const row = { score: Math.round(score), max_score: Math.round(max), breakdown, taken_at: new Date().toISOString() };
      this.data.exams.push(row);
      this._enqueue({ t: 'insert', table: 'exam_results', row: { user_id: this.session.id, ...row } });
      this.touchStreak();
    },
    setCard(cardId, st) {
      if (!this.session) return;
      this.data.cards[cardId] = st;
      this._enqueue({ t: 'upsert', table: 'flashcards', key: 'card:' + cardId, row: { user_id: this.session.id, card_id: cardId, due_at: st.due_at, interval_days: st.interval_days, ease: st.ease } });
    },
    setLastPlace(route, title) { if (this.session) this.setProgress('meta:last', { status: route, score: null, attempts: 0, title }); },
    touchStreak() {
      const p = this.getProgress('meta:streak');
      const t = today();
      if (p && p.status === t) return;
      const y = new Date(); y.setDate(y.getDate() - 1);
      const ys = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
      const streak = p && p.status === ys ? (p.score || 0) + 1 : 1;
      this.setProgress('meta:streak', { status: t, score: streak, attempts: 0 });
    },
    currentStreak() {
      const p = this.getProgress('meta:streak'); if (!p) return 0;
      const y = new Date(); y.setDate(y.getDate() - 1);
      const ys = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
      return (p.status === today() || p.status === ys) ? (p.score || 0) : 0;
    },
    setLeaderboardVisible(v) { this.setProgress('meta:leaderboard', { status: v ? 'visible' : 'hidden', score: null, attempts: 0 }); },
    leaderboardVisible() { const p = this.getProgress('meta:leaderboard'); return !p || p.status !== 'hidden'; },

    _enqueue(op) {
      if (op.key) this.queue = this.queue.filter(o => o.key !== op.key); // keep only the newest version of a row
      this.queue.push(op);
      this._saveLocal();
      this._emit();
      clearTimeout(this._ft); this._ft = setTimeout(() => this.flush(), 400);
    },

    // ---------------- SYNC ----------------
    _netMsg(error) {
      const m = (error && (error.message || error.toString())) || 'Unknown error';
      if (/fetch|network|Failed to fetch|NetworkError|Load failed/i.test(m)) return 'You seem to be offline. Please check your internet connection.';
      return m;
    },
    async flush() {
      if (!this.session) return;
      if (!this.configured) { this.queue = []; this._saveLocal(); this._setStatus('local'); return; }
      if (this._flushing) return;
      if (!this.queue.length) { if (this.status !== 'error') this._setStatus('idle'); return; }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) { this._setStatus('offline'); return; }
      this._flushing = true; this._setStatus('syncing');
      try {
        while (this.queue.length) {
          const op = this.queue[0];
          let res;
          if (op.t === 'upsert') res = await this.client.from(op.table).upsert(op.row, { onConflict: op.table === 'progress' ? 'user_id,item_id' : 'user_id,card_id' });
          else res = await this.client.from(op.table).insert(op.row);
          if (res.error) {
            const msg = this._netMsg(res.error);
            this._setStatus(/offline/i.test(msg) ? 'offline' : 'error', msg);
            return;
          }
          this.queue.shift(); this._saveLocal();
        }
        this._setStatus('idle');
      } catch (e) {
        this._setStatus('offline', this._netMsg(e));
      } finally { this._flushing = false; }
    },
    /** Send pending changes, then download everything for this user from the server. */
    async refresh() {
      if (!this.session || !this.configured) return;
      await this.flush();
      if (this.queue.length) return; // still offline: keep local copy
      try {
        const id = this.session.id, c = this.client;
        const [p, m, e, f] = await Promise.all([
          c.from('progress').select('*').eq('user_id', id),
          c.from('mistakes').select('category,item_id,created_at').eq('user_id', id).order('created_at'),
          c.from('exam_results').select('score,max_score,breakdown,taken_at').eq('user_id', id).order('taken_at'),
          c.from('flashcards').select('card_id,due_at,interval_days,ease').eq('user_id', id)
        ]);
        const err = p.error || m.error || e.error || f.error;
        if (err) { this._setStatus('error', this._netMsg(err)); return; }
        const progress = {};
        p.data.forEach(r => { progress[r.item_id] = { status: r.status, score: r.score, attempts: r.attempts, updated_at: r.updated_at }; });
        // keep local-only fields such as titles
        for (const k in progress) if (this.data.progress[k] && this.data.progress[k].title) progress[k].title = this.data.progress[k].title;
        const cards = {};
        f.data.forEach(r => { cards[r.card_id] = { due_at: r.due_at, interval_days: r.interval_days, ease: r.ease }; });
        if (this.queue.length) return; // something changed while downloading — next refresh will catch up
        const changed = JSON.stringify(this.data.progress) !== JSON.stringify(progress) || this.data.exams.length !== e.data.length || this.data.mistakes.length !== m.data.length || Object.keys(this.data.cards).length !== f.data.length;
        this.data = { progress, mistakes: m.data, exams: e.data, cards };
        this._saveLocal();
        if (changed) (this.dataListeners || []).forEach(fn => { try { fn(); } catch (er) { console.error(er); } });
        this._setStatus('idle');
      } catch (err) { this._setStatus('offline', this._netMsg(err)); }
    },

    // ---------------- LEADERBOARD ----------------
    async leaderboard() {
      if (!this.configured) {
        // local demo: everybody who used this browser
        return LS.get('dbt.localUsers', []).map(u => {
          const d = Object.assign(emptyData(), LS.get(`dbt.data.${u.id}`, {}));
          const hidden = d.progress['meta:leaderboard'] && d.progress['meta:leaderboard'].status === 'hidden';
          if (hidden) return null;
          const lessons = Object.entries(d.progress).filter(([k, v]) => k.startsWith('lesson:') && v.status === 'done').length;
          const best = d.exams.reduce((b, x) => Math.max(b, Math.round(100 * x.score / (x.max_score || 1))), 0);
          const s = d.progress['meta:streak'];
          return { name: u.name, lessons_completed: lessons, best_exam_pct: d.exams.length ? best : null, current_streak: s ? s.score : 0 };
        }).filter(Boolean);
      }
      const { data, error } = await this.client.from('leaderboard').select('name,lessons_completed,best_exam_pct,current_streak');
      if (error) throw new Error(this._netMsg(error));
      return data;
    }
  };

  root.Store = Store;
  root.LS = LS;
})(typeof window !== 'undefined' ? window : globalThis);
