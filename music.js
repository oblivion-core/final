// Music controller with persistent playback
class MusicController {
  constructor() {
    this.btn = document.getElementById('musicBtn');
    this.music = document.getElementById('backgroundMusic');
    this.isPlaying = localStorage.getItem('musicPlaying') === 'true';
    this.savedTime = parseFloat(localStorage.getItem('musicTime')) || 0;
    
    this.init();
  }
  
  init() {
    // Set volume to a comfortable level
    this.music.volume = 0.5;
    
    // Set saved time position
    if (this.savedTime > 0 && this.savedTime < this.music.duration) {
      this.music.currentTime = this.savedTime;
    }
    
    // Restore playing state
    if (this.isPlaying) {
      this.resumePlayback();
    }
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup periodic save
    this.setupAutoSave();
  }
  
  resumePlayback() {
    const playPromise = this.music.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.updateButton(true);
        })
        .catch(error => {
          console.log("Autoplay prevented, waiting for user interaction");
          this.isPlaying = false;
          localStorage.setItem('musicPlaying', 'false');
          this.updateButton(false);
        });
    }
  }
  
  setupEventListeners() {
    // Toggle playback on button click
    this.btn.addEventListener('click', () => this.togglePlayback());
    
    // Save time when leaving page
    window.addEventListener('beforeunload', () => this.saveCurrentTime());
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveCurrentTime();
      }
    });
    
    // Optional: Save time when music ends and restarts (for looping)
    this.music.addEventListener('ended', () => {
      // If looping, save at 0 time
      if (this.music.loop) {
        localStorage.setItem('musicTime', '0');
      }
    });
  }
  
  setupAutoSave() {
    // Auto-save every 3 seconds while playing
    setInterval(() => {
      if (!this.music.paused) {
        this.saveCurrentTime();
      }
    }, 3000);
  }
  
  togglePlayback() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
  
  play() {
    this.music.play()
      .then(() => {
        this.isPlaying = true;
        localStorage.setItem('musicPlaying', 'true');
        this.updateButton(true);
      })
      .catch(error => {
        console.error("Playback failed:", error);
      });
  }
  
  pause() {
    this.music.pause();
    this.isPlaying = false;
    localStorage.setItem('musicPlaying', 'false');
    this.saveCurrentTime();
    this.updateButton(false);
  }
  
  saveCurrentTime() {
    localStorage.setItem('musicTime', this.music.currentTime.toString());
  }
  
  updateButton(playing) {
    this.btn.textContent = playing ? "🔊" : "🎵";
    this.btn.setAttribute('aria-label', 
      playing ? 'Pause background music' : 'Play background music'
    );
  }
  
  // Optional: Add keyboard shortcut (Space for play/pause)
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.togglePlayback();
      }
    });
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const musicController = new MusicController();
});