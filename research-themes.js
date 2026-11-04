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

  function chooseDemo(card, key) {
    const select = card.querySelector('.research-demo-select');
    if (key && [...select.options].some(option => option.value === key)) {
      select.value = key;
    }
    const option = select.selectedOptions[0];
    const video = card.querySelector('video');
    const rate = Number(option.dataset.playbackRate || 1);
    if (video.getAttribute('src') !== option.dataset.demoSource) {
      video.pause();
      video.src = option.dataset.demoSource;
      video.poster = option.dataset.demoPoster;
      video.dataset.playbackRate = String(rate);
      video.defaultPlaybackRate = rate;
      video.playbackRate = rate;
      video.load();
    }
    video.setAttribute('aria-label', option.textContent.trim());
    card.querySelector('.sw-video').style.backgroundImage =
      'url("' + option.dataset.demoPoster + '")';
    card.querySelector('.research-demo-description').textContent =
      option.dataset.demoDescription;
    const links = card.querySelector('.sw-links');
    const link = links.querySelector('a');
    links.hidden = !option.dataset.demoHref;
    if (!links.hidden) {
      link.href = option.dataset.demoHref;
      link.querySelector('span').textContent = option.dataset.demoLinkLabel;
    }
    update(video);
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
    const cards = [...theme.querySelectorAll('.sw-entry')];
    const demoCount = cards.reduce((total, card) =>
      total + (card.querySelectorAll('.research-demo-select option').length || 1), 0);
    theme.querySelector('.research-theme-count').textContent = demoCount + ' Demos';
    theme.querySelectorAll('[data-demo-picker]').forEach(card => {
      const select = card.querySelector('.research-demo-select');
      select.addEventListener('change', () => chooseDemo(card));
    });
    videos.forEach(video => observer.observe(video));
    theme.addEventListener('toggle', () => videos.forEach(update));
  });

  // Existing demo anchors also select the appropriate clip in a grouped card.
  const openLinkedTheme = () => {
    const target = document.getElementById(location.hash.slice(1));
    const theme = target?.closest('.research-theme');
    if (!theme) return;
    theme.open = true;
    const card = target.closest('[data-demo-picker]');
    if (card && target.dataset.demoTarget) {
      chooseDemo(card, target.dataset.demoTarget);
      requestAnimationFrame(() => card.scrollIntoView({ block: 'start' }));
    }
  };
  openLinkedTheme();
  window.addEventListener('hashchange', openLinkedTheme);
  const updateAll = () => themes.forEach(theme =>
    theme.querySelectorAll('video').forEach(update));
  document.addEventListener('visibilitychange', updateAll);
  reducedMotion.addEventListener('change', updateAll);
});
