/**
 * NovaVance - Advanced Media Player Controller
 * Implements ReVanced-style floating miniplayer, background playback, SponsorBlock automation, PiP, and touch timeline.
 */

const PlayerController = {
  currentVideo: null,
  isPlaying: false,
  isAudioOnly: false,
  isCollapsed: true,
  controlsTimeout: null,
  lastSkippedSegment: null,
  availableSpeeds: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 3.0],
  currentSpeedIndex: 3,

  init() {
    this.videoElement = document.getElementById('mainVideoPlayer');
    this.playerContainer = document.getElementById('playerContainer');
    this.controlsOverlay = document.getElementById('videoControlsOverlay');
    this.playerSpinner = document.getElementById('playerSpinner');
    this.timelineContainer = document.getElementById('timelineContainer');
    this.timelineProgress = document.querySelector('.timeline-progress');
    this.timelineBuffered = document.querySelector('.timeline-buffered');
    this.timelineThumb = document.querySelector('.timeline-thumb');
    this.timeTooltip = document.getElementById('timeTooltip');
    this.currentTimeLabel = document.getElementById('currentTimeLabel');
    this.totalDurationLabel = document.getElementById('totalDurationLabel');
    this.sponsorSegmentsContainer = document.getElementById('sponsorSegments');
    this.sponsorToast = document.getElementById('sponsorToast');
    this.audioModeOverlay = document.getElementById('audioModeOverlay');
    this.miniPlayerProgress = document.getElementById('miniPlayerProgress');

    this.bindEvents();
    GestureHandler.init(this);
  },

  bindEvents() {
    const v = this.videoElement;

    // Video Lifecycle Events
    v.addEventListener('play', () => this.onPlayStateChange(true));
    v.addEventListener('pause', () => this.onPlayStateChange(false));
    v.addEventListener('timeupdate', () => this.onTimeUpdate());
    v.addEventListener('progress', () => this.updateBufferBar());
    v.addEventListener('waiting', () => this.playerSpinner.classList.add('show'));
    v.addEventListener('playing', () => this.playerSpinner.classList.remove('show'));
    v.addEventListener('ended', () => this.onVideoEnded());

    // Play / Pause Buttons
    document.getElementById('btnMainPlayPause').addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePlay();
    });
    document.getElementById('miniBtnPlayPause').addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePlay();
    });

    // 10s Seek Controls
    document.getElementById('btnSeekBack10').addEventListener('click', (e) => {
      e.stopPropagation();
      this.seekRelative(-10);
      GestureHandler.triggerRipple('left');
    });
    document.getElementById('btnSeekForward10').addEventListener('click', (e) => {
      e.stopPropagation();
      this.seekRelative(10);
      GestureHandler.triggerRipple('right');
    });

    // Mini-player Expand & Close
    document.getElementById('btnExpandFromThumb').addEventListener('click', () => this.expand());
    document.getElementById('btnExpandFromInfo').addEventListener('click', () => this.expand());
    document.getElementById('miniBtnClose').addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });
    document.getElementById('btnCollapsePlayer').addEventListener('click', () => this.collapse());

    // Picture-in-Picture (PiP)
    document.getElementById('btnNativePiP').addEventListener('click', () => this.togglePiP());

    // Audio-Only Mode Toggle
    document.getElementById('btnAudioModeToggle').addEventListener('click', () => this.toggleAudioOnlyMode());
    document.getElementById('btnBackgroundToggle').addEventListener('click', () => this.toggleAudioOnlyMode());

    // Speed Selector Quick Button
    document.getElementById('btnSpeedQuick').addEventListener('click', () => this.cyclePlaybackSpeed());

    // Loop Toggle
    document.getElementById('btnLoopToggle').addEventListener('click', (e) => {
      v.loop = !v.loop;
      e.currentTarget.style.color = v.loop ? 'var(--brand-red)' : '#fff';
      App.showToast(v.loop ? 'تم تفعيل التكرار التلقائي' : 'تم إيقاف التكرار');
    });

    // Fullscreen Toggle
    document.getElementById('btnFullscreen').addEventListener('click', () => this.toggleFullscreen());

    // Timeline Scrubbing & Seeking
    this.bindTimelineScrubbing();

    // SponsorBlock Undo Action
    document.getElementById('btnUndoSkip').addEventListener('click', () => {
      if (this.lastSkippedSegment) {
        v.currentTime = this.lastSkippedSegment.start;
        this.hideSponsorToast();
        App.showToast('تم التراجع عن التخطي');
      }
    });

    // Keep Background Audio running even on tab switch
    document.addEventListener('visibilitychange', () => {
      const settings = StorageManager.getSettings();
      if (document.hidden && settings.backgroundAudio && this.isPlaying) {
        // Media session background state
        if ('mediaSession' in navigator && this.currentVideo) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: this.currentVideo.title,
            artist: this.currentVideo.channel.name,
            artwork: [{ src: this.currentVideo.thumbnail, sizes: '512x512', type: 'image/jpeg' }]
          });
        }
      }
    });
  },

  // Load and Play a Video
  loadVideo(video, autoPlay = true) {
    this.currentVideo = video;
    this.videoElement.src = video.streamUrl;
    this.videoElement.load();

    // Update Player UI details
    document.getElementById('playerTopTitle').textContent = video.title;
    document.getElementById('miniPlayerTitle').textContent = video.title;
    document.getElementById('miniPlayerChannel').textContent = video.channel.name;
    document.getElementById('miniPlayerThumb').src = video.thumbnail;
    document.getElementById('audioModeThumb').src = video.thumbnail;
    document.getElementById('videoDetailTitle').textContent = video.title;
    document.getElementById('videoDetailViews').innerHTML = `<i class="fa-solid fa-eye"></i> ${video.views}`;
    document.getElementById('videoDetailDate').innerHTML = `<i class="fa-solid fa-calendar"></i> ${video.uploadedAt}`;
    document.getElementById('videoQualityBadge').textContent = video.quality;
    document.getElementById('channelAvatarImg').src = video.channel.avatar;
    document.getElementById('channelNameText').textContent = video.channel.name;
    document.getElementById('channelSubsCount').textContent = video.channel.subs;
    document.getElementById('descPreviewText').textContent = video.description.substring(0, 70) + '...';
    document.getElementById('descFullContent').innerText = video.description;

    // Render SponsorBlock timeline visual segments
    this.renderSponsorTimelineMarkers(video.sponsorSegments, video.durationSec);

    // Render Related Videos & Comments
    App.renderRelatedVideos(video.id);
    App.renderComments(video.comments || []);
    App.updateSubscribeButtonState(video.channel.id);
    App.updateLikeButtonState(video.id);
    App.updateSaveButtonState(video.id);

    // Unhide container and expand player
    this.playerContainer.classList.remove('hidden');
    this.expand();

    if (autoPlay) {
      this.videoElement.play().catch(() => {
        // Autoplay policy fallback
        this.onPlayStateChange(false);
      });
    }

    StorageManager.addToHistory(video, 0, video.durationSec);
  },

  togglePlay() {
    if (this.videoElement.paused) {
      this.videoElement.play();
    } else {
      this.videoElement.pause();
    }
  },

  onPlayStateChange(playing) {
    this.isPlaying = playing;
    const playIconClass = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    document.querySelector('#btnMainPlayPause i').className = playIconClass;
    document.querySelector('#miniBtnPlayPause i').className = playIconClass;
  },

  seekRelative(seconds) {
    this.videoElement.currentTime = Math.max(0, Math.min(this.videoElement.duration || 0, this.videoElement.currentTime + seconds));
  },

  // SponsorBlock Detection Engine
  onTimeUpdate() {
    const v = this.videoElement;
    if (!v.duration) return;

    const curr = v.currentTime;
    const dur = v.duration;
    const percent = (curr / dur) * 100;

    // Update Progress Bars
    this.timelineProgress.style.width = percent + '%';
    this.timelineThumb.style.left = percent + '%';
    this.miniPlayerProgress.style.width = percent + '%';

    // Update Timers
    this.currentTimeLabel.textContent = this.formatTime(curr);
    this.totalDurationLabel.textContent = this.formatTime(dur);

    // Save history progress
    if (this.currentVideo && Math.floor(curr) % 5 === 0) {
      StorageManager.addToHistory(this.currentVideo, curr, dur);
    }

    // SponsorBlock Auto-Skip Logic
    const settings = StorageManager.getSettings();
    if (settings.sponsorBlock && this.currentVideo && this.currentVideo.sponsorSegments) {
      for (const segment of this.currentVideo.sponsorSegments) {
        if (curr >= segment.start && curr < segment.end) {
          if (!settings.skipIntro && segment.category === 'intro') continue;

          // Skip past segment
          this.lastSkippedSegment = segment;
          v.currentTime = segment.end;
          this.showSponsorToast(segment);
          break;
        }
      }
    }
  },

  showSponsorToast(segment) {
    const detail = document.getElementById('sponsorToastDetail');
    const skippedSec = Math.round(segment.end - segment.start);
    detail.textContent = `تم تخطي ${segment.description || 'مقطع ترويجي'} (تم توفير ${skippedSec} ثانية تلقائياً)`;
    this.sponsorToast.classList.add('show');
    clearTimeout(this.sponsorToastTimeout);
    this.sponsorToastTimeout = setTimeout(() => {
      this.hideSponsorToast();
    }, 4500);
  },

  hideSponsorToast() {
    this.sponsorToast.classList.remove('show');
  },

  renderSponsorTimelineMarkers(segments, totalDuration) {
    this.sponsorSegmentsContainer.innerHTML = '';
    if (!segments || !segments.length || !totalDuration) return;

    segments.forEach(seg => {
      const startPercent = (seg.start / totalDuration) * 100;
      const widthPercent = ((seg.end - seg.start) / totalDuration) * 100;

      const bar = document.createElement('div');
      bar.className = `sponsor-segment-bar ${seg.category || 'sponsor'}`;
      bar.style.left = startPercent + '%';
      bar.style.width = widthPercent + '%';
      this.sponsorSegmentsContainer.appendChild(bar);
    });
  },

  updateBufferBar() {
    const v = this.videoElement;
    if (v.buffered.length > 0 && v.duration) {
      const bufferedEnd = v.buffered.end(v.buffered.length - 1);
      const percent = (bufferedEnd / v.duration) * 100;
      this.timelineBuffered.style.width = percent + '%';
    }
  },

  bindTimelineScrubbing() {
    const t = this.timelineContainer;

    const scrub = (e) => {
      const rect = t.getBoundingClientRect();
      const clickX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const percent = Math.max(0, Math.min(1, clickX / rect.width));
      if (this.videoElement.duration) {
        this.videoElement.currentTime = percent * this.videoElement.duration;
      }
    };

    t.addEventListener('click', scrub);

    t.addEventListener('mousemove', (e) => {
      const rect = t.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, clickX / rect.width));
      if (this.videoElement.duration) {
        this.timeTooltip.style.display = 'block';
        this.timeTooltip.style.left = clickX + 'px';
        this.timeTooltip.textContent = this.formatTime(percent * this.videoElement.duration);
      }
    });

    t.addEventListener('mouseleave', () => {
      this.timeTooltip.style.display = 'none';
    });
  },

  cyclePlaybackSpeed() {
    this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.availableSpeeds.length;
    const speed = this.availableSpeeds[this.currentSpeedIndex];
    this.videoElement.playbackRate = speed;
    document.getElementById('btnSpeedQuick').textContent = speed + 'x';
    App.showToast(`سرعة التشغيل: ${speed}x`);
  },

  toggleAudioOnlyMode() {
    this.isAudioOnly = !this.isAudioOnly;
    if (this.isAudioOnly) {
      this.audioModeOverlay.classList.add('show');
      document.getElementById('btnAudioModeToggle').classList.add('active');
      document.getElementById('btnBackgroundToggle').classList.add('active');
      App.showToast('تم تفعيل وضع الصوت فقط بالخلفية 🎧');
    } else {
      this.audioModeOverlay.classList.remove('show');
      document.getElementById('btnAudioModeToggle').classList.remove('active');
      document.getElementById('btnBackgroundToggle').classList.remove('active');
      App.showToast('تم العودة إلى وضع الفيديو 🎬');
    }
  },

  async togglePiP() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await this.videoElement.requestPictureInPicture();
        App.showToast('تم تفعيل وضع الصورة داخل صورة (PiP)');
      }
    } catch (e) {
      App.showToast('ميزة PiP غير مدعومة في هذا المتصفح');
    }
  },

  toggleFullscreen() {
    const wrap = document.getElementById('videoWrapper');
    if (!document.fullscreenElement) {
      wrap.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  },

  toggleControlsOverlay() {
    this.controlsOverlay.classList.toggle('hidden-controls');
    clearTimeout(this.controlsTimeout);
    if (!this.controlsOverlay.classList.contains('hidden-controls') && this.isPlaying) {
      this.controlsTimeout = setTimeout(() => {
        this.controlsOverlay.classList.add('hidden-controls');
      }, 3500);
    }
  },

  expand() {
    this.isCollapsed = false;
    this.playerContainer.classList.remove('collapsed');
  },

  collapse() {
    this.isCollapsed = true;
    this.playerContainer.classList.add('collapsed');
  },

  close() {
    this.videoElement.pause();
    this.playerContainer.classList.add('hidden');
    this.currentVideo = null;
  },

  onVideoEnded() {
    const settings = StorageManager.getSettings();
    if (settings.autoplayNext && this.currentVideo) {
      VideoAPIService.getRelatedVideos(this.currentVideo.id).then(related => {
        if (related && related.length) {
          App.showToast('تشغيل الفيديو التالي تلقائياً...');
          setTimeout(() => this.loadVideo(related[0]), 1200);
        }
      });
    }
  },

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      const remMins = mins % 60;
      return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
};
