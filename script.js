// Typing animation for hero section

document.addEventListener('DOMContentLoaded', function() {
  const typingElement = document.getElementById('typing');
  typingElement.textContent = '';
  const texts = ['creative developer', 'sound designer'];
  let textIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let started = false;

  function typeCycle() {
    const currentText = texts[textIdx];
    // Only reveal the element when the first character is about to be typed
    if (!started && charIdx === 1 && !isDeleting) {
      typingElement.style.visibility = 'visible';
      started = true;
    }
    if (charIdx <= currentText.length && !isDeleting) {
      typingElement.textContent = currentText.slice(0, charIdx);
      charIdx++;
      if (charIdx > currentText.length) {
        setTimeout(() => {
          isDeleting = true;
          typeCycle();
        }, 3000); // Pause 3s after typing full text
      } else {
        setTimeout(typeCycle, 100);
      }
    } else if (isDeleting && charIdx >= 0) {
      typingElement.textContent = currentText.slice(0, charIdx);
      charIdx--;
      if (charIdx < 0) {
        isDeleting = false;
        textIdx = (textIdx + 1) % texts.length;
        started = false; // Reset for next cycle
        setTimeout(typeCycle, 400); // Short pause before typing next
      } else {
        setTimeout(typeCycle, 40);
      }
    }
  }
  typeCycle();

  // Project category filtering and dynamic loading
  let projectsData = [];
  let currentCategory = 'all';

  // Load projects from JSON
  async function loadProjects() {
    try {
      const response = await fetch('projects.json');
      const data = await response.json();
      projectsData = data.projects;
      renderProjects();
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  function createProjectElement(project, index) {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project';
    projectDiv.setAttribute('data-category', project.category);
    projectDiv.style.backgroundImage = `url('${project.image}')`;
    projectDiv.style.backgroundSize = 'cover';
    projectDiv.style.backgroundPosition = 'center';
    projectDiv.style.color = '#fff';
    
    // Add category label only when viewing highlights
    if (project.highlight === true && currentCategory === 'all') {
      const label = document.createElement('div');
      label.className = 'category-label';
      label.textContent = project.category.charAt(0).toUpperCase() + project.category.slice(1);
      projectDiv.appendChild(label);
    }
    
    // Make project clickable
    projectDiv.style.cursor = 'pointer';
    projectDiv.addEventListener('click', () => {
      window.location.href = `project.html?id=${project.id}`;
    });
    
    // Add audio player for music projects
    if (project.audioUrl) {
      const playBtn = document.createElement('button');
      playBtn.className = 'play-btn';
      playBtn.id = `play-btn-${index}`;
      playBtn.setAttribute('aria-label', 'Play music');
      playBtn.setAttribute('type', 'button');
      playBtn.innerHTML = '<span class="play-icon"></span><span class="pause-icon"></span>';
      
      const progressBar = document.createElement('div');
      progressBar.className = 'music-progress-bar';
      progressBar.id = `progress-bar-${index}`;
      progressBar.setAttribute('tabindex', '0');
      progressBar.setAttribute('aria-label', 'Audio progress');
      progressBar.innerHTML = `<div class="music-progress-fill" id="progress-fill-${index}" style="width:0%"></div>`;
      
      const audio = document.createElement('audio');
      audio.id = `audio-${index}`;
      audio.src = project.audioUrl;
      
      // Prevent project click when clicking audio controls
      [playBtn, progressBar].forEach(element => {
        element.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      });
      
      projectDiv.appendChild(playBtn);
      projectDiv.appendChild(progressBar);
      projectDiv.appendChild(audio);
    }
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.description}</p>
    `;
    
    projectDiv.appendChild(cardBody);
    return projectDiv;
  }

  // Category filtering
  const categories = document.querySelectorAll('.category');
  categories.forEach(btn => {
    btn.addEventListener('click', () => {
      categories.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderProjects();
    });
  });

  // Load projects on page load
  loadProjects();

  // Check for category in URL and auto-select it
  window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;
    if (hash.startsWith('#projects?category=')) {
      const params = new URLSearchParams(hash.split('?')[1]);
      const cat = params.get('category');
      if (cat) {
        currentCategory = cat;
        categories.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-category') === cat);
        });
        renderProjects();
        // Jump directly to the projects section and snap the title to the top
        window.location.hash = '#projects';
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
          const workTitle = projectsSection.querySelector('h2');
          if (workTitle) {
            workTitle.scrollIntoView({ behavior: 'auto', block: 'start' });
            // Move slightly down so the title is below the top bar
            window.scrollBy({ top: 80, behavior: 'auto' });
          } else {
            projectsSection.scrollIntoView({ behavior: 'auto', block: 'start' });
          }
        }
      }
    }
  });

  // Music card play button and progress bar logic
  function setupMusicPlayers() {
    const musicCards = [];
    
    // Get the current filtered projects to match the actual DOM elements
    let currentFilteredProjects;
    if (currentCategory === 'all') {     currentFilteredProjects = projectsData.filter(project => project.highlight === true);
    } else {
      currentFilteredProjects = projectsData.filter(project => project.category === currentCategory);
    }
    
    // Find all music projects with audio in the current filtered set
    currentFilteredProjects.forEach((project, filteredIndex) => {
      if (project.audioUrl) {
        const btn = document.getElementById(`play-btn-${filteredIndex}`);
        const audio = document.getElementById(`audio-${filteredIndex}`);
        const bar = document.getElementById(`progress-bar-${filteredIndex}`);
        const fill = document.getElementById(`progress-fill-${filteredIndex}`);
        
        if (btn && audio && bar && fill) {
          musicCards.push({ btn, audio, bar, fill });
        }
      }
    });

  // SVGs for play and pause
  const playSVG = '<svg class="play-svg" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="5,3 19,11 5,19" fill="white"/></svg>';
  const pauseSVG = '<svg class="pause-svg" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="4" height="14" rx="1.5" fill="white"/><rect x="14" y="4" width="4" height="14" rx="1.5" fill="white"/></svg>';

  // Set icons
  musicCards.forEach(card => {
    card.btn.querySelector('.play-icon').innerHTML = playSVG;
    card.btn.querySelector('.pause-icon').innerHTML = pauseSVG;
  });

  function setPlayState(card, isPlaying) {
    if (isPlaying) {
      card.btn.classList.add('playing');
    } else {
      card.btn.classList.remove('playing');
    }
  }

  musicCards.forEach((card, idx, arr) => {
    setPlayState(card, false);
    card.btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (card.audio.paused) {
        // Pause all other audios
        arr.forEach((other, i) => {
          if (i !== idx) {
            other.audio.pause();
            setPlayState(other, false);
          }
        });
        card.audio.play();
        setPlayState(card, true);
      } else {
        card.audio.pause();
        setPlayState(card, false);
      }
    });
    card.audio.addEventListener('ended', function() {
      setPlayState(card, false);
    });
    card.audio.addEventListener('pause', function() {
      setPlayState(card, false);
    });
    card.audio.addEventListener('play', function() {
      setPlayState(card, true);
    });
    // Progress bar update
    card.audio.addEventListener('timeupdate', function() {
      const percent = (card.audio.currentTime / card.audio.duration) * 100;
      card.fill.style.width = isNaN(percent) ? '0%' : percent + '%';
    });
    // Click to seek
    card.bar.addEventListener('click', function(e) {
      const rect = card.bar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      if (!isNaN(card.audio.duration)) {
        card.audio.currentTime = percent * card.audio.duration;
      }
    });
    // Keyboard accessibility
    card.bar.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        let seek = card.audio.currentTime + (e.key === 'ArrowRight' ? 5 : -5);
        seek = Math.max(0, Math.min(card.audio.duration, seek));
        card.audio.currentTime = seek;
      }
    });
  });
  }

  // Setup music players after projects are rendered
  function renderProjects() {
    const projectsList = document.getElementById('projects-list');
    let filteredProjects;
    
    if (currentCategory === 'all') {      // Show only highlighted projects in the "Highlight" category
      filteredProjects = projectsData.filter(project => project.highlight === true);
    } else {
      // Show all projects for specific categories
      filteredProjects = projectsData.filter(project => project.category === currentCategory);
    }
    
    projectsList.innerHTML = '';
    
    filteredProjects.forEach((project, index) => {
      const projectElement = createProjectElement(project, index);
      projectsList.appendChild(projectElement);
    });
    
    // Setup music players after rendering
    setupMusicPlayers();
  }

  // Copy email button logic
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyFeedback = document.getElementById('copy-feedback');
  if (copyEmailBtn && copyFeedback) {
    copyEmailBtn.addEventListener('click', function() {
      const email = 'ssummer.lance@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        copyFeedback.style.display = 'inline';
        setTimeout(() => {
          copyFeedback.style.display = 'none';
        }, 1500);
      });
    });
  }

  // Hamburger menu logic (moved out of nested DOMContentLoaded)
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const closeMenu = document.getElementById('close-menu');
  function toggleMenu(open) {
    if (!navLinks) return;
    if (typeof open === 'boolean') {
      navLinks.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    } else {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    }
  }
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      toggleMenu();
    });
  }
  if (closeMenu && navLinks) {
    closeMenu.addEventListener('click', function() {
      toggleMenu(false);
    });
  }
}); 