/* One visible demonstration; automatic rotation uses one playback per clip. */
(() => {
  const carousel = document.querySelector('[data-home-carousel]');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.home-demo-slide')];
  const topics = carousel.querySelector('.home-demo-topics');
  const controls = carousel.querySelector('.home-demo-controls');
  const rotation = carousel.querySelector('.home-demo-rotation');
  const position = carousel.querySelector('.home-demo-position');
  const progress = carousel.querySelector('.home-demo-progress span');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = slides.map((slide, index) => {
    const caption = slide.querySelector('figcaption').textContent;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = slide.dataset.topic || caption;
    button.id = `home-demo-topic-${index}`;
    slide.id = `home-demo-slide-${index}`;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${slides.length}: ${caption}`);
    button.setAttribute('aria-controls', slide.id);
    button.addEventListener('click', () => select(index, true));
    button.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % slides.length;
      if (event.key === 'ArrowLeft') target = (index - 1 + slides.length) % slides.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = slides.length - 1;
      if (target === undefined) return;
      event.preventDefault();
      buttons[target].focus();
      select(target, true);
    });
    topics.append(button);
    return button;
  });

  let index = 0;
  let rotating = !reducedMotion.matches;
  let visible = false;
  let hovering = false;
  let elapsed = 0;
  let lastFrame = 0;
  let resumeVideo = !reducedMotion.matches;
  let suspended = false;
  const activeVideo = () => slides[index].querySelector('video');
  const play = video => {
    if (video && visible && !document.hidden) video.play().catch(() => {});
  };

  function updateControls() {
    rotation.textContent = rotating ? 'Pause Rotation' : 'Resume Rotation';
    position.textContent = `${index + 1} / ${slides.length}`;
    position.setAttribute('aria-live', rotating ? 'off' : 'polite');
  }

  function select(next, userInitiated = false) {
    slides.forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (video) {
        video.pause();
        if (i === next) video.currentTime = 0;
      }
      slide.hidden = i !== next;
      buttons[i].setAttribute('aria-pressed', String(i === next));
    });
    index = next;
    elapsed = 0;
    progress.style.width = '0%';
    resumeVideo = userInitiated || !reducedMotion.matches;
    updateControls();
    if (resumeVideo) play(activeVideo());
  }

  rotation.addEventListener('click', () => {
    rotating = !rotating;
    updateControls();
    if (rotating) {
      resumeVideo = true;
      play(activeVideo());
    }
  });
  carousel.querySelector('.home-demo-previous').addEventListener('click', () => select((index - 1 + slides.length) % slides.length, true));
  carousel.querySelector('.home-demo-next').addEventListener('click', () => select((index + 1) % slides.length, true));
  carousel.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovering = true; });
  carousel.addEventListener('pointerleave', () => { hovering = false; });
  carousel.addEventListener('focusin', event => {
    // Readers using controls keep their place until they explicitly resume.
    if (event.target !== rotation) {
      rotating = false;
      updateControls();
    }
  });

  function suspend() {
    if (suspended) return;
    suspended = true;
    const video = activeVideo();
    if (video) {
      resumeVideo = !video.paused;
      video.pause();
    }
  }
  new IntersectionObserver(entries => {
    const nextVisible = entries[0].intersectionRatio >= 0.2;
    if (visible && !nextVisible) suspend();
    visible = nextVisible;
    if (visible && !document.hidden) {
      suspended = false;
      if (resumeVideo) play(activeVideo());
    }
  }, {threshold: 0.2}).observe(carousel.querySelector('.home-demo-stage'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspend();
    else if (visible) {
      suspended = false;
      if (resumeVideo) play(activeVideo());
    }
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      rotating = false;
      resumeVideo = false;
      activeVideo()?.pause();
      updateControls();
    }
  });

  function tick(now) {
    const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.25) : 0;
    lastFrame = now;
    const video = activeVideo();
    const duration = video && Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 12;
    const dwell = duration;
    const playing = !video || (!video.paused && !video.seeking && video.readyState >= 3);
    if (rotating && visible && !document.hidden && !hovering && !document.fullscreenElement && playing) {
      elapsed += delta;
      progress.style.width = `${Math.min(100, elapsed / dwell * 100)}%`;
      if (elapsed >= dwell) select((index + 1) % slides.length);
    }
    requestAnimationFrame(tick);
  }

  carousel.classList.add('is-enhanced');
  topics.hidden = false;
  controls.hidden = false;
  select(0);
  requestAnimationFrame(tick);
})();
