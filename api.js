/**
 * NovaVance - Media Feeds & Public Streaming API Service
 * Provides catalog of high-definition open media, categories, SponsorBlock segments, and search index.
 */

const VideoAPIService = {
  // Public Media Library with Real HD Streams, Metadata & SponsorBlock Segments
  videosDatabase: [
    {
      id: 'vid_101',
      title: 'بناء تطبيقات الموبايل والويب الاحترافية في 2026 من الصفر | دورة شاملة',
      channel: {
        id: 'ch_tech_master',
        name: 'أكاديمية المطور العربي',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
        subs: '1.45M مشترك',
        verified: true
      },
      duration: '14:20',
      durationSec: 860,
      views: '430K مشاهدة',
      uploadedAt: 'منذ يومين',
      category: 'tech',
      quality: '1080p 60fps',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop',
      description: `في هذا الفيديو نستعرض معاً كل ما تحتاجه لبناء تطبيقات الهواتف والويب الذكية باستخدام أحدث التقنيات وأفضل الممارسات البرمجية.
      
📌 المحاور الرئيسية:
00:00 - المقدمة ونظرة عامة
00:15 - (مقطع ترويجي - سيتم تخطيه تلقائياً عبر SponsorBlock)
00:45 - إعداد بيئة التطوير
03:20 - تصميم الواجهات الحديثة AMOLED
08:10 - ربط الـ APIs وتشغيل الميديا في الخلفية
12:30 - تصدير تطبيق الـ APK للأندرويد`,
      sponsorSegments: [
        { start: 15, end: 45, category: 'sponsor', description: 'إعلان لخدمة استضافة سحابية' },
        { start: 780, end: 840, category: 'outro', description: 'شاشة النهاية والاشتراك' }
      ],
      comments: [
        { id: 'c1', author: 'عمر التميمي', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop', text: 'شرح أسطوري وتطبيق NovaVance تصميمه وميزاته خرافية بجد!', time: 'منذ 3 ساعات', likes: 182 },
        { id: 'c2', author: 'سارة المهندس', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop', text: 'تخطي الرعاة التلقائي SponsorBlock وفر عليا وقت كتير جداً 👍', time: 'منذ 5 ساعات', likes: 94 }
      ]
    },
    {
      id: 'vid_102',
      title: 'Lo-Fi Chill Beats 🌙 موسيقى هادئة للدراسة والاسترخاء والتركيز العميق 4K',
      channel: {
        id: 'ch_lofi_vibes',
        name: 'Lo-Fi Studio Arabia',
        avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop',
        subs: '3.8M مشترك',
        verified: true
      },
      duration: '10:53',
      durationSec: 653,
      views: '2.1M مشاهدة',
      uploadedAt: 'بث مباشر مسجل',
      category: 'music',
      quality: '4K Ultra',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&auto=format&fit=crop',
      description: 'مزيج فريد من الموسيقى الهادئة المصممة لتحفيز التركيز وزيادة الإنتاجية أثناء المذاكرة والعمل بدون أي إعلانات مزعجة.',
      sponsorSegments: [
        { start: 20, end: 40, category: 'sponsor', description: 'إعلان سماعات رأس' }
      ],
      comments: [
        { id: 'c3', author: 'ياسين نور', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop', text: 'أجمل ميزة إني بقدر أقفل شاشة الموبايل والصوت شغال في الخلفية!', time: 'منذ يوم', likes: 310 }
      ]
    },
    {
      id: 'vid_103',
      title: 'مراجعة أقوى معالجات وهواتف 2026: هل تستحق الترقية فعلاً؟',
      channel: {
        id: 'ch_tech_reviews',
        name: 'عالم التقنية الحديثة',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop',
        subs: '950K مشترك',
        verified: true
      },
      duration: '12:15',
      durationSec: 735,
      views: '512K مشاهدة',
      uploadedAt: 'منذ 4 أيام',
      category: 'tech',
      quality: '1080p 60fps',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop',
      description: 'مقارنة شاملة واختبارات أداء تفصيلية لأحدث الهواتف الذكية مع تجربة الألعاب والبطارية والشاشات.',
      sponsorSegments: [
        { start: 30, end: 60, category: 'sponsor', description: 'راعي الفيديو: متجر إلكتروني' }
      ],
      comments: [
        { id: 'c4', author: 'كريم سامي', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop', text: 'المقارنة موضوعية جداً ومفيدة، شكراً ليك.', time: 'منذ يومين', likes: 67 }
      ]
    },
    {
      id: 'vid_104',
      title: 'طبيعة سويسرا الساحرة بجودة 4K HDR | أصوات الطبيعة للاسترخاء والتأمل 🌿',
      channel: {
        id: 'ch_nature_4k',
        name: 'Nature Relaxation 4K',
        avatar: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=150&auto=format&fit=crop',
        subs: '5.2M مشترك',
        verified: true
      },
      duration: '09:56',
      durationSec: 596,
      views: '3.4M مشاهدة',
      uploadedAt: 'منذ أسبوع',
      category: 'nature',
      quality: '4K 60fps',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700&auto=format&fit=crop',
      description: 'جولة سينمائية خلابة في جبال الألب والبحيرات الطبيعية في سويسرا بدون إعلانات.',
      sponsorSegments: [],
      comments: [
        { id: 'c5', author: 'منى السعيد', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop', text: 'سبحان الله، الجودة والإخراج في قمة الروعة والراحة النفسية.', time: 'منذ 3 أيام', likes: 145 }
      ]
    },
    {
      id: 'vid_105',
      title: 'ملخص أفضل ألعاب العالم المفتوح وأقوى مغامرات هذا العام 🎮',
      channel: {
        id: 'ch_gamer_zone',
        name: 'Gamer Zone بالعربي',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop',
        subs: '1.8M مشترك',
        verified: true
      },
      duration: '15:30',
      durationSec: 930,
      views: '780K مشاهدة',
      uploadedAt: 'منذ يوم',
      category: 'gaming',
      quality: '1080p 60fps',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=700&auto=format&fit=crop',
      description: 'استعراض لأفضل 10 ألعاب عالم مفتوح جرافيكس عالي وقصص أسطورية تنافس بقوة هذا العام.',
      sponsorSegments: [
        { start: 25, end: 55, category: 'sponsor', description: 'إعلان منصة كروت شاشات' }
      ],
      comments: [
        { id: 'c6', author: 'محمود علي', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop', text: 'الجيم بلاي والتقييمات ممتازة جداً، بالتوفيق!', time: 'منذ 8 ساعات', likes: 52 }
      ]
    },
    {
      id: 'vid_106',
      title: 'بودكاست الذكاء الاصطناعي: كيف سيغير الذكاء الاصطناعي مهن المستقبل؟',
      channel: {
        id: 'ch_future_podcast',
        name: 'بودكاست المستقبل',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop',
        subs: '820K مشترك',
        verified: true
      },
      duration: '18:40',
      durationSec: 1120,
      views: '310K مشاهدة',
      uploadedAt: 'منذ 3 أيام',
      category: 'podcasts',
      quality: '1080p',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=700&auto=format&fit=crop',
      description: 'حوار عميق وممتع مع خبراء التكنولوجيا حول مستقبل العمل، البرمجة، والذكاء الاصطناعي التوليدي.',
      sponsorSegments: [
        { start: 10, end: 35, category: 'intro', description: 'مقدمة البودكاست والموسيقى' },
        { start: 45, end: 75, category: 'sponsor', description: 'إعلان تطبيق تعليمي' }
      ],
      comments: [
        { id: 'c7', author: 'هاني رضا', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop', text: 'حلقة غنية بالمعلومات وأفكار ملهمة جداً.', time: 'منذ يوم', likes: 88 }
      ]
    }
  ],

  // Featured Popular Channels
  featuredChannels: [
    {
      id: 'ch_tech_master',
      name: 'أكاديمية المطور',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
      subs: '1.45M مشترك',
      verified: true
    },
    {
      id: 'ch_lofi_vibes',
      name: 'Lo-Fi Studio',
      avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop',
      subs: '3.8M مشترك',
      verified: true
    },
    {
      id: 'ch_nature_4k',
      name: 'Nature 4K',
      avatar: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=150&auto=format&fit=crop',
      subs: '5.2M مشترك',
      verified: true
    },
    {
      id: 'ch_gamer_zone',
      name: 'Gamer Zone',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop',
      subs: '1.8M مشترك',
      verified: true
    },
    {
      id: 'ch_future_podcast',
      name: 'بودكاست المستقبل',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop',
      subs: '820K مشترك',
      verified: true
    }
  ],

  // Get Home Feed Videos filtered by Category
  async getFeed(category = 'all') {
    await new Promise(r => setTimeout(r, 120)); // ultra-snappy async
    if (!category || category === 'all' || category === 'trending') {
      return [...this.videosDatabase];
    }
    return this.videosDatabase.filter(v => v.category === category);
  },

  // Get Channel Story Avatars
  async getStoryChannels() {
    return [...this.featuredChannels];
  },

  // Search Videos and Channels
  async search(query) {
    await new Promise(r => setTimeout(r, 150));
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return this.videosDatabase.filter(v => 
      v.title.toLowerCase().includes(q) ||
      v.channel.name.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
    );
  },

  // Get Related Videos
  async getRelatedVideos(currentVideoId) {
    return this.videosDatabase.filter(v => v.id !== currentVideoId);
  },

  // Get Video By ID
  async getVideoById(videoId) {
    return this.videosDatabase.find(v => v.id === videoId) || this.videosDatabase[0];
  }
};
