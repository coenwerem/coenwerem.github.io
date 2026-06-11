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

// Load the navbar
document.addEventListener('DOMContentLoaded', function() {
  const pathArray = window.location.pathname.split('/').pop() || 'index.html'; // Get the current page name
  const projectsIndex = pathArray.indexOf('projects'); // Check if it's the "projects" page
  const pathToRoot = projectsIndex !== -1 ? '../' : './'; // Set the relative path based on whether it's the "projects" page or not

  // Fetch the navbar HTML file
  fetch(pathToRoot + 'navbar.html')
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

      // Determine the current page and set the active class
      const currentPage = pathArray; // Use the full current page name
      const navLinks = document.querySelectorAll('.navbar-nav .nav-item a');
      const navTabLinks = document.querySelectorAll('.nav .nav-tabs .nav-item a');
      
      // Iterate over each navbar link and add the active class to the current page
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.endsWith(currentPage)) {
          link.parentElement.classList.add('active'); // Add the active class to the parent <li> of the link
        } else {
          link.parentElement.classList.remove('active'); // Remove active class from other links
        }
      });

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
  const pathArray = window.location.pathname.split('/');
  const projectsIndex = pathArray.indexOf('projects');
  const pathToRoot = projectsIndex !== -1 ? '../' : './'; // Set relative path based on the current page

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

// Function to handle active state persistence
document.addEventListener('DOMContentLoaded', function () {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // Get current page filename
  const navItems = document.querySelectorAll('.navbar-nav .nav-item');

  // Set active class on initial load
  navItems.forEach(item => {
    const link = item.querySelector('a');
    if (link && link.getAttribute('href') && link.getAttribute('href') !== '#') { // Ignore links with '#' (e.g., dark mode toggle)
      const href = link.getAttribute('href').split('/').pop(); // Get just the filename from href
      if (href === currentPage) {
        item.classList.add('active'); // Mark current page item as active
      } else {
        item.classList.remove('active'); // Remove active class from other items
      }
    }
  });

  // Add event listener with passive option for the toggle button
  const toggleButton = document.querySelector('#toggleDropdown');
  if (toggleButton) {
    toggleButton.addEventListener('click', function (event) {
      requestAnimationFrame(() => {
        navItems.forEach(item => {
          const link = item.querySelector('a');
          if (link && link.getAttribute('href') && link.getAttribute('href') !== '#') {
            const href = link.getAttribute('href').split('/').pop();
            if (href === currentPage) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          }
        });
      });
    }, { passive: true });
  }
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

