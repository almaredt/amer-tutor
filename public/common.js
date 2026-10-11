// Shared helpers for the student and admin pages.
async function api(path, body, method) {
  const opts = { method: method || (body === undefined ? 'GET' : 'POST'), headers: { 'X-Requested-With': 'fetch' }, credentials: 'same-origin' };
  if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let res;
  try { res = await fetch(path, opts); } catch (e) { throw Object.assign(new Error('No connection to the server. Check the internet and try again.'), { status: 0 }); }
  let data = {};
  try { data = await res.json(); } catch (e) { /* empty body */ }
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong.'), { status: res.status });
  return data;
}
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function $(id) { return document.getElementById(id); }
function fmtDate(iso) { return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
let toastT;
function toast(m) { const e = $('toast'); if (!e) return; e.textContent = m; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { e.hidden = true; }, 2200); }

function renderLogin(root, onDone, adminPage) {
  root.innerHTML = `<form class="login" id="loginForm">
    <div class="label">${adminPage ? 'Admin' : 'Grade 9 MYP study'}</div>
    <h1>${adminPage ? 'Tutor admin' : 'Log in to study'}</h1>
    <label class="field"><span>Username</span><input id="lu" autocomplete="username" required></label>
    <label class="field"><span>Password</span><input id="lp" type="password" autocomplete="current-password" required></label>
    <div class="err" id="lerr"></div>
    <button class="btn primary" type="submit">Log in</button>
  </form>`;
  $('loginForm').onsubmit = async (e) => {
    e.preventDefault(); $('lerr').textContent = '';
    try { const r = await api('/api/login', { username: $('lu').value, password: $('lp').value }); onDone(r); }
    catch (err) { $('lerr').textContent = err.message; }
  };
}
async function logout() { try { await api('/api/logout', {}); } catch (e) { /* ignore */ } location.reload(); }
