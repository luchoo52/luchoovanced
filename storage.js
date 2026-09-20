/**
 * NovaVance - LocalStorage Data Manager
 * Handles user subscriptions, watch history with timestamps, likes, watch later, custom playlists, and settings.
 */

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'novavance_subs',
  HISTORY: 'novavance_history',
  LIKES: 'novavance_likes',
  WATCH_LATER: 'novavance_watch_later',
  PLAYLISTS: 'novavance_playlists',
  DOWNLOADS: 'novavance_downloads',
  SETTINGS: 'novavance_settings'
};

const DEFAULT_SETTINGS = {
  sponsorBlock: true,
  skipIntro: true,
  backgroundAudio: true,
  defaultQuality: '720p',
  amoledTheme: true,
  saveHistory: true,
  playbackSpeed: 1.0,
  autoplayNext: true
};

const StorageManager = {
  // Settings
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(newSettings) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },

  // Subscriptions
  getSubscriptions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) || [];
    } catch (e) {
      return [];
    }
  },

  isSubscribed(channelId) {
    const subs = this.getSubscriptions();
    return subs.some(s => s.id === channelId);
  },

  toggleSubscription(channel) {
    let subs = this.getSubscriptions();
    const index = subs.findIndex(s => s.id === channel.id);
    let isNowSubscribed = false;
    
    if (index >= 0) {
      subs.splice(index, 1);
      isNowSubscribed = false;
    } else {
      subs.unshift(channel);
      isNowSubscribed = true;
    }
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
    return isNowSubscribed;
  },

  // Watch History
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
    } catch (e) {
      return [];
    }
  },

  addToHistory(video, currentTime = 0, duration = 0) {
    const settings = this.getSettings();
    if (!settings.saveHistory) return;

    let history = this.getHistory();
    history = history.filter(item => item.id !== video.id);
    
    const progressPercent = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
    
    history.unshift({
      ...video,
      lastWatched: Date.now(),
      progressPercent,
      savedTime: currentTime
    });

    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  clearHistory() {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  },

  // Liked Videos
  getLikes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES)) || [];
    } catch (e) {
      return [];
    }
  },

  isLiked(videoId) {
    const likes = this.getLikes();
    return likes.some(v => v.id === videoId);
  },

  toggleLike(video) {
    let likes = this.getLikes();
    const index = likes.findIndex(v => v.id === video.id);
    let liked = false;
    if (index >= 0) {
      likes.splice(index, 1);
      liked = false;
    } else {
      likes.unshift(video);
      liked = true;
    }
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
    return liked;
  },

  // Watch Later
  getWatchLater() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCH_LATER)) || [];
    } catch (e) {
      return [];
    }
  },

  isWatchLater(videoId) {
    const list = this.getWatchLater();
    return list.some(v => v.id === videoId);
  },

  toggleWatchLater(video) {
    let list = this.getWatchLater();
    const index = list.findIndex(v => v.id === video.id);
    let saved = false;
    if (index >= 0) {
      list.splice(index, 1);
      saved = false;
    } else {
      list.unshift(video);
      saved = true;
    }
    localStorage.setItem(STORAGE_KEYS.WATCH_LATER, JSON.stringify(list));
    return saved;
  },

  // Downloads / Offline
  getDownloads() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOWNLOADS)) || [];
    } catch (e) {
      return [];
    }
  },

  addDownload(video, quality = '720p HD', sizeMB = '45.2 MB') {
    let downloads = this.getDownloads();
    if (!downloads.some(d => d.id === video.id)) {
      downloads.unshift({
        ...video,
        downloadedAt: Date.now(),
        quality,
        sizeMB
      });
      localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloads));
    }
  },

  removeDownload(videoId) {
    let downloads = this.getDownloads();
    downloads = downloads.filter(d => d.id !== videoId);
    localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloads));
  },

  clearDownloads() {
    localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify([]));
  },

  // Playlists
  getPlaylists() {
    try {
      const p = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYLISTS));
      if (p && p.length) return p;
      // Default sample playlists
      return [
        { id: 'pl_1', title: 'دروس البرمجة والذكاء الاصطناعي', count: 6, thumb: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop' },
        { id: 'pl_2', title: 'موسيقى هادئة للتركيز والعمل', count: 12, thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop' }
      ];
    } catch (e) {
      return [];
    }
  },

  createPlaylist(title) {
    let playlists = this.getPlaylists();
    const newPl = {
      id: 'pl_' + Date.now(),
      title,
      count: 0,
      thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop'
    };
    playlists.unshift(newPl);
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    return newPl;
  }
};
