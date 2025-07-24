// Project Detail Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Get project ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  
  if (!projectId) {
    window.location.href = 'index.html#projects';
    return;
  }
  
  // Load project data
  loadProjectData(projectId);
  
  // Hamburger menu logic
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
  }
});

async function loadProjectData(projectId) {
  try {
    const response = await fetch('projects.json');
    const data = await response.json();
    
    const project = data.projects.find(p => p.id === projectId);
    
    if (!project) {
      window.location.href = 'index.html#projects';
      return;
    }
    
    // Populate project data
    document.title = `${project.title} | Creative Developer`;
    
    // Setup slider with images and video
    setupProjectSlider(project);
    
    // Set project title and description
    document.getElementById('project-title').textContent = project.title;
    document.getElementById('project-description').textContent = project.fullDescription;
    
    // Set category
    const categoryElement = document.getElementById('project-category');
    categoryElement.textContent = project.category.charAt(0).toUpperCase() + project.category.slice(1);

    // Update Back to Projects link to include category
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
      backBtn.href = `index.html#projects?category=${encodeURIComponent(project.category)}`;
    }
    
    // Populate technologies
    const techTagsContainer = document.getElementById('tech-tags');
    techTagsContainer.innerHTML = '';
    project.technologies.forEach(tech => {
      const tag = document.createElement('span');
      tag.className = 'tech-tag';
      tag.textContent = tech;
      techTagsContainer.appendChild(tag);
    });
    
    // Populate features or projects
    const featuresList = document.getElementById('features-list');
    featuresList.innerHTML = '';
    const featuresSection = featuresList.closest('.detail-section');
    if (project.category === 'music') {
      // Hide the features section for music projects
      featuresSection.style.display = 'none';
    } else {
      featuresSection.style.display = '';
      if (project.projects) {
        // Change section title to 'Projects'
        featuresSection.querySelector('h3').textContent = 'Projects';
        project.projects.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          featuresList.appendChild(li);
        });
      } else if (project.features) {
        // Default: Features
        featuresSection.querySelector('h3').textContent = 'Features';
        project.features.forEach(feature => {
          const li = document.createElement('li');
          li.textContent = feature;
          featuresList.appendChild(li);
        });
      }
    }
    
    // Set project links
    const liveLink = document.getElementById('live-link');
    const githubLink = document.getElementById('github-link');
    
    if (project.liveUrl && project.liveUrl !== '#') {
      liveLink.href = project.liveUrl;
    } else {
      liveLink.style.display = 'none';
    }
    
    if (project.githubUrl && project.githubUrl !== '#') {
      githubLink.href = project.githubUrl;
    } else {
      githubLink.style.display = 'none';
    }
    
    // Handle audio for music projects
    if (project.audioUrl) {
      setupAudioPlayer(project.audioUrl);
    }
    
  } catch (error) {
    console.error('Error loading project data:', error);
    window.location.href = 'index.html#projects';
  }
}

function setupProjectSlider(project) {
  const sliderTrack = document.getElementById('slider-track');
  const sliderDots = document.getElementById('slider-dots');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  
  let currentSlide = 0;
  let slides = [];
  
  // Only add images to the slider (do not add video)
  if (project.images && project.images.length > 0) {
    project.images.forEach(imageUrl => {
      slides.push({ type: 'image', src: imageUrl });
    });
  } else {
    // Fallback to single image if no images array
    slides.push({ type: 'image', src: project.image });
  }
  
  // Create slider content
  sliderTrack.innerHTML = '';
  slides.forEach((slide, index) => {
    const slideElement = document.createElement('div');
    slideElement.className = 'slider-slide';
    
    // Only handle images
    const img = document.createElement('img');
    img.src = slide.src;
    img.alt = `${project.title} - Image ${index + 1}`;
    slideElement.appendChild(img);
    
    sliderTrack.appendChild(slideElement);
  });
  
  // Create dots
  sliderDots.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    sliderDots.appendChild(dot);
  });
  
  // Navigation functions
  function goToSlide(index) {
    currentSlide = index;
    updateSlider();
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
  }
  
  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
  }
  
  function updateSlider() {
    // Update track position
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    // Update dots
    document.querySelectorAll('.slider-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
    
    // Update arrow visibility
    prevBtn.style.display = slides.length > 1 ? 'flex' : 'none';
    nextBtn.style.display = slides.length > 1 ? 'flex' : 'none';
  }
  
  // Event listeners
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });
  
  // Initialize slider
  updateSlider();

  // --- VIDEO SLIDER LOGIC ---
  // Add video slider below images if videoUrls is present and has videos
  const videoContainer = document.getElementById('project-video-container');
  videoContainer.innerHTML = '';
  const videoUrls = Array.isArray(project.videoUrls) ? project.videoUrls : [];
  if (videoUrls.length === 1) {
    // Single video, display as before
    const url = videoUrls[0];
    if (url.includes('youtube.com/embed')) {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.width = '100%';
      iframe.height = '360';
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.marginTop = '2rem';
      videoContainer.appendChild(iframe);
    } else {
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.autoplay = false;
      video.muted = true;
      video.loop = true;
      video.style.width = '100%';
      video.style.marginTop = '2rem';
      videoContainer.appendChild(video);
    }
  } else if (videoUrls.length > 1) {
    // Multiple videos: create a slider
    let currentVideo = 0;
    const videoSlider = document.createElement('div');
    videoSlider.className = 'video-slider';
    const videoTrack = document.createElement('div');
    videoTrack.className = 'video-slider-track';
    videoSlider.appendChild(videoTrack);
    // Add videos
    videoUrls.forEach((url, idx) => {
      const slide = document.createElement('div');
      slide.className = 'video-slider-slide';
      if (url.includes('youtube.com/embed')) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.width = '100%';
        iframe.height = '360';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        slide.appendChild(iframe);
      } else {
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.autoplay = false;
        video.muted = true;
        video.loop = true;
        video.style.width = '100%';
        slide.appendChild(video);
      }
      videoTrack.appendChild(slide);
    });
    // Add navigation arrows
    const prevVideoBtn = document.createElement('button');
    prevVideoBtn.className = 'video-slider-arrow video-slider-prev';
    prevVideoBtn.innerHTML = '<span>‹</span>';
    const nextVideoBtn = document.createElement('button');
    nextVideoBtn.className = 'video-slider-arrow video-slider-next';
    nextVideoBtn.innerHTML = '<span>›</span>';
    videoSlider.appendChild(prevVideoBtn);
    videoSlider.appendChild(nextVideoBtn);
    // Add dots
    const videoDots = document.createElement('div');
    videoDots.className = 'video-slider-dots';
    videoUrls.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `video-slider-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to video ${idx + 1}`);
      dot.addEventListener('click', () => goToVideo(idx));
      videoDots.appendChild(dot);
    });
    videoSlider.appendChild(videoDots);
    // Navigation functions
    function goToVideo(idx) {
      currentVideo = idx;
      updateVideoSlider();
    }
    function nextVideo() {
      currentVideo = (currentVideo + 1) % videoUrls.length;
      updateVideoSlider();
    }
    function prevVideo() {
      currentVideo = (currentVideo - 1 + videoUrls.length) % videoUrls.length;
      updateVideoSlider();
    }
    function updateVideoSlider() {
      videoTrack.style.transform = `translateX(-${currentVideo * 100}%)`;
      videoDots.querySelectorAll('.video-slider-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentVideo);
      });
      prevVideoBtn.style.display = videoUrls.length > 1 ? 'flex' : 'none';
      nextVideoBtn.style.display = videoUrls.length > 1 ? 'flex' : 'none';
    }
    prevVideoBtn.addEventListener('click', prevVideo);
    nextVideoBtn.addEventListener('click', nextVideo);
    // Keyboard navigation for video slider
    videoSlider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevVideo();
      else if (e.key === 'ArrowRight') nextVideo();
    });
    // Initialize
    updateVideoSlider();
    videoContainer.appendChild(videoSlider);
    // Style
    videoSlider.style.marginTop = '2rem';
  }
}

function setupAudioPlayer(audioUrl) {
  const audioSection = document.getElementById('audio-section');
  const playBtn = document.getElementById('play-btn-large');
  const audio = document.getElementById('audio-large');
  const progressBar = document.getElementById('progress-bar-large');
  const progressFill = document.getElementById('progress-fill-large');
  
  // Show audio section
  audioSection.style.display = 'block';
  
  // Set audio source
  audio.src = audioUrl;
  
  // SVGs for play and pause
  const playSVG = '<svg class="play-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="5,3 19,11 5,19" fill="white"/></svg>';
  const pauseSVG = '<svg class="pause-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="4" height="14" rx="1.5" fill="white"/><rect x="14" y="4" width="4" height="14" rx="1.5" fill="white"/></svg>';
  
  // Set icons
  playBtn.querySelector('.play-icon-large').innerHTML = playSVG;
  playBtn.querySelector('.pause-icon-large').innerHTML = pauseSVG;
  
  function setPlayState(isPlaying) {
    if (isPlaying) {
      playBtn.classList.add('playing');
    } else {
      playBtn.classList.remove('playing');
    }
  }
  
  // Play button functionality
  playBtn.addEventListener('click', function() {
    if (audio.paused) {
      audio.play();
      setPlayState(true);
    } else {
      audio.pause();
      setPlayState(false);
    }
  });
  
  // Audio event listeners
  audio.addEventListener('ended', function() {
    setPlayState(false);
  });
  
  audio.addEventListener('pause', function() {
    setPlayState(false);
  });
  
  audio.addEventListener('play', function() {
    setPlayState(true);
  });
  
  // Progress bar update
  audio.addEventListener('timeupdate', function() {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = isNaN(percent) ? '0%' : percent + '%';
  });
  
  // Click to seek
  progressBar.addEventListener('click', function(e) {
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    if (!isNaN(audio.duration)) {
      audio.currentTime = percent * audio.duration;
    }
  });
  
  // Keyboard accessibility
  progressBar.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      let seek = audio.currentTime + (e.key === 'ArrowRight' ? 5 : -5);
      seek = Math.max(0, Math.min(audio.duration, seek));
      audio.currentTime = seek;
    }
  });
} 