// Answers are written mostly in one position; spread them with a fixed (id-based) shuffle so the right
// option is not always in the same place, and stays put between restarts.
function mix(id, options, answer) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const order = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = (h >>> 16) % (i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  return { options: order.map((k) => options[k]), answer: order.indexOf(answer) };
}

module.exports = { mix };
