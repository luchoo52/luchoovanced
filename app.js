/**
 * NovaVance - Main Application Controller & UI View Manager
 */

const App = {
  activeTab: 'tabHome',
  currentCategory: 'all',

  init() {
    // Initialize Subsystems
    PlayerController.init();
    this.bindNavigation();
    this.bindSearch();
    this.bindSettings();
    this.bindLibraryActions();

    // Initial Feeds Render
    this.loadHomeFeed();
    this.loadSubscriptionsFeed();
    this.loadLibraryData();
    this.loadDownloadsList();
  },

  // Bottom Navigation & Tab Routing
  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Logo Click -> Go to Home
    document.getElementById('btnLogo').addEventListener('click', () => {
      this.switchTab('tabHome');
    });

    // Top Header Buttons
    document.getElementById('btnOpenDownloads').addEventListener('click', () => {
      this.switchTab('tabDownloads');
    });

    // Category Filter Chips
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCategory = chip.getAttribute('data-category');
        this.loadHomeFeed(this.currentCategory);
      });
    });

    // QR Code Modal Bindings
    const qrModal = document.getElementById('qrModal');
    const btnOpenQR = document.getElementById('btnOpenQR');
    const btnCloseQR = document.getElementById('btnCloseQR');
    if (btnOpenQR && qrModal) {
      btnOpenQR.addEventListener('click', () => qrModal.classList.add('open'));
      btnCloseQR.addEventListener('click', () => qrModal.classList.remove('open'));
      qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) qrModal.classList.remove('open');
      });
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update bottom nav active state
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Switch view visibility
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === tabId);
    });

    // Refresh content for active tab
    if (tabId === 'tabSubscriptions') this.loadSubscriptionsFeed();
    if (tabId === 'tabLibrary') this.loadLibraryData();
    if (tabId === 'tabDownloads') this.loadDownloadsList();
  },

  // Home Feed Loading & Rendering
  async loadHomeFeed(category = 'all') {
    const container = document.getElementById('homeVideoFeed');
    container.innerHTML = '<div style="text-align:center; padding: 30px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px;"></i><br><br>جاري تحميل الفيديوهات...</div>';

    const videos = await VideoAPIService.getFeed(category);
    container.innerHTML = '';

    if (!videos || !videos.length) {
      container.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted);">لا توجد فيديوهات متاحة في هذا التصنيف.</div>';
      return;
    }

    videos.forEach(video => {
      const card = this.createVideoCardElement(video);
      container.appendChild(card);
    });
  },

  // Create Video Card Component
  createVideoCardElement(video) {
    const card = document.createElement('div');
    card.className = 'video-card';

    const hasSponsor = video.sponsorSegments && video.sponsorSegments.length > 0;

    card.innerHTML = `
      <div class="video-thumb-container">
        <img src="${video.thumbnail}" alt="${video.title}" class="video-thumb" loading="lazy">
        <span class="duration-badge">${video.duration}</span>
        <span class="quality-card-badge">${video.quality}</span>
        ${hasSponsor ? '<span class="sponsor-badge-indicator"><i class="fa-solid fa-forward-step"></i> SponsorBlock</span>' : ''}
      </div>
      <div class="video-card-body">
        <img src="${video.channel.avatar}" alt="${video.channel.name}" class="channel-avatar-sm">
        <div class="video-card-meta">
          <div class="video-card-title">${video.title}</div>
          <div class="video-card-channel">
            <span>${video.channel.name}</span>
            ${video.channel.verified ? '<i class="fa-solid fa-circle-check verified-badge"></i>' : ''}
          </div>
          <div class="video-card-stats">
            <span>${video.views}</span>
            <span>•</span>
            <span>${video.uploadedAt}</span>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      PlayerController.loadVideo(video);
    });

    return card;
  },

  // Subscriptions Tab Feed
  async loadSubscriptionsFeed() {
    const subs = StorageManager.getSubscriptions();
    const channelsList = document.getElementById('subsChannelsList');
    const subsFeed = document.getElementById('subsVideoFeed');

    channelsList.innerHTML = '';
    subsFeed.innerHTML = '';

    const featured = await VideoAPIService.getStoryChannels();
    const allChannels = [...subs, ...featured.filter(f => !subs.some(s => s.id === f.id))];

    allChannels.forEach(ch => {
      const story = document.createElement('div');
      story.className = 'channel-story-item';
      story.innerHTML = `
        <div class="story-avatar-ring">
          <img src="${ch.avatar}" alt="${ch.name}" class="story-avatar-img">
        </div>
        <div class="story-name">${ch.name}</div>
      `;
      story.addEventListener('click', () => {
        this.showToast(`فتح قناة: ${ch.name}`);
      });
      channelsList.appendChild(story);
    });

    const videos = await VideoAPIService.getFeed('all');
    videos.forEach(v => {
      subsFeed.appendChild(this.createVideoCardElement(v));
    });
  },

  // Library Tab Data
  loadLibraryData() {
    const history = StorageManager.getHistory();
    const carousel = document.getElementById('historyCarousel');
    carousel.innerHTML = '';

    if (!history.length) {
      carousel.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; padding: 10px;">لا يوجد سجل مشاهدة بعد.</div>';
    } else {
      history.forEach(v => {
        const item = document.createElement('div');
        item.className = 'history-card';
        item.innerHTML = `
          <div class="history-thumb-box">
            <img src="${v.thumbnail}" alt="${v.title}">
            <div class="history-progress-bar" style="width: ${v.progressPercent || 0}%;"></div>
          </div>
          <div class="history-title">${v.title}</div>
          <div class="history-channel">${v.channel.name}</div>
        `;
        item.addEventListener('click', () => {
          PlayerController.loadVideo(v);
          if (v.savedTime) {
            PlayerController.videoElement.currentTime = v.savedTime;
          }
        });
        carousel.appendChild(item);
      });
    }

    // Update Counts
    const likes = StorageManager.getLikes();
    const watchLater = StorageManager.getWatchLater();
    document.getElementById('likedCountText').textContent = `${likes.length} فيديوهات`;
    document.getElementById('watchLaterCountText').textContent = `${watchLater.length} فيديوهات`;

    // Render Playlists
    const playlists = StorageManager.getPlaylists();
    const grid = document.getElementById('playlistsGrid');
    grid.innerHTML = '';
    playlists.forEach(pl => {
      const plEl = document.createElement('div');
      plEl.className = 'playlist-card';
      plEl.innerHTML = `
        <div class="playlist-thumb">
          <img src="${pl.thumb}" alt="${pl.title}">
          <div class="playlist-count-badge">
            <i class="fa-solid fa-list-ul"></i>
            <span>${pl.count}</span>
          </div>
        </div>
        <div class="playlist-info">
          <div class="playlist-name">${pl.title}</div>
          <div class="playlist-type">قائمة تشغيل محلية</div>
        </div>
      `;
      plEl.addEventListener('click', () => {
        this.showToast(`فتح قائمة: ${pl.title}`);
      });
      grid.appendChild(plEl);
    });
  },

  // Downloads Tab
  loadDownloadsList() {
    const list = document.getElementById('downloadsList');
    const downloads = StorageManager.getDownloads();
    list.innerHTML = '';

    if (!downloads.length) {
      list.innerHTML = '<div style="text-align:center; padding: 30px; color: var(--text-muted);"><i class="fa-solid fa-arrow-down-to-bracket" style="font-size: 32px; margin-bottom: 10px;"></i><br>لم تقم بتنزيل أي فيديوهات للمشاهدة بدون إنترنت حتى الآن.</div>';
      return;
    }

    downloads.forEach(d => {
      const el = document.createElement('div');
      el.className = 'download-item';
      el.innerHTML = `
        <div class="download-thumb">
          <img src="${d.thumbnail}" alt="${d.title}">
        </div>
        <div class="download-info">
          <div class="download-title">${d.title}</div>
          <div class="download-size-badge"><i class="fa-solid fa-circle-check"></i> ${d.quality} • ${d.sizeMB}</div>
        </div>
        <button class="btn-delete-download" title="حذف">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;

      el.querySelector('.download-info').addEventListener('click', () => {
        PlayerController.loadVideo(d);
        this.showToast('جاري التشغيل من التنزيلات المحلية (بدون استهلاك إنترنت)');
      });

      el.querySelector('.btn-delete-download').addEventListener('click', (e) => {
        e.stopPropagation();
        StorageManager.removeDownload(d.id);
        this.loadDownloadsList();
        this.showToast('تم حذف الفيديو من التنزيلات');
      });

      list.appendChild(el);
    });
  },

  // Search Logic
  bindSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('btnClearSearch');
    const resultsContainer = document.getElementById('searchResultsList');

    document.getElementById('btnOpenSearch').addEventListener('click', () => {
      overlay.classList.add('open');
      input.focus();
    });

    document.getElementById('btnCloseSearch').addEventListener('click', () => {
      overlay.classList.remove('open');
      input.value = '';
      resultsContainer.innerHTML = '';
    });

    input.addEventListener('input', () => {
      clearBtn.style.display = input.value.trim() ? 'block' : 'none';
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      resultsContainer.innerHTML = '';
      input.focus();
    });

    const performSearch = async () => {
      const q = input.value.trim();
      if (!q) return;
      resultsContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> جاري البحث...</div>';
      const results = await VideoAPIService.search(q);
      resultsContainer.innerHTML = '';

      if (!results.length) {
        resultsContainer.innerHTML = '<div style="text-align:center; padding: 30px; color: var(--text-muted);">لم يتم العثور على نتائج مطابقة.</div>';
        return;
      }

      results.forEach(v => {
        const card = this.createVideoCardElement(v);
        card.addEventListener('click', () => {
          overlay.classList.remove('open');
        });
        resultsContainer.appendChild(card);
      });
    };

    document.getElementById('btnExecuteSearch').addEventListener('click', performSearch);
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') performSearch();
    });

    // Tag Cloud Quick Search
    document.querySelectorAll('.search-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        input.value = tag.getAttribute('data-query');
        clearBtn.style.display = 'block';
        performSearch();
      });
    });
  },

  // Library and Actions
  bindLibraryActions() {
    document.getElementById('btnClearHistory').addEventListener('click', () => {
      StorageManager.clearHistory();
      this.loadLibraryData();
      this.showToast('تم مسح سجل المشاهدة');
    });

    document.getElementById('btnClearDownloads').addEventListener('click', () => {
      StorageManager.clearDownloads();
      this.loadDownloadsList();
      this.showToast('تم مسح جميع التنزيلات');
    });

    document.getElementById('btnCreatePlaylist').addEventListener('click', () => {
      const name = prompt('أدخل اسم قائمة التشغيل الجديدة:');
      if (name && name.trim()) {
        StorageManager.createPlaylist(name.trim());
        this.loadLibraryData();
        this.showToast('تم إنشاء قائمة التشغيل بنجاح');
      }
    });

    // Video Action Buttons
    document.getElementById('btnSubscribe').addEventListener('click', () => {
      if (!PlayerController.currentVideo) return;
      const ch = PlayerController.currentVideo.channel;
      const isSub = StorageManager.toggleSubscription(ch);
      this.updateSubscribeButtonState(ch.id);
      this.showToast(isSub ? `تم الاشتراك في ${ch.name} 🔔` : `تم إلغاء الاشتراك`);
    });

    document.getElementById('btnLike').addEventListener('click', () => {
      if (!PlayerController.currentVideo) return;
      const liked = StorageManager.toggleLike(PlayerController.currentVideo);
      this.updateLikeButtonState(PlayerController.currentVideo.id);
      this.showToast(liked ? 'تمت الإضافة إلى الفيديوهات التي أعجبتك 👍' : 'تمت إزالة الإعجاب');
    });

    document.getElementById('btnSavePlaylist').addEventListener('click', () => {
      if (!PlayerController.currentVideo) return;
      const saved = StorageManager.toggleWatchLater(PlayerController.currentVideo);
      this.updateSaveButtonState(PlayerController.currentVideo.id);
      this.showToast(saved ? 'تم الحفظ في المشاهدة لاحقاً 📌' : 'تمت الإزالة من المشاهدة لاحقاً');
    });

    document.getElementById('btnDownload').addEventListener('click', () => {
      if (!PlayerController.currentVideo) return;
      this.showToast('جاري تنزيل الفيديو بدون إعلانات...');
      setTimeout(() => {
        StorageManager.addDownload(PlayerController.currentVideo, '1080p HD', '68.4 MB');
        this.showToast('تم اكتمال التنزيل بنجاح! متاح الآن بدون إنترنت 📥');
      }, 1000);
    });

    document.getElementById('btnShare').addEventListener('click', () => {
      if (navigator.share && PlayerController.currentVideo) {
        navigator.share({
          title: PlayerController.currentVideo.title,
          text: 'شاهد هذا الفيديو على NovaVance بدون إعلانات!',
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        this.showToast('تم نسخ الرابط إلى الحافظة');
      }
    });

    // Description & Comments Toggle Accordions
    document.getElementById('btnToggleDesc').addEventListener('click', () => {
      document.getElementById('descriptionCard').classList.toggle('open');
    });

    document.getElementById('btnToggleComments').addEventListener('click', () => {
      document.getElementById('commentsCard').classList.toggle('open');
    });
  },

  // Settings Modal Handlers
  bindSettings() {
    const modal = document.getElementById('settingsModal');
    const settings = StorageManager.getSettings();

    // Populate current settings into controls
    document.getElementById('settingSponsorBlock').checked = settings.sponsorBlock;
    document.getElementById('settingSkipIntro').checked = settings.skipIntro;
    document.getElementById('settingBgAudio').checked = settings.backgroundAudio;
    document.getElementById('settingDefaultQuality').value = settings.defaultQuality;
    document.getElementById('settingAmoled').checked = settings.amoledTheme;
    document.getElementById('settingSaveHistory').checked = settings.saveHistory;

    // Open / Close Modal
    document.getElementById('btnOpenSettings').addEventListener('click', () => {
      modal.classList.add('open');
    });
    document.getElementById('btnPlayerSettings').addEventListener('click', () => {
      modal.classList.add('open');
    });
    document.getElementById('btnCloseSettings').addEventListener('click', () => {
      modal.classList.remove('open');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    // Change listeners
    document.getElementById('settingSponsorBlock').addEventListener('change', (e) => {
      StorageManager.saveSettings({ sponsorBlock: e.target.checked });
      this.showToast(`SponsorBlock: ${e.target.checked ? 'مُفعّل' : 'مُعطّل'}`);
    });

    document.getElementById('settingSkipIntro').addEventListener('change', (e) => {
      StorageManager.saveSettings({ skipIntro: e.target.checked });
    });

    document.getElementById('settingBgAudio').addEventListener('change', (e) => {
      StorageManager.saveSettings({ backgroundAudio: e.target.checked });
    });

    document.getElementById('settingDefaultQuality').addEventListener('change', (e) => {
      StorageManager.saveSettings({ defaultQuality: e.target.value });
      this.showToast(`الجودة الافتراضية: ${e.target.value}`);
    });

    document.getElementById('settingAmoled').addEventListener('change', (e) => {
      StorageManager.saveSettings({ amoledTheme: e.target.checked });
      document.body.classList.toggle('theme-amoled', e.target.checked);
    });

    document.getElementById('settingSaveHistory').addEventListener('change', (e) => {
      StorageManager.saveSettings({ saveHistory: e.target.checked });
    });
  },

  // Update UI States
  updateSubscribeButtonState(channelId) {
    const isSub = StorageManager.isSubscribed(channelId);
    const btn = document.getElementById('btnSubscribe');
    if (isSub) {
      btn.classList.add('subscribed');
      btn.innerHTML = '<i class="fa-solid fa-check"></i><span>مشترك</span>';
    } else {
      btn.classList.remove('subscribed');
      btn.innerHTML = '<i class="fa-solid fa-bell"></i><span>اشتراك</span>';
    }
  },

  updateLikeButtonState(videoId) {
    const isLiked = StorageManager.isLiked(videoId);
    document.getElementById('btnLike').classList.toggle('active', isLiked);
  },

  updateSaveButtonState(videoId) {
    const isSaved = StorageManager.isWatchLater(videoId);
    document.getElementById('btnSavePlaylist').classList.toggle('active', isSaved);
  },

  // Render Related Videos
  async renderRelatedVideos(currentVideoId) {
    const container = document.getElementById('relatedVideosFeed');
    container.innerHTML = '';
    const related = await VideoAPIService.getRelatedVideos(currentVideoId);
    related.forEach(v => {
      container.appendChild(this.createVideoCardElement(v));
    });
  },

  // Render Comments
  renderComments(comments) {
    const list = document.getElementById('commentsExpandedList');
    list.innerHTML = '';
    document.getElementById('commentsCountBadge').textContent = comments.length ? (comments.length * 150) + '+' : '0';

    comments.forEach(c => {
      const item = document.createElement('div');
      item.className = 'comments-preview-item';
      item.innerHTML = `
        <img src="${c.avatar}" alt="${c.author}" class="comment-user-avatar">
        <div class="comment-preview-body">
          <div class="comment-author">${c.author} <span class="comment-time">${c.time}</span></div>
          <div class="comment-text">${c.text}</div>
        </div>
      `;
      list.appendChild(item);
    });
  },

  // Toast System
  showToast(message) {
    const toast = document.getElementById('appToast');
    const msgEl = toast.querySelector('.toast-message');
    msgEl.textContent = message;
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
};

// Bootstrap App
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
