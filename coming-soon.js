// Missing publication resources remain clickable without navigating to #.
document.addEventListener('DOMContentLoaded', () => {
  const bubble = document.createElement('div');
  bubble.id = 'coming-soon-message';
  bubble.className = 'coming-soon-bubble';
  bubble.setAttribute('role', 'status');
  bubble.hidden = true;
  document.body.append(bubble);
  let active = null;
  function close() {
    if (active) active.removeAttribute('aria-describedby');
    active = null;
    bubble.hidden = true;
    bubble.textContent = '';
  }
  document.querySelectorAll('[data-coming-soon]').forEach(link => {
    link.setAttribute('role', 'button');
    link.addEventListener('click', event => {
      event.preventDefault();
      if (active === link) return close();
      close();
      active = link;
      link.setAttribute('aria-describedby', bubble.id);
      bubble.textContent = 'Coming soon';
      bubble.hidden = false;
      const r = link.getBoundingClientRect();
      const b = bubble.getBoundingClientRect();
      bubble.style.left = Math.max(8, Math.min(innerWidth - b.width - 8, r.left + (r.width-b.width)/2)) + 'px';
      bubble.style.top = (r.bottom + b.height + 12 < innerHeight ? r.bottom + 6 : Math.max(8, r.top - b.height - 6)) + 'px';
    });
    link.addEventListener('keydown', event => {
      if (event.key === ' ') { event.preventDefault(); link.click(); }
    });
    link.addEventListener('blur', close);
  });
  document.addEventListener('click', event => {
    if (active && !active.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  document.addEventListener('scroll', close, true);
  window.addEventListener('resize', close);
});
