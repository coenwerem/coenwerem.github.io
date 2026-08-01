$(document).ready(function () {
  // Theme toggle
  var $toggle = $('#theme-toggle');
  var $icon = $toggle.find('i');
  var stored = localStorage.getItem('gdf-theme');
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    $icon.removeClass('fa-moon').addClass('fa-sun');
  }
  $toggle.click(function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      $icon.removeClass('fa-sun').addClass('fa-moon');
      localStorage.setItem('gdf-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      $icon.removeClass('fa-moon').addClass('fa-sun');
      localStorage.setItem('gdf-theme', 'dark');
    }
  });

  // Click-to-enlarge lightbox for demo videos and .zoomable media
  var $overlay = $('<div class="lightbox-overlay"><button class="lightbox-close" aria-label="Close">&times;</button><div class="lightbox-content"></div></div>');
  $('body').append($overlay);
  var $content = $overlay.find('.lightbox-content');

  function closeLightbox() {
    $overlay.removeClass('is-open');
    $content.empty();
  }

  $('.hw-vid, .zoomable').css('cursor', 'zoom-in').on('click', function () {
    var $el = $(this);
    var $node;
    if ($el.is('video')) {
      var src = $el.find('source').attr('src') || $el.attr('src');
      $node = $('<video autoplay loop muted playsinline controls></video>')
        .append($('<source>').attr('src', src).attr('type', 'video/mp4'));
    } else {
      $node = $('<img>').attr('src', $el.attr('src')).attr('alt', $el.attr('alt') || '');
    }
    $content.empty().append($node);
    $overlay.addClass('is-open');
  });

  $overlay.on('click', function (e) {
    if (e.target === this || $(e.target).hasClass('lightbox-close') || $(e.target).hasClass('lightbox-content')) {
      closeLightbox();
    }
  });
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  if (typeof bulmaSlider !== 'undefined') bulmaSlider.attach();

  // Main-site navbar. Fetch the shared fragment and rewrite its relative
  // links to the site root so the same link bank serves every project page.
  fetch('../navbar.html')
    .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
    .then(function (html) {
      var holder = document.getElementById('navbar-placeholder');
      if (!holder) return;
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      // No Bootstrap on this page, so the collapse toggler goes and the
      // link list stays visible at every width.
      var toggler = tmp.querySelector('.navbar-toggler');
      if (toggler) toggler.remove();
      var collapse = tmp.querySelector('.navbar-collapse');
      if (collapse) collapse.classList.remove('collapse');
      // This page has its own floating theme toggle. Drop the navbar's.
      var themeItem = tmp.querySelector('#toggleDropdown');
      if (themeItem) themeItem.remove();
      tmp.querySelectorAll('a').forEach(function (a) {
        var href = a.getAttribute('href');
        if (href && !/^(https?:|mailto:|#|\/)/.test(href)) {
          a.setAttribute('href', '../' + href);
        }
      });
      holder.innerHTML = tmp.innerHTML;
    })
    .catch(function () {
      // Opened without the parent site (local file preview). Skip the navbar.
    });
});
