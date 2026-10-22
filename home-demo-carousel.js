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
  let elapsed = 0;
  let lastFrame = 0;
  let resumeVideo = !reducedMotion.matches;
  let suspended = false;
  const activeVideo = () => slides[index].querySelector('video');
  const play = video => {
    if (video && visible && !document.hidden) video.play().catch(() => {});
  };

  const chapterIndex = new WeakMap();
  const chapterButtons = slide => [...slide.querySelectorAll('[data-demo-source]')];

  const currentChapter = slide => chapterButtons(slide)[chapterIndex.get(slide) || 0];
  const chapterStart = slide => Number(currentChapter(slide)?.dataset.demoStart || 0);
  const chapterEnd = slide => Number(currentChapter(slide)?.dataset.demoEnd || Infinity);

  function selectChapter(slide, next, shouldPlay = true) {
    const chapters = chapterButtons(slide);
    const chapter = chapters[next];
    if (!chapter) return;
    const video = slide.querySelector('video');
    chapterIndex.set(slide, next);
    chapters.forEach((button, i) => button.setAttribute('aria-pressed', String(i === next)));
    video.pause();
    if (video.getAttribute('src') !== chapter.dataset.demoSource) {
      video.src = chapter.dataset.demoSource;
      if (chapter.dataset.demoPoster) video.poster = chapter.dataset.demoPoster;
      video.load();
    }
    const seekToStart = () => { video.currentTime = chapterStart(slide); };
    if (video.readyState >= 1) seekToStart();
    else video.addEventListener('loadedmetadata', seekToStart, {once: true});
    video.loop = !rotating && !Number.isFinite(chapterEnd(slide));
    video.setAttribute('aria-label', chapter.textContent.trim());
    video.dispatchEvent(new Event('timeupdate'));
    if (shouldPlay) {
      resumeVideo = true;
      play(video);
    }
  }

  function updateControls() {
    const video = activeVideo();
    if (video) video.loop = !rotating && !Number.isFinite(chapterEnd(slides[index]));
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
    selectChapter(slides[index], 0, false);
    elapsed = 0;
    progress.style.width = '0%';
    resumeVideo = userInitiated || rotating || !reducedMotion.matches;
    updateControls();
    if (resumeVideo) play(activeVideo());
  }

  rotation.addEventListener('click', () => {
    const video = activeVideo();
    const wasEnded = video?.ended;
    rotating = !rotating;
    updateControls();
    if (rotating) {
      resumeVideo = true;
      if (activeVideo()?.ended) advanceAfterVideo();
      else play(activeVideo());
    } else if (wasEnded) {
      resumeVideo = true;
      video.currentTime = 0;
      play(video);
    }
  });
  carousel.querySelector('.home-demo-previous').addEventListener('click', () => select((index - 1 + slides.length) % slides.length, true));
  carousel.querySelector('.home-demo-next').addEventListener('click', () => select((index + 1) % slides.length, true));
  carousel.addEventListener('focusin', event => {
    // Keyboard users keep their place; pointer selection leaves rotation running.
    if (event.target !== rotation && event.target.matches(':focus-visible')) {
      rotating = false;
      updateControls();
    }
  });

  function advanceAfterVideo() {
    const slide = slides[index];
    const video = activeVideo();
    if (!video) return;
    const bounded = Number.isFinite(chapterEnd(slide));
    const finished = video.ended || (bounded && video.currentTime >= chapterEnd(slide));
    if (!finished) return;
    if (bounded && !rotating) {
      const playing = !video.paused || video.ended;
      video.currentTime = chapterStart(slide);
      if (playing) play(video);
      return;
    }
    if (rotating && visible && !document.hidden && (!document.fullscreenElement || bounded)) {
      const nextChapter = (chapterIndex.get(slide) || 0) + 1;
      if (nextChapter < chapterButtons(slide).length) selectChapter(slide, nextChapter);
      else select((index + 1) % slides.length);
    }
  }
  slides.forEach(slide => {
    const video = slide.querySelector('video');
    if (!video) return;
    const chapters = chapterButtons(slide);
    if (chapters.length) {
      chapterIndex.set(slide, 0);
      slide.querySelector('.home-demo-chapters').hidden = false;
      chapters.forEach((button, i) => button.addEventListener('click', () => selectChapter(slide, i)));
    }
    video.addEventListener('seeked', () => {
      const matching = chapters.findIndex(chapter =>
        chapter.dataset.demoSource === video.getAttribute('src') && chapter.dataset.demoEnd &&
        video.currentTime >= Number(chapter.dataset.demoStart || 0) &&
        video.currentTime < Number(chapter.dataset.demoEnd));
      if (matching < 0) return;
      chapterIndex.set(slide, matching);
      chapters.forEach((button, i) => button.setAttribute('aria-pressed', String(i === matching)));
    });
    const captions = [...slide.querySelectorAll('[data-demo-caption-start]')];
    const syncCaption = () => captions.forEach(caption => {
      const start = Number(caption.dataset.demoCaptionStart);
      const end = Number(caption.dataset.demoCaptionEnd ?? Infinity);
      const wrongChapter = caption.dataset.demoChapter !== undefined &&
        Number(caption.dataset.demoChapter) !== (chapterIndex.get(slide) || 0);
      caption.hidden = wrongChapter || video.currentTime < start || video.currentTime >= end;
    });
    if (captions.length) {
      ['timeupdate', 'seeking', 'seeked', 'loadedmetadata'].forEach(event => {
        video.addEventListener(event, syncCaption);
      });
      syncCaption();
    }
    video.loop = false;
    video.addEventListener('ended', () => {
      if (video === activeVideo()) advanceAfterVideo();
    });
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
    if (video) {
      // Follow media time, including buffering, native pause, seeking and playback speed.
      const start = chapterStart(slides[index]);
      const duration = Math.min(chapterEnd(slides[index]), video.duration) - start;
      const fraction = Number.isFinite(duration) && duration > 0 ?
        Math.max(0, Math.min(1, (video.currentTime - start) / duration)) : 0;
      const chapters = chapterButtons(slides[index]);
      const currentChapter = chapterIndex.get(slides[index]) || 0;
      const durations = chapters.map(chapter => Number(chapter.dataset.demoDuration));
      const total = durations.reduce((sum, duration) => sum + duration, 0);
      const chapterProgress = total > 0 ?
        (durations.slice(0, currentChapter).reduce((sum, duration) => sum + duration, 0) +
         fraction * durations[currentChapter]) / total : fraction;
      progress.style.width = `${Math.min(100, chapterProgress * 100)}%`;
      advanceAfterVideo();
    } else if (rotating && visible && !document.hidden && !document.fullscreenElement) {
      // The draft preview also contains a GIF with no media timeline.
      elapsed += delta;
      progress.style.width = `${Math.min(100, elapsed / 12 * 100)}%`;
      if (elapsed >= 12) select((index + 1) % slides.length);
    }
    requestAnimationFrame(tick);
  }

  carousel.classList.add('is-enhanced');
  topics.hidden = false;
  controls.hidden = false;
  select(0);
  // A direct preview/project link can open this chapter without adding a topic tab.
  if (location.hash === '#task-wrench-demo') {
    const target = document.getElementById('task-wrench-demo');
    const slide = target?.closest('.home-demo-slide');
    if (slide) {
      select(slides.indexOf(slide), true);
      selectChapter(slide, Number(target.dataset.demoStartChapter));
      const reveal = () => requestAnimationFrame(() => carousel.scrollIntoView({block: 'start'}));
      if (document.readyState === 'complete') reveal();
      else window.addEventListener('load', reveal, {once: true});
    }
  }
  requestAnimationFrame(tick);
})();
