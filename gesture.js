/**
 * NovaVance - Touch & Mouse Gestures Handler
 * Handles double-tap seeking (10s back/forward), swipe brightness/volume, and mini-player collapse/dismiss gestures.
 */

const GestureHandler = {
  lastTapTime: 0,
  lastTapX: 0,
  touchStartY: 0,
  touchStartX: 0,
  isDraggingMini: false,
  brightnessLevel: 100,

  init(playerController) {
    this.player = playerController;
    this.videoWrapper = document.getElementById('videoWrapper');
    this.playerContainer = document.getElementById('playerContainer');
    this.dragHandle = document.getElementById('playerDragHandle');
    this.miniPlayer = document.getElementById('miniPlayer');
    this.gestureIndicator = document.getElementById('gestureIndicator');
    this.gestureBarFill = document.getElementById('gestureBarFill');
    this.gestureValText = document.getElementById('gestureValText');
    this.gestureIcon = document.getElementById('gestureIcon');

    this.bindDoubleTapSeek();
    this.bindVerticalSwipeControls();
    this.bindCollapseDrag();
  },

  // Double Tap Seek (-10s / +10s)
  bindDoubleTapSeek() {
    if (!this.videoWrapper) return;

    this.videoWrapper.addEventListener('click', (e) => {
      // Don't trigger if clicked on bottom controls or center buttons directly
      if (e.target.closest('.video-controls-overlay') && !e.target.classList.contains('video-controls-overlay') && !e.target.classList.contains('video-wrapper')) {
        return;
      }

      const currentTime = new Date().getTime();
      const tapInterval = currentTime - this.lastTapTime;
      const rect = this.videoWrapper.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;

      if (tapInterval < 300 && Math.abs(clickX - this.lastTapX) < 80) {
        // Double tap confirmed
        e.stopPropagation();
        if (clickX < width * 0.45) {
          // Left side: seek -10s
          this.player.seekRelative(-10);
          this.triggerRipple('left');
        } else if (clickX > width * 0.55) {
          // Right side: seek +10s
          this.player.seekRelative(10);
          this.triggerRipple('right');
        }
      } else {
        // Single tap: toggle overlay controls visibility
        this.player.toggleControlsOverlay();
      }

      this.lastTapTime = currentTime;
      this.lastTapX = clickX;
    });
  },

  triggerRipple(side) {
    const ripple = document.getElementById(side === 'left' ? 'seekRippleLeft' : 'seekRippleRight');
    if (!ripple) return;
    ripple.classList.remove('animate');
    void ripple.offsetWidth; // trigger reflow
    ripple.classList.add('animate');
    setTimeout(() => {
      ripple.classList.remove('animate');
    }, 700);
  },

  // Swipe Gestures for Volume & Brightness
  bindVerticalSwipeControls() {
    let startY = 0;
    let startX = 0;
    let isSwiping = false;
    let swipeType = null; // 'volume' or 'brightness'

    this.videoWrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      const rect = this.videoWrapper.getBoundingClientRect();
      const relX = startX - rect.left;
      swipeType = relX < rect.width / 2 ? 'brightness' : 'volume';
      isSwiping = false;
    }, { passive: true });

    this.videoWrapper.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1 || !swipeType) return;
      const deltaY = startY - e.touches[0].clientY;
      const deltaX = Math.abs(startX - e.touches[0].clientX);

      if (Math.abs(deltaY) > 15 && deltaX < 30) {
        isSwiping = true;
        if (swipeType === 'volume') {
          const currentVol = this.player.videoElement.volume;
          const newVol = Math.max(0, Math.min(1, currentVol + (deltaY > 0 ? 0.03 : -0.03)));
          this.player.videoElement.volume = newVol;
          this.showGestureIndicator('volume', Math.round(newVol * 100));
        } else {
          this.brightnessLevel = Math.max(20, Math.min(150, this.brightnessLevel + (deltaY > 0 ? 3 : -3)));
          this.videoWrapper.style.filter = `brightness(${this.brightnessLevel}%)`;
          this.showGestureIndicator('brightness', this.brightnessLevel);
        }
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.videoWrapper.addEventListener('touchend', () => {
      swipeType = null;
      setTimeout(() => this.hideGestureIndicator(), 800);
    });
  },

  showGestureIndicator(type, percent) {
    if (!this.gestureIndicator) return;
    this.gestureIcon.className = type === 'volume' 
      ? (percent > 0 ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark')
      : 'fa-solid fa-sun';
    this.gestureBarFill.style.width = Math.min(100, percent) + '%';
    this.gestureValText.textContent = percent + '%';
    this.gestureIndicator.classList.add('show');
  },

  hideGestureIndicator() {
    if (this.gestureIndicator) {
      this.gestureIndicator.classList.remove('show');
    }
  },

  // Swipe Down to Collapse Full Player
  bindCollapseDrag() {
    let startY = 0;
    if (!this.dragHandle) return;

    this.dragHandle.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    this.dragHandle.addEventListener('touchmove', (e) => {
      const deltaY = e.touches[0].clientY - startY;
      if (deltaY > 60) {
        this.player.collapse();
      }
    }, { passive: true });
  }
};
