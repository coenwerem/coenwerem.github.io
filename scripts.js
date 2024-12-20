function revealExtraBio() {
  var x = document.getElementById("extraBio");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
};

// Theme storage utilities
const themeStorage = {
  isLocal: window.location.protocol === 'file:',
  
  // Get theme preference
  get: function() {
      try {
          if (this.isLocal) {
              return document.cookie.split('; ')
                  .find(row => row.startsWith('theme='))
                  ?.split('=')[1] || null;
          }
          return localStorage.getItem('theme');
      } catch (e) {
          console.warn('Storage access failed:', e);
          return null;
      }
  },
  
  // Set theme preference
  set: function(theme) {
      try {
          if (this.isLocal) {
              document.cookie = `theme=${theme};path=/;max-age=31536000`;
          } else {
              localStorage.setItem('theme', theme);
          }
      } catch (e) {
          console.warn('Storage access failed:', e);
      }
  }
};

// Get preferred theme
function getPreferredTheme() {
  const savedTheme = themeStorage.get();
  if (savedTheme) {
      return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Toggle theme
function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  document.body.classList.toggle('dark-mode', newTheme === 'dark');
  themeStorage.set(newTheme);
}

// Initialize theme
document.addEventListener('DOMContentLoaded', () => {
  const theme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.toggle('dark-mode', theme === 'dark');
});

/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
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
  // Get the current path and calculate depth
  const pathArray = window.location.pathname.split('/');
  const projectsIndex = pathArray.indexOf('projects');
  
  // Calculate path to root based on depth
  const pathToRoot = projectsIndex !== -1 ? '../' : './';
  
  // Fetch navbar from correct location
  fetch(pathToRoot + 'navbar.html')
      .then(response => response.text())
      .then(data => {
          // Create temporary container
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = data;
          
          // Update all nav links with correct paths
          const links = tempDiv.querySelectorAll('a');
          links.forEach(link => {
              const href = link.getAttribute('href');
              if (href && !href.startsWith('http') && !href.startsWith('#')) {
                  // Add path to root for all relative links
                  link.href = pathToRoot + href;
              }
          });
          
          // Insert navbar
          document.getElementById('navbar-placeholder').innerHTML = tempDiv.innerHTML;
          
          // Highlight current page
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
  // Get path depth
  const pathArray = window.location.pathname.split('/');
  const projectsIndex = pathArray.indexOf('projects');
  
  // Calculate path to root
  const pathToRoot = projectsIndex !== -1 ? '../' : './';
  
  // Fetch footer
  fetch(pathToRoot + 'footer.html')
      .then(response => response.text())
      .then(data => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = data;
          
          // Update social media links
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