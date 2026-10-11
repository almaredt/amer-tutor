// Math / science symbol keys for answer boxes.
// MathKeys.attach(textarea, subject) adds a row of symbol buttons above the box
// and converts typed shortcuts as you go (x^2 → x², sqrt → √, >= → ≥, H2O → H₂O …).
// Answers stay plain Unicode text, so saving, marking and Claude all work unchanged.
(function () {
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', x: 'ˣ', y: 'ʸ' };
  const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎' };
  const SUB2SUP = {}; Object.keys(SUB).forEach((k) => { if (SUP[k]) SUB2SUP[SUB[k]] = SUP[k]; });
  const SUPCHARS = new Set(Object.values(SUP)), SUBCHARS = new Set(Object.values(SUB));

  // [symbol, tooltip]
  const KEYS = {
    Math: [['√', 'square root'], ['∛', 'cube root'], ['²', 'squared'], ['³', 'cubed'], ['ⁿ', 'power n'], ['⁻¹', 'power −1'], ['π', 'pi'], ['×', 'times'], ['÷', 'divide'], ['±', 'plus or minus'], ['≠', 'not equal'], ['≤', 'less or equal'], ['≥', 'greater or equal'], ['≈', 'approximately'], ['∞', 'infinity'], ['°', 'degrees'], ['θ', 'theta'], ['½', 'half'], ['∴', 'therefore']],
    Physics: [['Δ', 'change in (delta)'], ['θ', 'theta'], ['λ', 'lambda (wavelength)'], ['μ', 'mu (micro)'], ['Ω', 'ohm'], ['°', 'degrees'], ['×', 'times'], ['²', 'squared'], ['³', 'cubed'], ['⁻¹', 'per (power −1)'], ['⁻²', 'power −2'], ['√', 'square root'], ['≈', 'approximately'], ['∝', 'proportional to'], ['→', 'arrow'], ['±', 'plus or minus'], ['·', 'dot (units)']],
    Chemistry: [['₂', 'subscript 2'], ['₃', 'subscript 3'], ['₄', 'subscript 4'], ['⁺', 'charge +'], ['⁻', 'charge −'], ['²⁺', 'charge 2+'], ['²⁻', 'charge 2−'], ['³⁺', 'charge 3+'], ['→', 'reaction arrow'], ['⇌', 'reversible'], ['Δ', 'heat / change'], ['°', 'degrees'], ['×', 'times'], ['±', 'plus or minus'], ['≈', 'approximately']],
  };
  KEYS.Mixed = []; ['Math', 'Physics', 'Chemistry'].forEach((s) => KEYS[s].forEach((k) => { if (!KEYS.Mixed.some((m) => m[0] === k[0])) KEYS.Mixed.push(k); }));

  const HINT = {
    base: [['x^2', 'x²'], ['x^-1', 'x⁻¹'], ['v_1', 'v₁'], ['sqrt', '√'], ['pi', 'π'], ['>=', '≥'], ['<=', '≤'], ['!=', '≠'], ['+-', '±'], ['->', '→'], ['~=', '≈']],
    Physics: [['Delta', 'Δ'], ['theta', 'θ'], ['lambda', 'λ']],
    Chemistry: [['H2O', 'H₂O'], ['Ca2+', 'Ca²⁺'], ['<=>', '⇌']],
  };
  // what the button shows when the symbol alone is too small to read
  const LABEL = { '²': 'x²', '³': 'x³', 'ⁿ': 'xⁿ', '⁻¹': 'x⁻¹', '⁻²': 'x⁻²', '₂': 'X₂', '₃': 'X₃', '₄': 'X₄', '⁺': 'X⁺', '⁻': 'X⁻', '²⁺': 'X²⁺', '²⁻': 'X²⁻', '³⁺': 'X³⁺' };

  // replaced as soon as the last character is typed
  const NOW = [['<=>', '⇌'], ['≤>', '⇌'], ['>=', '≥'], ['<=', '≤'], ['!=', '≠'], ['+-', '±'], ['->', '→'], ['~=', '≈'], ['sqrt', '√'], ['cbrt', '∛']];
  // whole words, replaced once the next (non-letter) character is typed
  const WORDS = { pi: 'π', theta: 'θ', lambda: 'λ', Delta: 'Δ' };

  const LS = 'mathkeys-auto';
  function autoOn() { try { return localStorage.getItem(LS) !== '0'; } catch (e) { return true; } }
  function setAuto(v) { try { localStorage.setItem(LS, v ? '1' : '0'); } catch (e) { /* ignore */ } }

  // Replace the `back` characters before the caret with `text`, keeping undo where the browser allows it.
  function put(ta, text, back) {
    const end = ta.selectionEnd, start = back ? end - back : ta.selectionStart;
    ta.setSelectionRange(start, end);
    let ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
    if (!ok || ta.value.slice(start, start + text.length) !== text) {
      ta.setRangeText(text, start, end, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function attach(ta, subject) {
    if (!ta || ta.readOnly || ta.dataset.mk) return;
    const set = KEYS[subject] ? subject : (subject === 'English' ? null : 'Mixed');
    if (!set) return;
    ta.dataset.mk = '1';
    const chem = subject === 'Chemistry';

    const bar = document.createElement('div'); bar.className = 'mkbar';
    bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Insert symbol');
    bar.innerHTML = KEYS[set].map(([s, t]) => `<button type="button" class="mk" data-s="${s}" title="${t}" aria-label="${t}">${LABEL[s] || s}</button>`).join('')
      + `<label class="mkauto" title="Turn typed shortcuts on or off"><input type="checkbox" ${autoOn() ? 'checked' : ''}> auto</label>`
      + '<button type="button" class="mkhelp" aria-expanded="false">shortcuts</button>';
    const hint = document.createElement('div'); hint.className = 'mkhint'; hint.hidden = true;
    const pairs = HINT.base.concat(HINT[subject] || (set === 'Mixed' ? HINT.Physics : []));
    hint.innerHTML = '<span>Type these and they change by themselves:</span>'
      + pairs.map(([a, b]) => `<span class="mkpair"><code>${a.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code> becomes <b>${b}</b></span>`).join('');
    ta.before(bar); ta.after(hint);

    bar.addEventListener('mousedown', (e) => { if (e.target.closest('.mk')) e.preventDefault(); }); // keep the caret in the box
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('.mk');
      if (b) { ta.focus(); put(ta, b.dataset.s, 0); return; }
      const h = e.target.closest('.mkhelp');
      if (h) { hint.hidden = !hint.hidden; h.setAttribute('aria-expanded', String(!hint.hidden)); }
    });
    const cb = bar.querySelector('.mkauto input');
    cb.onchange = () => setAuto(cb.checked);

    let busy = false, mode = null; // mode: 'sup' or 'sub' while typing after ^ or _
    ta.addEventListener('input', (e) => {
      if (busy) return;
      if (!cb.checked || e.inputType !== 'insertText' || !e.data || ta.selectionStart !== ta.selectionEnd) { mode = null; return; }
      const before = ta.value.slice(0, ta.selectionStart), ch = e.data.slice(-1), prev = before.slice(-2, -1);
      const rep = (text, back) => { busy = true; try { put(ta, text, back); } finally { busy = false; } };

      // ^ and _ : superscript / subscript run
      if (prev === '^' && SUP[ch]) { mode = 'sup'; return rep(SUP[ch], 2); }
      if (prev === '_' && SUB[ch]) { mode = 'sub'; return rep(SUB[ch], 2); }
      if (mode === 'sup' && SUPCHARS.has(prev) && /[0-9]/.test(ch)) return rep(SUP[ch], 1);
      if (mode === 'sub' && SUBCHARS.has(prev) && /[0-9]/.test(ch)) return rep(SUB[ch], 1);
      mode = null;

      for (const [k, v] of NOW) if (before.endsWith(k)) return rep(v, k.length);

      const w = before.match(/(^|[^A-Za-z])([A-Za-z]+)([^A-Za-z])$/);
      if (w && WORDS[w[2]]) return rep(WORDS[w[2]] + w[3], w[2].length + 1);

      if (chem) {
        // H2O → H₂O (digit right after a letter or closing bracket)
        if (/[0-9]/.test(ch) && /[A-Za-z)\]₀-₉]/.test(prev)) {
          if (/[₀-₉]/.test(prev) && !/[A-Za-z)\]]/.test(before.slice(-3, -2)) && !/[₀-₉]/.test(before.slice(-3, -2))) return;
          return rep(SUB[ch], 1);
        }
        // Ca₂+ → Ca²⁺ , O₂- → O²⁻ (a charge typed straight after the number)
        if ((ch === '+' || ch === '-') && /[₀-₉]/.test(prev)) {
          let i = before.length - 2; while (i > 0 && /[₀-₉]/.test(before[i - 1])) i--;
          const digits = before.slice(i, before.length - 1);
          return rep([...digits].map((d) => SUB2SUP[d]).join('') + SUP[ch], digits.length + 1);
        }
      }
    });
  }

  window.MathKeys = { attach };
})();
