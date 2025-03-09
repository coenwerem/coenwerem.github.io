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
  const pathArray = window.location.pathname.split('/');
  const projectsIndex = pathArray.indexOf('projects');
  const pathToRoot = projectsIndex !== -1 ? '../' : './';
  fetch(pathToRoot + 'navbar.html')
      .then(response => response.text())
      .then(data => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = data;
          const links = tempDiv.querySelectorAll('a');
          links.forEach(link => {
              const href = link.getAttribute('href');
              if (href && !href.startsWith('http') && !href.startsWith('#')) {
                  link.href = pathToRoot + href;
              }
          });
          document.getElementById('navbar-placeholder').innerHTML = tempDiv.innerHTML;
          const currentPage = pathArray[pathArray.length - 1];
          const navLinks = document.querySelectorAll('.nav-link');
          navLinks.forEach(link => {
              if (link.getAttribute('href').endsWith(currentPage)) {
                  link.parentElement.classList.add('active');
              }
          });
      })
      .catch(error => console.error('Error loading navbar:', error));
});

// Load the footer
document.addEventListener('DOMContentLoaded', function() {
  const pathArray = window.location.pathname.split('/');
  const projectsIndex = pathArray.indexOf('projects');
  const pathToRoot = projectsIndex !== -1 ? '../' : './';
  fetch(pathToRoot + 'footer.html')
      .then(response => response.text())
      .then(data => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = data;
          const links = tempDiv.querySelectorAll('a');
          links.forEach(link => {
              const href = link.getAttribute('href');
              if (href && !href.startsWith('http') && !href.startsWith('#')) {
                  link.href = pathToRoot + href;
              }
          });
          document.getElementById('footer-placeholder').innerHTML = tempDiv.innerHTML;
      })
      .catch(error => console.error('Error loading footer:', error));
});

// Function to handle active state persistence
document.addEventListener('DOMContentLoaded', function () {
  // Set the active class to the current page item on load
  const currentPage = window.location.pathname; // Get the current page URL
  const navItems = document.querySelectorAll('.navbar-nav .nav-item');

  navItems.forEach(item => {
    const link = item.querySelector('a');
    if (link && link.href.includes(currentPage)) {
      item.classList.add('active'); // Mark the current page as active
    } else {
      item.classList.remove('active'); // Remove active class from other items
    }
  });

  // Ensure the toggle button (if clicked) does not interfere with active class on other items
  document.querySelector('#toggleDropdown').addEventListener('click', function (event) {
    // Prevent the toggle button from causing issues with the active state of other items
    setTimeout(() => {
      const currentPage = window.location.pathname;
      navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link && link.href.includes(currentPage)) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }, 50); // Delay to allow the toggle button to finish its action
  });
});
