// Native details elements remain usable without JavaScript. Only play demos
// while their theme is open and their card is visible.
document.addEventListener('DOMContentLoaded', () => {
  const themes = [...document.querySelectorAll('.research-theme')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new WeakSet();

  function update(video) {
    if (video.closest('.research-theme').open && visible.has(video)
        && !document.hidden && !reducedMotion.matches) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) visible.add(target);
      else visible.delete(target);
      update(target);
    });
  }, { threshold: 0.15 });

  themes.forEach(theme => {
    const videos = [...theme.querySelectorAll('video')];
    theme.querySelector('.research-theme-count').textContent =
      `${theme.querySelectorAll('.sw-entry').length} Demos`;
    videos.forEach(video => observer.observe(video));
    theme.addEventListener('toggle', () => videos.forEach(update));
  });
  const updateAll = () => themes.forEach(theme => theme.querySelectorAll('video').forEach(update));
  document.addEventListener('visibilitychange', updateAll);
  reducedMotion.addEventListener('change', updateAll);
});
