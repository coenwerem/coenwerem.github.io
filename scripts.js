/*
 * Basic Count Up from Date and Time
 * Author: @mrwigster / https://guwii.com/bytes/count-date-time-javascript/
 */
window.onload = function() {
    // Month Day, Year Hour:Minute:Second, id-of-element-container
    countUpFromTime("June 1, 2022 00:00:00", 'countup1'); // ****** Change this line!
  };

function countUpFromTime(countFrom, id) {
  countFrom = new Date(countFrom).getTime();
  var now = new Date(),
      countFrom = new Date(countFrom),
      timeDifference = (now - countFrom);
    
  var secondsInADay = 60 * 60 * 1000 * 24,
      secondsInAHour = 60 * 60 * 1000;
    
  days = Math.floor(timeDifference / (secondsInADay) * 1);
  hours = Math.floor((timeDifference % (secondsInADay)) / (secondsInAHour) * 1);
  mins = Math.floor(((timeDifference % (secondsInADay)) % (secondsInAHour)) / (60 * 1000) * 1);
  secs = Math.floor((((timeDifference % (secondsInADay)) % (secondsInAHour)) % (60 * 1000)) / 1000 * 1);

  var idEl = document.getElementById(id);
  idEl.getElementsByClassName('days')[0].innerHTML = days;
  idEl.getElementsByClassName('hours')[0].innerHTML = hours;
  idEl.getElementsByClassName('minutes')[0].innerHTML = mins;
  idEl.getElementsByClassName('seconds')[0].innerHTML = secs;

  clearTimeout(countUpFromTime.interval);
  countUpFromTime.interval = setTimeout(function(){ countUpFromTime(countFrom, id); }, 1000);
};

function revealExtraBio() {
  var x = document.getElementById("extraBio");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
};

function toggleDarkMode() {
  var element = document.body;
  element.classList.toggle("dark-mode");
};

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