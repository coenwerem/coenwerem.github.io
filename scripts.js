// Function to apply the correct theme based on the user's preference or system setting
function applyTheme(theme) {
  // Remove both dark and light mode classes to prevent conflicts
  document.body.classList.remove('dark-mode', 'light-mode');
  
  if (theme) {
    document.body.classList.add(theme);
  } else {
    document.body.classList.add('light-mode'); // Default to light mode if no theme is set
  }
}

// Function to toggle between light and dark modes
function toggleDarkMode() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  if (isDarkMode) {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light-mode'); // Save light mode preference
  } else {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark-mode'); // Save dark mode preference
  }
}

// Initialize theme based on user's saved preference or system setting
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme'); // Check if user has saved their theme preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // Check user's system theme preference
  
  if (savedTheme) {
    applyTheme(savedTheme); // Apply saved theme
  } else {
    // If no saved theme, apply the system default (dark if the system prefers it)
    applyTheme(prefersDark ? 'dark-mode' : 'light-mode');
  }
});

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
      // console.log('Current Page: ', currentPage);
      // console.log('Nav Links: ', Array.from(navLinks));

      // Iterate over each navbar link and add the active class to the current page
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.endsWith(currentPage)) {
          link.parentElement.classList.add('active'); // Add the active class to the parent <li> of the link
        } else {
          link.parentElement.classList.remove('active'); // Remove active class from other links
        }
      });
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
