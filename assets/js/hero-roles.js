(() => {
  const el = document.querySelector('.hero-title-static.hero-role-dynamic');
  if (!el) return;

  const roles = ['SOC', 'NOC', 'Security'];
  let i = 0;

  let active = true;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    el.textContent = roles[0];
    return;
  }

  const type = (text, cb) => {
    let j = 0;
    el.textContent = '';
    const iv = setInterval(() => {
      el.textContent += text[j];
      j++;
      if (j >= text.length) { clearInterval(iv); cb(); }
    }, 80);
  };

  const del = (cb) => {
    let txt = el.textContent;
    const iv = setInterval(() => {
      txt = txt.slice(0, -1);
      el.textContent = txt;
      if (txt.length === 0) { clearInterval(iv); cb(); }
    }, 50);
  };

  const cycle = () => {
    if (!active) return;
    i = (i + 1) % roles.length;
    del(() => type(roles[i], () => setTimeout(cycle, 5000)));
  };

  el.textContent = roles[0];
  setTimeout(cycle, 2000);

  const stop = () => { active = false; };
  window.addEventListener('beforeunload', stop);
})();
