// Function to apply the correct theme based on the user's preference or system setting
// function applyTheme(theme) {
//   // Remove both dark and light mode classes to prevent conflicts
//   document.body.classList.remove('dark-mode', 'light-mode');
  
//   if (theme) {
//     document.body.classList.add(theme);
//   } else {
//     document.body.classList.add('light-mode'); // Default to light mode if no theme is set
//   }
// }
// Function to apply the correct theme based on the user's preference or system setting
function applyTheme(theme) {
  var t = theme || 'light-mode';
  document.documentElement.classList.remove('dark-mode', 'light-mode');
  document.body.classList.remove('dark-mode', 'light-mode');
  document.documentElement.classList.add(t);
  document.body.classList.add(t);
  updateThemeToggle();
}


function updateThemeToggle() {
  const button = document.getElementById('themeToggle');
  if (!button) return;
  const isDark = document.documentElement.classList.contains('dark-mode');
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  button.setAttribute('aria-pressed', String(isDark));
  button.setAttribute('aria-label', label);
  button.title = label;
}

// Function to toggle between light and dark modes
function toggleDarkMode() {
  var isDark = document.body.classList.contains('dark-mode');
  var next = isDark ? 'light-mode' : 'dark-mode';
  applyTheme(next);
  localStorage.setItem('theme', next);
}

// Initialize theme based on user's saved preference or system setting
// document.addEventListener('DOMContentLoaded', () => {
//   const savedTheme = localStorage.getItem('theme'); // Check if user has saved their theme preference
//   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // Check user's system theme preference
  
//   if (savedTheme) {
//     applyTheme(savedTheme); // Apply saved theme
//   } else {
//     // If no saved theme, apply the system default (dark if the system prefers it)
//     applyTheme(prefersDark ? 'dark-mode' : 'light-mode');
//   }
// });
// Initialize theme based on user's saved preference or system setting
// document.addEventListener('DOMContentLoaded', () => {
//   const savedTheme = localStorage.getItem('theme'); // Check if user has saved their theme preference
//   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // Check user's system theme preference

//   // Apply the theme as soon as possible
//   if (savedTheme) {
//     applyTheme(savedTheme); // Apply saved theme
//   } else {
//     // If no saved theme, apply the system default (dark if the system prefers it)
//     applyTheme(prefersDark ? 'dark-mode' : 'light-mode');
//   }

//   // Once the theme is applied, make the page visible
//   document.body.style.visibility = 'visible';
// });
(function() {
  var t = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark-mode' : 'light-mode');
  document.documentElement.classList.add(t);
  document.body.classList.add(t);
  document.body.style.visibility = 'visible';
})();

// Handle system theme change
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const newTheme = e.matches ? 'dark-mode' : 'light-mode';
  const savedTheme = localStorage.getItem('theme'); // Only override if no saved preference
  if (!savedTheme) {
    applyTheme(newTheme);
  }
});

// Function to reveal extra bio
function revealExtraBio() {
  var x = document.getElementById("extraBio");
  if (x.style.display === "none") {
      x.style.display = "block";
  } else {
      x.style.display = "none";
  }
}

function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

// Path from the current page to the site root. Top-level pages use './'.
// Project subpages one directory down (e.g. /gdf/) declare their own root by
// setting window.SITE_ROOT = '../' before this script loads. Deriving depth
// from location.pathname breaks when the site is served from a subdirectory
// of the server root, so the page declares it instead.
function siteRoot() {
  return window.SITE_ROOT || './';
}

// Load the navbar
document.addEventListener('DOMContentLoaded', function() {
  const pathToRoot = siteRoot();
  // On project subpages no top-level nav item is the current page
  const pathArray = pathToRoot === './' ? (window.location.pathname.split('/').pop() || 'index.html') : null;

  // Fetch the navbar HTML file
  fetch(pathToRoot + 'navbar.html?v=20260913-interests')
    .then(response => response.text())
    .then(data => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data; // Insert the navbar HTML into a temporary div

      // Update the href links to ensure they are correct relative paths
      const links = tempDiv.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          link.href = pathToRoot + href;
        }
      });

      // Insert the updated navbar into the placeholder
      document.getElementById('navbar-placeholder').innerHTML = tempDiv.innerHTML;
      document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);
      updateThemeToggle();

      // Determine the current page and set the active class
      const currentPage = pathArray === 'resume.html' ? 'cv.html' : pathArray;
      const navLinks = document.querySelectorAll('.navbar-nav .nav-item a');
      const navTabLinks = document.querySelectorAll('.nav .nav-tabs .nav-item a');
      
      const more = document.querySelector('.nav-more');
      const moreToggle = document.getElementById('moreToggle');
      const moreMenu = document.getElementById('moreMenu');
      function closeMore() {
        moreToggle.setAttribute('aria-expanded', 'false');
        moreMenu.hidden = true;
      }
      moreToggle.addEventListener('click', () => {
        const expanded = moreToggle.getAttribute('aria-expanded') === 'true';
        moreToggle.setAttribute('aria-expanded', String(!expanded));
        moreMenu.hidden = expanded;
      });
      document.addEventListener('click', event => {
        if (!more.contains(event.target)) closeMore();
      });
      more.addEventListener('focusout', event => {
        if (!more.contains(event.relatedTarget)) closeMore();
      });
      more.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          closeMore();
          moreToggle.focus();
          event.preventDefault();
        }
      });
      moreMenu.addEventListener('click', event => {
        if (event.target.closest('a')) closeMore();
      });
      // Match section links separately so only the selected destination is current.
      function updateNavCurrent() {
        navLinks.forEach(link => {
          const url = new URL(link.href);
          const samePage = currentPage && url.pathname.split('/').pop() === currentPage;
          const active = samePage && (!url.hash || url.hash === window.location.hash);
          link.parentElement.classList.toggle('active', Boolean(active));
          if (active) link.setAttribute('aria-current', url.hash ? 'location' : 'page');
          else link.removeAttribute('aria-current');
        });
        more.classList.toggle('active', ['teaching.html', 'peer-review.html', 'outside-robotics.html', 'more.html'].includes(currentPage));
      }
      updateNavCurrent();
      window.addEventListener('hashchange', updateNavCurrent);

      // Get the current tab from the URL fragment (only present on pages with nav-tabs)
      const activeTabEl = document.querySelector('.nav-tabs .nav-link.active');
      if (activeTabEl) {
        const currentTab = activeTabEl.getAttribute('href').replace('#', '');
        navTabLinks.forEach(tabLink => {
          const tabId = tabLink.getAttribute('href').replace('#', '');
          if (tabId === currentTab) {
            tabLink.classList.add('active');
            tabLink.setAttribute('aria-selected', 'true');
          } else {
            tabLink.classList.remove('active');
            tabLink.setAttribute('aria-selected', 'false');
          }
        });
      }
    })
    .catch(error => console.error('Error loading navbar:', error));
});

// Load the footer
document.addEventListener('DOMContentLoaded', function() {
  const pathToRoot = siteRoot();

  // Fetch and load the footer HTML
  fetch(pathToRoot + 'footer.html')
    .then(response => response.text())
    .then(data => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data;

      // Update all relative links to use the correct root path
      const links = tempDiv.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          link.href = pathToRoot + href;
        }
      });

      // Insert the loaded footer into the placeholder element
      document.getElementById('footer-placeholder').innerHTML = tempDiv.innerHTML;
    })
    .catch(error => console.error('Error loading footer:', error));
});

// Click-to-enlarge lightbox for demo media (ported from the EquiDexFlow project page).
// Targets the demo gifs/videos in research/software cards (.sw-video img), the index
// research row (.embed-responsive-item), and anything explicitly tagged .zoomable / .hw-vid.
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><div class="lightbox-content"></div>';
  document.body.appendChild(overlay);
  var content = overlay.querySelector('.lightbox-content');

  function closeLightbox() {
    overlay.classList.remove('is-open');
    content.innerHTML = '';
  }

  var media = document.querySelectorAll('.hw-vid, .zoomable, .sw-video img, .embed-responsive-item');
  media.forEach(function (el) {
    el.style.cursor = 'zoom-in';

    // Per-clip cue: a small expand badge in the corner so users see it's expandable.
    var container = el.parentElement;
    if (container && !container.querySelector('.zoom-cue')) {
      if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
      }
      var cue = document.createElement('span');
      cue.className = 'zoom-cue';
      cue.setAttribute('aria-hidden', 'true');
      cue.innerHTML = '<i class="fas fa-expand"></i>';
      container.appendChild(cue);
    }

    el.addEventListener('click', function () {
      var node;
      if (el.tagName.toLowerCase() === 'video') {
        var source = el.querySelector('source');
        var src = (source && source.getAttribute('src')) || el.getAttribute('src');
        node = document.createElement('video');
        node.autoplay = true;
        node.loop = true;
        node.muted = true;
        node.controls = true;
        node.setAttribute('playsinline', '');
        var s = document.createElement('source');
        s.setAttribute('src', src);
        s.setAttribute('type', 'video/mp4');
        node.appendChild(s);
      } else {
        node = document.createElement('img');
        node.setAttribute('src', el.getAttribute('src'));
        node.setAttribute('alt', el.getAttribute('alt') || '');
      }
      content.innerHTML = '';
      content.appendChild(node);
      overlay.classList.add('is-open');
    });
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.classList.contains('lightbox-close') || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
});


// Assemble the email destination only when the contact link is activated.
document.addEventListener('DOMContentLoaded', () => {
  const emailLink = document.getElementById('contact-email');
  if (emailLink) emailLink.addEventListener('click', event => {
    event.preventDefault();
    window.location.href = ['mailto:', 'enwerem', '@', 'umd', '.', 'edu'].join('');
  });
});
