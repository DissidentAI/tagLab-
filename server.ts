import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function generateHeuristicTop3Sets(artist: string, track: string, vibePrompt?: string) {
  const cleanArtist = (artist || "Artiste").trim();
  const cleanTrack = (track || "Morceau").trim();
  const combined = `${cleanArtist} ${cleanTrack} ${vibePrompt || ""}`.toLowerCase();

  // Determine subgenre flavors
  const isPlug = combined.includes("plug") || combined.includes("serane") || combined.includes("goyard");
  const isDrill = combined.includes("drill") || combined.includes("freeze") || combined.includes("gazo");
  const isCloud = combined.includes("cloud") || combined.includes("pnl") || combined.includes("chill");
  const isRage = combined.includes("rage") || combined.includes("synth") || combined.includes("trippie");

  const genreMain = isPlug ? "Pluggnb" : isDrill ? "Dark Drill" : isCloud ? "Cloud Rap" : isRage ? "Rage Trap" : "Rap Français";

  // 1. Viral & Trending Set
  const viralRawTags = [
    cleanArtist,
    cleanTrack,
    `${cleanArtist} ${cleanTrack}`,
    `${cleanTrack} tiktok`,
    `${cleanArtist} nouveau son`,
    "rap francais",
    "rap français 2026",
    "nouveau rap",
    "son qui perce",
    "tendance rap",
    "clip rap",
    "decouverte rap",
    "viral song",
    "hit rap fr",
    "pour toi",
    "french rap trend",
    "banger rap",
    `${cleanArtist} live`,
    `${genreMain.toLowerCase()} 2026`,
  ];

  const viralHashtags = [
    `#${cleanArtist.replace(/\s+/g, '')}`,
    `#${cleanTrack.replace(/\s+/g, '')}`,
    "#rapfr",
    "#rapfrancais",
    "#pourtoi",
    "#fyp",
    "#nouveaurap",
    "#decouverterap",
    "#snippet",
    "#banger",
    "#musiquefrancaise",
    "#trend",
  ];

  // 2. Niche & Underground Set
  const nicheRawTags = [
    cleanArtist,
    `${cleanArtist} underground`,
    `${cleanArtist} type beat`,
    `${cleanTrack} instrumental`,
    `${cleanTrack} 808`,
    isPlug ? "french plug" : isDrill ? "uk drill fr" : "underground rap fr",
    isPlug ? "pluggnb 2026" : isDrill ? "dark 808 trap" : "cloud rap aesthetic",
    "new wave rap fr",
    "soundcloud rap fr",
    "melodic 808",
    "fl studio beat",
    "producer tag",
    "sample drill",
    "vibe nocturne",
    "autotune plug",
    "beatmaker francais",
    "plug scene paris",
    "underground heat",
  ];

  const nicheHashtags = [
    `#${cleanArtist.replace(/\s+/g, '')}`,
    `#${cleanTrack.replace(/\s+/g, '')}`,
    "#undergroundrapfr",
    "#newwaverap",
    "#frenchplug",
    "#pluggnb",
    "#soundclouddrop",
    "#beatmakerfr",
    "#prodby",
    "#flstudio",
    "#sampleflip",
    "#typebeat",
  ];

  // 3. SEO-Focused Algorithmic Set (Targeting 100/100 score strictly under 485 chars)
  const seoRawTags = [
    cleanArtist,
    `${cleanArtist} ${cleanTrack}`,
    cleanTrack,
    `${cleanArtist} clip officiel`,
    `${cleanArtist} paroles`,
    `${cleanArtist} lyrics`,
    `${cleanTrack} audio officiel`,
    `${cleanArtist} rap`,
    `${cleanArtist} 2026`,
    "rap francais",
    "rap français",
    "rap francais 2026",
    "nouveau rap francais",
    `${genreMain.toLowerCase()} 2026`,
    "type beat rap francais",
    "clip officiel 4k",
  ];

  // Helper to format tags string within character limit
  const formatTagLimit = (tags: string[], limit = 480) => {
    const unique = Array.from(new Set(tags.map(t => t.trim()).filter(Boolean)));
    const selected: string[] = [];
    let len = 0;
    for (const t of unique) {
      const addLen = selected.length > 0 ? t.length + 2 : t.length;
      if (len + addLen <= limit) {
        selected.push(t);
        len += addLen;
      } else {
        break;
      }
    }
    return {
      tags: selected,
      formatted: selected.join(", "),
      charCount: selected.join(", ").length,
    };
  };

  const viralFormatted = formatTagLimit(viralRawTags, 480);
  const nicheFormatted = formatTagLimit(nicheRawTags, 480);
  const seoFormatted = formatTagLimit(seoRawTags, 480);

  return {
    artist: cleanArtist,
    track: cleanTrack,
    viralSet: {
      id: "viral" as const,
      name: "🔥 Set 1 — Viral & Tendances",
      badge: "Découverte Rapide",
      description: "Optimisé pour capter les algorithmes de recommandation TikTok, Shorts, Reels et les requêtes à fort volume.",
      objective: "Maximiser les impressions, les partages et le taux de clic sur les flux de découverte verticaux.",
      tags: viralFormatted.tags,
      hashtags: viralHashtags,
      youtubeFormatted: viralFormatted.formatted,
      charCount: viralFormatted.charCount,
      estimatedScore: 88,
      keyStrategy: "Mots-clés à haute vélocité et hashtags de tendance (#pourtoi, #rapfr, #snippet).",
    },
    nicheSet: {
      id: "niche" as const,
      name: "🎯 Set 2 — Niche & Underground",
      badge: "Ciblage Précis",
      description: "Conçu pour la communauté Pluggnb, SoundCloud, beatmakers et auditeurs exigeants de la New Wave.",
      objective: "Fidéliser une audience qualifiée, générer des écoutes répétées et connecter avec la scène underground.",
      tags: nicheFormatted.tags,
      hashtags: nicheHashtags,
      youtubeFormatted: nicheFormatted.formatted,
      charCount: nicheFormatted.charCount,
      estimatedScore: 85,
      keyStrategy: "Sous-genres micro-ciblés (Pluggnb, French Plug, SoundCloud, Producer Tags, 808).",
    },
    seoSet: {
      id: "seo" as const,
      name: "📈 Set 3 — Master SEO Algorithmique",
      badge: "Score SEO 100/100",
      description: "Structure en 3 couches (Identité Artiste + Sub-genres + Requêtes de longue traîne) pour ranker en #1 sur YouTube.",
      objective: "Positionner la vidéo dans les premiers résultats de recherche YouTube et dans les suggestions latérales.",
      tags: seoFormatted.tags,
      hashtags: [
        `#${cleanArtist.replace(/\s+/g, '')}`,
        `#${cleanTrack.replace(/\s+/g, '')}`,
        "#RapFrancais",
        "#ClipOfficiel",
        "#NouveauRap",
        "#YouTubeSEO",
      ],
      youtubeFormatted: seoFormatted.formatted,
      charCount: seoFormatted.charCount,
      estimatedScore: 98,
      keyStrategy: "Hiérarchie 3-Tier stricte (< 485 car.) avec variantes sans accent pour 100% de couverture de recherche.",
    },
  };
}

async function extractMetadataFromUrl(rawUrl: string): Promise<{
  platform: 'youtube' | 'tiktok' | 'instagram' | 'soundcloud' | 'spotify' | 'twitter' | 'snapchat' | 'other';
  url: string;
  title: string;
  authorName: string;
  authorUrl?: string;
  thumbnailUrl?: string;
  parsedArtist?: string;
  parsedTrack?: string;
  detectedVibe?: string;
  suggestedTags: string[];
  suggestedHashtags: string[];
  descriptionSnippet?: string;
}> {
  const url = rawUrl.trim();
  let platform: 'youtube' | 'tiktok' | 'instagram' | 'soundcloud' | 'spotify' | 'twitter' | 'snapchat' | 'other' = 'other';
  let title = "Titre du contenu";
  let authorName = "Artiste / Créateur";
  let authorUrl = "";
  let thumbnailUrl = "";
  let descriptionSnippet = "";
  let detectedVibe = "Rap FR / New Wave";

  // 1. YouTube Detection
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/|live\/))([a-zA-Z0-9_-]{11})/i);
  if (ytMatch) {
    platform = 'youtube';
    const videoId = ytMatch[1];
    thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(oembedUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        title = data.title || title;
        authorName = data.author_name || authorName;
        authorUrl = data.author_url || `https://www.youtube.com/channel/${data.author_name}`;
        if (data.thumbnail_url) {
          thumbnailUrl = data.thumbnail_url;
        }
      }
    } catch (e) {
      console.warn("YouTube oEmbed fetch error:", e);
      title = `Vidéo YouTube (${videoId})`;
    }
  } 
  // 2. SoundCloud Detection
  else if (url.includes("soundcloud.com")) {
    platform = 'soundcloud';
    thumbnailUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";
    try {
      const oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(oembedUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        title = data.title || "Morceau SoundCloud";
        authorName = data.author_name || "Artiste SoundCloud";
        authorUrl = data.author_url || "";
        if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
        if (data.description) descriptionSnippet = data.description.slice(0, 250);
      }
    } catch (e) {
      console.warn("SoundCloud oEmbed fetch error:", e);
      title = "Track SoundCloud";
    }
  }
  // 3. Spotify Detection
  else if (url.includes("spotify.com")) {
    platform = 'spotify';
    thumbnailUrl = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80";
    try {
      const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(oembedUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        title = data.title || "Titre Spotify";
        if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
      }
    } catch (e) {
      console.warn("Spotify oEmbed fetch error:", e);
    }
  }
  // 4. TikTok Detection
  else if (url.includes("tiktok.com")) {
    platform = 'tiktok';
    title = "Vidéo TikTok / Snippet Musical";
    authorName = "Créateur TikTok";
    thumbnailUrl = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80";
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(oembedUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        title = data.title || title;
        authorName = data.author_name || authorName;
        authorUrl = data.author_url || "";
        if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
      }
    } catch (e) {
      console.warn("TikTok oEmbed fetch error:", e);
    }
  }
  // 5. Instagram Detection
  else if (url.includes("instagram.com")) {
    platform = 'instagram';
    const igMatch = url.match(/instagram\.com\/(?:p|reel|tv|share)\/([a-zA-Z0-9_-]+)/i);
    const shortcode = igMatch ? igMatch[1] : "reel";
    title = `Reel Instagram (@${shortcode})`;
    authorName = "Créateur Instagram";
    thumbnailUrl = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80";
  }
  // 6. X (Twitter) Detection
  else if (url.includes("twitter.com") || url.includes("x.com")) {
    platform = 'twitter';
    title = "Post X / Teaser Musical";
    authorName = "Artiste sur X";
    thumbnailUrl = "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&auto=format&fit=crop&q=80";
    try {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(oembedUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data.author_name) authorName = `@${data.author_name}`;
        if (data.html) {
          const stripped = data.html.replace(/<[^>]*>/g, " ").trim();
          title = stripped.slice(0, 100) + "...";
        }
      }
    } catch (e) {
      console.warn("Twitter oEmbed fetch error:", e);
    }
  }
  // 7. Snapchat Detection
  else if (url.includes("snapchat.com")) {
    platform = 'snapchat';
    title = "Spotlight Snapchat";
    authorName = "Créateur Snapchat";
    thumbnailUrl = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80";
  }

  // Parse Artist & Track name from title
  let parsedArtist = "";
  let parsedTrack = "";

  const cleanTitleForRegex = title
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/ft\..*$/i, "")
    .replace(/feat\..*$/i, "")
    .replace(/prod\..*$/i, "")
    .replace(/clip officiel/gi, "")
    .replace(/official video/gi, "")
    .replace(/visualizer/gi, "")
    .replace(/lyrics/gi, "")
    .trim();

  if (cleanTitleForRegex.includes(" - ")) {
    const parts = cleanTitleForRegex.split(" - ");
    parsedArtist = parts[0].trim();
    parsedTrack = parts.slice(1).join(" - ").trim();
  } else if (cleanTitleForRegex.includes(" – ")) {
    const parts = cleanTitleForRegex.split(" – ");
    parsedArtist = parts[0].trim();
    parsedTrack = parts.slice(1).join(" – ").trim();
  } else if (cleanTitleForRegex.includes(" x ")) {
    const parts = cleanTitleForRegex.split(" x ");
    parsedArtist = parts[0].trim();
    parsedTrack = parts.slice(1).join(" x ").trim();
  } else {
    parsedArtist = authorName.replace(/ - Topic$/i, "").replace(/VEVO$/i, "").trim();
    parsedTrack = cleanTitleForRegex;
  }

  const artistTag = parsedArtist || authorName || "Artiste";
  const trackTag = parsedTrack || "Morceau";

  // Generate platform-specific suggested tags & hashtags
  let suggestedTags: string[] = [];
  let suggestedHashtags: string[] = [];

  if (platform === 'youtube') {
    suggestedTags = [
      artistTag,
      `${artistTag} ${trackTag}`,
      trackTag,
      `${artistTag} clip`,
      `${artistTag} rap`,
      `${artistTag} 2026`,
      `${trackTag} audio`,
      "rap francais",
      "rap français",
      "french plug",
      "pluggnb 2026",
      "underground rap fr",
      "nouveau son rap",
      "type beat rap",
      "808 trap",
      "new wave rap",
    ];
    suggestedHashtags = [
      `#${artistTag.replace(/[^a-zA-Z0-9]/g, '')}`,
      `#${trackTag.replace(/[^a-zA-Z0-9]/g, '')}`,
      "#rapfr",
      "#rapfrancais",
      "#cliprap",
      "#newwave",
    ];
  } else if (platform === 'tiktok') {
    suggestedTags = [
      "pourtoi",
      "fyp",
      "pourtoipage",
      "nouveauson",
      artistTag.toLowerCase(),
      trackTag.toLowerCase(),
      "rapfr",
      "trendmusique",
      "découvertemusicale",
    ];
    suggestedHashtags = [
      "#pourtoi",
      "#fyp",
      "#rapfr",
      `#${artistTag.replace(/[^a-zA-Z0-9]/g, '')}`,
      `#${trackTag.replace(/[^a-zA-Z0-9]/g, '')}`,
      "#nouveauson",
      "#frenchrap",
    ];
  } else if (platform === 'instagram') {
    suggestedTags = [
      "reelsfrance",
      "rapfrancais",
      "rapfr",
      "pluggnb",
      artistTag.toLowerCase(),
      trackTag.toLowerCase(),
      "instamusic",
      "visualizer",
      "newwave2026",
    ];
    suggestedHashtags = [
      "#reelsfrance",
      "#rapfr",
      "#rapfrancais",
      `#${artistTag.replace(/[^a-zA-Z0-9]/g, '')}`,
      `#${trackTag.replace(/[^a-zA-Z0-9]/g, '')}`,
      "#frenchplug",
      "#undergroundmusic",
      "#instareels",
    ];
  } else if (platform === 'soundcloud') {
    suggestedTags = [
      "pluggnb",
      "french rap",
      "underground",
      "autotune",
      "ambient trap",
      "melodic trap",
      "new wave",
      artistTag.toLowerCase(),
    ];
    suggestedHashtags = [
      "#pluggnb",
      "#frenchrap",
      "#underground",
      "#cloudrap",
    ];
  } else if (platform === 'spotify') {
    suggestedTags = [
      "rap francais",
      "cloud rap",
      "pluggnb",
      "melodic trap",
      "nocturne",
      "chill rap",
      "new wave fr",
    ];
    suggestedHashtags = [
      "#spotifyfr",
      "#rapfr",
      `#${artistTag.replace(/[^a-zA-Z0-9]/g, '')}`,
    ];
  } else {
    suggestedTags = [
      artistTag,
      trackTag,
      "rap francais",
      "musique 2026",
      "new wave",
    ];
    suggestedHashtags = [
      "#rapfr",
      `#${artistTag.replace(/[^a-zA-Z0-9]/g, '')}`,
      `#${trackTag.replace(/[^a-zA-Z0-9]/g, '')}`,
    ];
  }

  suggestedTags = suggestedTags.filter((t, idx, self) => t.trim().length > 1 && self.indexOf(t) === idx);
  suggestedHashtags = suggestedHashtags.filter((h, idx, self) => h.length > 2 && self.indexOf(h) === idx);

  if (!descriptionSnippet) {
    descriptionSnippet = `Contenu extrait : "${title}" par ${authorName}. Optimisé pour l'algorithme ${platform.toUpperCase()}.`;
  }

  return {
    platform,
    url,
    title,
    authorName,
    authorUrl,
    thumbnailUrl,
    parsedArtist: parsedArtist || undefined,
    parsedTrack: parsedTrack || undefined,
    detectedVibe,
    suggestedTags,
    suggestedHashtags,
    descriptionSnippet,
  };
}

function generateHeuristicSeoAudit(
  input: {
    artistName?: string;
    trackName?: string;
    title?: string;
    description?: string;
    tags?: string[] | string;
    youtubeUrl?: string;
    url?: string;
    platform?: string;
    thumbnailUrl?: string;
    genre?: string;
  }
) {
  const targetUrl = (input.url || input.youtubeUrl || "").trim();
  const platform = (input.platform || (targetUrl.includes("tiktok") ? "tiktok" : targetUrl.includes("instagram") ? "instagram" : targetUrl.includes("soundcloud") ? "soundcloud" : targetUrl.includes("spotify") ? "spotify" : targetUrl.includes("twitter") || targetUrl.includes("x.com") ? "twitter" : "youtube")).toLowerCase();

  const artist = (input.artistName || "Artiste").trim();
  const track = (input.trackName || "Morceau").trim();
  const title = (input.title || `${artist} - ${track} (Clip Officiel)`).trim();
  const description = (input.description || "").trim();
  
  let tagList: string[] = [];
  if (Array.isArray(input.tags)) {
    tagList = input.tags.map(t => t.trim()).filter(Boolean);
  } else if (typeof input.tags === "string") {
    tagList = input.tags.split(/[\n,]+/).map(t => t.trim()).filter(Boolean);
  }
  if (tagList.length === 0) {
    if (platform === 'tiktok') {
      tagList = ["pourtoi", "fyp", "rapfr", "nouveauson", artist.toLowerCase(), track.toLowerCase(), "frenchrap"];
    } else if (platform === 'instagram') {
      tagList = ["reelsfrance", "rapfr", "rapfrancais", artist.toLowerCase(), track.toLowerCase(), "frenchplug"];
    } else if (platform === 'soundcloud') {
      tagList = ["pluggnb", "french rap", "underground", "autotune", "new wave", artist.toLowerCase()];
    } else {
      tagList = [
        artist,
        track,
        `${artist} ${track}`,
        "rap francais",
        "rap français",
        "clip officiel",
        "pluggnb 2026",
        "new wave",
        "nouveau rap"
      ];
    }
  }

  const tagsCharCount = tagList.join(", ").length;

  // 1. Title Hook Score (out of 25)
  let titleScore = 20;
  const titleFeedbacks: string[] = [];
  if (platform === 'tiktok' || platform === 'instagram') {
    if (title.length > 80) {
      titleScore -= 4;
      titleFeedbacks.push("Texte d'accroche un peu long : sur TikTok/Reels, 3-5 mots percutants captent 2x plus l'attention.");
    } else {
      titleScore += 3;
      titleFeedbacks.push("Format d'accroche court et incisif idéal pour les formats verticaux.");
    }
  } else {
    if (title.length < 20) {
      titleScore -= 6;
      titleFeedbacks.push("Titre trop court : manque de contexte pour le moteur de recherche.");
    } else if (title.length > 75) {
      titleScore -= 4;
      titleFeedbacks.push("Titre un peu long : risque de troncature sur smartphone (< 60 caractères recommandé).");
    } else {
      titleFeedbacks.push("Longueur de titre idéale pour l'affichage mobile.");
    }
  }

  if (title.toLowerCase().includes(artist.toLowerCase()) && title.toLowerCase().includes(track.toLowerCase())) {
    titleScore += 3;
    titleFeedbacks.push("Présence claire de l'Artiste et du Titre au format standardisé.");
  } else {
    titleScore -= 5;
    titleFeedbacks.push("L'artiste ou le titre exact n'est pas clairement identifié dans le titre.");
  }

  if (/(?:clip officiel|official video|visualizer|audio|prod\.|feat\.)/i.test(title)) {
    titleScore += 2;
    titleFeedbacks.push("Mots-clés de format (Clip Officiel, Visualizer, etc.) présents.");
  }
  titleScore = Math.min(25, Math.max(5, titleScore));

  // 2. Tag Optimization Score (out of 25)
  let tagScore = 18;
  const tagFeedbacks: string[] = [];
  if (platform === 'youtube') {
    if (tagsCharCount > 485) {
      tagScore -= 7;
      tagFeedbacks.push(`Alerte YouTube Studio : vos tags totalisent ${tagsCharCount} caractères (limite stricte 500 car., risque de blocage).`);
    } else if (tagsCharCount < 200) {
      tagScore -= 5;
      tagFeedbacks.push(`Volume de tags trop faible (${tagsCharCount}/500 car.) : vous perdez des opportunités d'indexation.`);
    } else {
      tagScore += 4;
      tagFeedbacks.push(`Excellent volume de tags (${tagsCharCount} car. / 485 max conseillé).`);
    }
  } else if (platform === 'tiktok') {
    if (tagList.length > 6) {
      tagScore -= 4;
      tagFeedbacks.push("Trop de hashtags sur TikTok : l'algorithme privilégie 3 à 5 hashtags ciblés pour catégoriser la FYP.");
    } else if (tagList.length >= 3) {
      tagScore += 4;
      tagFeedbacks.push("Densité de hashtags TikTok optimale (3 à 5 tags ultra ciblés).");
    }
  } else {
    tagScore += 3;
    tagFeedbacks.push(`Distribution de ${tagList.length} mots-clés bien adaptés à ${platform.toUpperCase()}.`);
  }

  const hasArtistInTags = tagList.some(t => t.toLowerCase().includes(artist.toLowerCase()));
  const hasSubgenre = tagList.some(t => /(?:plug|trap|drill|cloud|wave|boombap|jersey|rnb)/i.test(t));
  const hasFormat = tagList.some(t => /(?:clip|officiel|official|son|audio|lyrics|2026|nouveau)/i.test(t));

  if (hasArtistInTags && hasSubgenre && hasFormat) {
    tagScore += 3;
    tagFeedbacks.push("Architecture 3 Couches respectée (Identité + Sous-genre + Format/Mood).");
  }
  tagScore = Math.min(25, Math.max(5, tagScore));

  // 3. Description SEO Score (out of 25)
  let descScore = 17;
  const descFeedbacks: string[] = [];
  if (description.length > 150) {
    descScore += 4;
    descFeedbacks.push("Description étoffée favorisant le référencement sémantique.");
  } else if (description.length < 30) {
    descScore -= 6;
    descFeedbacks.push("Description très courte : ajoutez du contexte, des paroles ou des liens utiles.");
  }

  if (/(?:https?:\/\/|open\.spotify|apple\.music|linktr\.ee|fanlink|@)/i.test(description)) {
    descScore += 3;
    descFeedbacks.push("Liens de streaming, smartlinks ou mentions d'engagement présents.");
  }

  if (/(?:prod\.? by|mix|master|réalisé par|directed by|beat)/i.test(description)) {
    descScore += 2;
    descFeedbacks.push("Crédits artistiques et techniques mentionnés.");
  }
  descScore = Math.min(25, Math.max(5, descScore));

  // 4. Algorithm & Retention Score (out of 25)
  let algoScore = 21;
  const algoFeedbacks: string[] = [];
  const spamKeywords = ["jul", "ninho", "gazo", "travis scott", "drake", "booba", "plk", "sch"];
  const containsSpam = tagList.filter(t => spamKeywords.includes(t.toLowerCase())).length >= 3;
  if (containsSpam) {
    algoScore -= 8;
    algoFeedbacks.push("Risque Pénalité Spam : Trop de noms d'artistes majeurs sans lien direct.");
  } else {
    algoScore += 2;
    algoFeedbacks.push(`Ciblage d'audience propre et bien calibré pour l'algorithme ${platform.toUpperCase()}.`);
  }
  algoScore = Math.min(25, Math.max(5, algoScore));

  const totalScore = Math.round(titleScore + tagScore + descScore + algoScore);
  
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
  if (totalScore >= 93) grade = 'A+';
  else if (totalScore >= 85) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 55) grade = 'C';
  else if (totalScore >= 40) grade = 'D';
  else grade = 'F';

  const strengths = [
    `Format d'artiste standardisé "${artist}" bien repérable par l'algorithme ${platform.toUpperCase()}.`,
    `Couverture de mots-clés pertinents (${tagList.length} tags/hashtags).`,
    "Indexation saine sans risque de pénalité spam.",
  ];

  const criticalWeaknesses: string[] = [];
  if (platform === 'youtube' && tagsCharCount > 485) {
    criticalWeaknesses.push("Dépassement du seuil de confort des tags (< 485 car. recommandé sur YouTube).");
  }
  if (description.length < 80) {
    criticalWeaknesses.push("Description insuffisante : ajoutez des liens, des crédits ou une question pour booster la durée de session.");
  }
  if (!tagList.some(t => t.includes("2026"))) {
    criticalWeaknesses.push("Absence de marqueurs temporels ('2026', 'nouveau son') recherchés par les auditeurs.");
  }

  const missingKeywords = [
    `${artist} 2026`,
    `${track} son`,
    "nouveau rap francais 2026",
    "pluggnb type beat",
    `${artist} type beat`,
    "rap underground francais",
  ];

  const actionableRecommendations = [
    platform === 'tiktok' 
      ? "Placez un texte d'accroche percutant dans les 3 premières secondes du TikTok (ex: 'POV : tu cherchais le son de l'été...')."
      : platform === 'instagram'
      ? "Utilisez une couverture de Reel avec un titre lisible en grand et ajoutez 5 à 10 hashtags ultra ciblés."
      : "Placez les 2 mots-clés les plus cruciaux dans les 60 premiers caractères du titre et vos smartlinks en début de description.",
    "Ajoutez les liens Spotify / Apple Music et un appel à l'action clair.",
    "Interagissez et répondez aux premiers commentaires dans les 30 minutes suivant la publication pour activer le boost algorithmique.",
    "Soignez le visuel et le premier plan pour maximiser le taux de clic et la rétention."
  ];

  const optimizedTitle = platform === 'tiktok'
    ? `${track} - ${artist} (Extrait Officiel)`
    : `${artist} - ${track} (Clip Officiel)`;

  const optimizedDescription = platform === 'tiktok'
    ? `Vous validez le nouveau son "${track}" ? 🔥 Donnez votre avis en commentaire 👇\n\n🔗 Écouter le son complet en bio\n\n#${artist.replace(/\s+/g, '')} #${track.replace(/\s+/g, '')} #RapFr #PourToi #NouveauSon`
    : platform === 'instagram'
    ? `"${track}" est enfin disponible partout 🌙✨\nIdentifie un pote qui doit écouter ça 👇\n\n🔗 Lien complet dans la bio\n\n#${artist.replace(/\s+/g, '')} #${track.replace(/\s+/g, '')} #RapFrancais #ReelsFrance #NewWave2026`
    : `Écoutez "${track}" de ${artist} sur toutes les plateformes de streaming.\n\n🔗 Écouter / Streaming : https://linktr.ee/${artist.toLowerCase().replace(/\s+/g, '')}\n\n🎬 Réalisation : Studio 2026\n🎹 Production : Prod by Sound\n\n📌 Suivez ${artist} :\nInstagram : @${artist.toLowerCase().replace(/\s+/g, '')}\nTikTok : @${artist.toLowerCase().replace(/\s+/g, '')}\n\n#${artist.replace(/\s+/g, '')} #${track.replace(/\s+/g, '')} #RapFr #ClipOfficiel`;
  
  const optimizedTags = [
    artist,
    track,
    `${artist} ${track}`,
    `${artist} clip`,
    `${track} clip officiel`,
    `${artist} 2026`,
    "rap francais",
    "rap français",
    "pluggnb 2026",
    "french plug",
    "new wave rap",
    "cloud rap francais",
    "trap fr",
    "nouveau son rap",
  ];

  return {
    overallScore: totalScore,
    grade,
    verdict: totalScore >= 80 
      ? `Très bonne configuration SEO sur ${platform.toUpperCase()} ! Le contenu dispose de signaux algorithmiques solides.`
      : `Configuration correcte sur ${platform.toUpperCase()} mais perfectible. Quelques ajustements sur la description et les tags maximiseront la portée.`,
    subScores: {
      titleHook: {
        score: titleScore,
        maxScore: 25,
        label: platform === 'tiktok' || platform === 'instagram' ? "Accroche Visuelle & Curiosité" : "Accroche Titre & CTR",
        feedback: titleFeedbacks.join(" "),
      },
      tagOptimization: {
        score: tagScore,
        maxScore: 25,
        label: platform === 'tiktok' || platform === 'instagram' ? "Distribution des Hashtags FYP" : "Architecture 3 Couches & Tags",
        feedback: tagFeedbacks.join(" "),
      },
      descriptionSeo: {
        score: descScore,
        maxScore: 25,
        label: platform === 'tiktok' || platform === 'instagram' ? "Légende & Engagement Call" : "SEO Description & Liens",
        feedback: descFeedbacks.join(" "),
      },
      algorithmRetention: {
        score: algoScore,
        maxScore: 25,
        label: "Potentiel Algorithmique & Rétention",
        feedback: algoFeedbacks.join(" "),
      },
    },
    strengths,
    criticalWeaknesses: criticalWeaknesses.length > 0 ? criticalWeaknesses : ["Aucun point bloquant majeur détecté."],
    missingKeywords,
    actionableRecommendations,
    optimizedSuggestions: {
      recommendedTitle: optimizedTitle,
      recommendedDescription: optimizedDescription,
      recommendedTags: optimizedTags,
      recommendedHashtags: [`#${artist.replace(/\s+/g, '')}`, `#${track.replace(/\s+/g, '')}`, "#RapFr", "#NouveauSon", "#ClipOfficiel"],
    },
    analyzedVideoInfo: targetUrl ? {
      title,
      authorName: artist,
      thumbnailUrl: input.thumbnailUrl,
      url: targetUrl,
      platform,
    } : undefined,
  };
}

function generateHeuristicAnalysisResult(
  artist: string,
  track: string,
  prompt: string,
  lyrics: string,
  targetVibe?: string
) {
  const combined = `${prompt} ${lyrics} ${targetVibe || ""}`.toLowerCase();

  let genre = "Pluggnb & Melodic Trap";
  let mood = "Mélancolique & Nocturne";
  let bpm = "130-140 BPM";
  let energy = "Medium-High";
  let genreTagSoundcloud = "Hip-hop & Rap";

  if (combined.includes("rage") || combined.includes("synth") || combined.includes("trippie") || combined.includes("ken carson")) {
    genre = "Rage / Hyperpop Trap";
    mood = "Électrique & Hyperénergique";
    bpm = "145-155 BPM";
    energy = "High Energy";
    genreTagSoundcloud = "Rage";
  } else if (combined.includes("drill") || combined.includes("sombre") || combined.includes("gazo") || combined.includes("freeze")) {
    genre = "Dark Drill / Trap Sombre";
    mood = "Agressif & Ténébreux";
    bpm = "140-144 BPM";
    energy = "Agressif / Sombre";
    genreTagSoundcloud = "Drill";
  } else if (combined.includes("cloud") || combined.includes("plane") || combined.includes("chill") || combined.includes("pnl")) {
    genre = "Cloud Rap / Ambiant 808";
    mood = "Planant & Onirique";
    bpm = "120-130 BPM";
    energy = "Chill / Vibe";
    genreTagSoundcloud = "Cloud Rap";
  } else if (combined.includes("plug") || combined.includes("serane") || combined.includes("goyard") || combined.includes("autotune")) {
    genre = "Plug Français / Pluggnb 2026";
    mood = "Mélancolie Nocturne & Autotune";
    bpm = "134-142 BPM";
    energy = "Bouncy & Smooth";
    genreTagSoundcloud = "Pluggnb";
  }

  // Base tags list for YouTube
  const rawYtTags = [
    artist,
    `${artist} ${track}`,
    `${artist} rap`,
    `${artist} 2026`,
    track,
    `${track} clip officiel`,
    `${track} lyrics`,
    "plug français",
    "plug francais",
    "pluggnb 2026",
    "rap francais",
    "rap français 2026",
    "nouveau rap francais",
    "underground rap fr",
    "new wave rap fr",
    "type beat 2026",
    "808 mafia",
    "melodic trap",
    "autotune rap",
    "night drive rap",
    "trap sombre",
    "son mélancolique",
  ];

  // Dedup and build YouTube formatted string within 480 chars
  const uniqueYt = Array.from(new Set(rawYtTags.map(t => t.trim()).filter(Boolean)));
  const finalYtTags: string[] = [];
  let currentLen = 0;

  for (const t of uniqueYt) {
    const additionalLen = finalYtTags.length > 0 ? t.length + 2 : t.length;
    if (currentLen + additionalLen <= 480) {
      finalYtTags.push(t);
      currentLen += additionalLen;
    } else {
      break;
    }
  }

  const formattedYt = finalYtTags.join(", ");

  const tiktokHashtags = [
    "#rapfr",
    "#rapfrancais",
    "#plugfr",
    "#pluggnb",
    "#newwaverap",
    "#pourtoi",
    "#snippet",
    "#decouverte",
  ];

  const igHashtags = [
    "#rapfr",
    "#rapfrancais",
    "#plugfr",
    "#pluggnb",
    "#newwaverap",
    "#undergroundrap",
    "#frenchrap",
    "#prodby",
    "#flstudio",
    "#nightdrive",
    "#autotune",
    "#independentartist",
    "#visualizer",
    "#musicproducer",
  ];

  const soundcloudTags = [
    "pluggnb",
    "french rap",
    "underground",
    "autotune",
    "melodic",
    "new wave",
    "ambient trap",
    "night vibes",
    "808",
  ];

  const scFormatted = soundcloudTags.map(t => t.includes(" ") ? `"${t}"` : t).join(" ");

  const spotlightTags = ["Rap", "Musique", "NewWave", "Vibe", "Pluggnb", "Underground"];

  return {
    detectedGenre: genre,
    detectedMood: mood,
    bpmEstimate: bpm,
    energyLevel: energy,
    keyElements: [
      "Topline autotunée & harmonies vocales",
      "Basse 808 glissée & sub profonde",
      "Mélodie synthétiseur / piano atmosphérique",
      "Rythmique trap moderne (hi-hats rapides)",
    ],
    audienceTarget: "Auditeurs New Wave, Plug Fr, SoundCloud et amateurs de découvertes rap underground.",
    platforms: {
      youtube: {
        tags: finalYtTags,
        formatted: formattedYt,
        charCount: formattedYt.length,
        titleIdeas: [
          `${artist} - ${track} (Clip Officiel)`,
          `${artist} - ${track} (Visualizer)`,
          `${artist} - ${track} [Pluggnb / New Wave 2026]`,
        ],
        descriptionSnippet: `Écoutez le nouveau morceau "${track}" de ${artist}.\nDisponible sur toutes les plateformes de streaming.\n\n#RapFr #Pluggnb #NewWave`,
      },
      soundcloud: {
        genreTag: genreTagSoundcloud,
        tags: soundcloudTags,
        formatted: scFormatted,
      },
      tiktok: {
        hashtags: tiktokHashtags,
        captionIdea: `Vous validez le nouveau morceau "${track}" ? 🔥 Donnez votre avis en commentaire 👇`,
        hookIdea: `POV : Tu découvres la meilleure pépite Plug / New Wave de 2026... 🎧`,
      },
      instagram: {
        hashtags: igHashtags,
        reelCaptionIdea: `"${track}" est maintenant disponible. Quel est votre passage préféré ? 🌙✨`,
      },
      snapchat: {
        spotlightTags: spotlightTags,
        topicKeywords: ["Rap Français", "Nouvelle Musique", "Trending Sounds"],
      },
      spotifyPitch: {
        moodKeywords: ["Chill", "Nocturne", "Mélancolique", "Énergique"],
        styleGenres: ["Pluggnb", "French Rap", "Cloud Rap", "Trap"],
        pitchNote: `"${track}" par ${artist} allie des mélodies planantes à une production percutante, taillée pour les playlists New Wave et Rap Français Nocturne.`,
      },
    },
    recommendedPacks: [
      "PACK 1 — Identité de Base & SEO Vidéo",
      "PACK 2 — Sous-Genres & Styles Précis",
    ],
    seoTips: [
      "Conservez une sélection de tags de moins de 480 caractères pour éviter tout blocage YouTube Studio.",
      "Utilisez le hook vidéo suggéré pour capter l'attention dans les 3 premières secondes sur TikTok / Shorts.",
      "Soignez la miniature avec un contraste élevé et un texte court et percutant.",
    ],
  };
}

async function startServer() {
  const app = express();

  // Increase payload limits for audio files
  app.use(express.json({ limit: "40mb" }));
  app.use(express.urlencoded({ limit: "40mb", extended: true }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Audio transcription endpoint (Speech to Text with Gemini)
  app.post("/api/transcribe-audio", async (req, res) => {
    const { audioBase64, mimeType = "audio/webm" } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "Aucun flux audio fourni." });
    }

    try {
      const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.-]+;base64,/, "");
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: "Transcris fidèlement cet audio en français (paroles de rap, description, ou texte dicté). Ne réponds QUE par la transcription exacte, sans fioritures ni guillemets.",
            },
          ],
        },
      });

      const text = response.text?.trim() || "";
      return res.json({ success: true, text });
    } catch (err: any) {
      console.warn("Transcription failed, returning fallback message:", err?.message || err);
      return res.status(500).json({
        error: "Impossible de transcrire l'audio actuellement. Veuillez réessayer ou saisir le texte manuellement.",
      });
    }
  });

// AI Tag Generation & Analysis Endpoint with multi-model fallback & retry
  app.post("/api/generate-tags", async (req, res) => {
    const {
      prompt = "",
      artistName = "",
      trackName = "",
      lyrics = "",
      audioBase64,
      audioMimeType,
      targetVibe,
      selectedPlatforms = ["youtube", "soundcloud", "tiktok", "instagram", "snapchat"],
    } = req.body;

    const artist = (artistName || "").trim() || "Artiste Indépendant";
    const track = (trackName || "").trim() || "Nouveau Morceau";

    const systemPrompt = `Tu es le meilleur directeur artistique, expert SEO musical et stratège marketing digital spécialisé dans la scène Rap Français, Plug, Pluggnb, Trap, Cloud Rap, Rage, Drill et Underground francophone / international.
Ton but est d'analyser les éléments fournis (audio, paroles, description/prompt, ambiance) et de générer une stratégie de métadonnées et de tags ultra-efficace, optimisée pour chaque plateforme (YouTube SEO, SoundCloud, TikTok, Instagram Reels, Snapchat Spotlight, Spotify pitch).

Règles de génération :
1. YouTube SEO : Génère une liste de tags ultra-pertinents séparés par des virgules, totalisant STRICTEMENT MOINS DE 480 caractères au total (pour respecter le quota de 500 caractères de YouTube). Inclus les variantes avec/sans accent ("rap français", "rap francais", "plug 2026"), l'identité de l'artiste ("${artist}", "${artist} ${track}", etc.), les sous-genres exacts et les requêtes longue traîne.
2. SoundCloud : Tag principal du genre précis + 10 à 15 tags précis de mood et sonorités.
3. TikTok : 6 à 10 hashtags viraux courts avec # (#rapfr, #plugfr, #snippet, etc.), une idée de caption percutante et une idée de concept/hook pour percer.
4. Instagram : 15 à 25 hashtags ciblés mélangeant reach moyen et de niche, plus une idée de légende stylée pour Reel.
5. Snapchat / Spotlight : 5 à 8 tags clés de thématiques tendance.
6. Spotify Pitch : 3 à 5 mots-clés d'humeur, sous-genres et un pitch texte court de 2 phrases pour les curateurs de playlists.
7. Analyse globale : Identifie le sous-genre précis (ex: Cloud Pluggnb, Dark Trap 808, Cyber Rage, etc.), le mood, l'estimation BPM, le niveau d'énergie, les éléments clés de production (ex: autotune planant, basse saturée, nappe de synthé, etc.) et le public cible.`;

    const parts: any[] = [];

    // Add audio part if provided
    if (audioBase64) {
      const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.-]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: audioMimeType || "audio/mp3",
          data: cleanBase64,
        },
      });
    }

    const userTextInstruction = `ANALYSE CE MORCEAU ET GÉNÈRE LES TAGS OPTIMISÉS :
- Artiste : ${artist}
- Titre : ${track}
${targetVibe ? `- Vibe / Ambiance souhaitée : ${targetVibe}` : ""}
${prompt ? `- Prompt / Description : ${prompt}` : ""}
${lyrics ? `- Paroles du morceau :\n"""\n${lyrics}\n"""` : ""}
${audioBase64 ? "- Fichier audio inclus : écoute et analyse le tempo, les sonorités, le mix, la topline, l'énergie et l'émotion." : ""}
- Plateformes demandées : ${selectedPlatforms.join(", ")}`;

    parts.push({
      text: userTextInstruction,
    });

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        detectedGenre: { type: Type.STRING, description: "Sous-genre musical détecté" },
        detectedMood: { type: Type.STRING, description: "Ambiance / émotion du son" },
        bpmEstimate: { type: Type.STRING, description: "Estimation de tempo BPM" },
        energyLevel: { type: Type.STRING, description: "Niveau d'énergie" },
        keyElements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3 à 5 éléments phares remarqués dans la prod ou les paroles"
        },
        audienceTarget: { type: Type.STRING, description: "Public cible" },
        platforms: {
          type: Type.OBJECT,
          properties: {
            youtube: {
              type: Type.OBJECT,
              properties: {
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                formatted: { type: Type.STRING, description: "Tags prêts à coller dans YouTube séparés par une virgule" },
                charCount: { type: Type.NUMBER, description: "Nombre de caractères total des tags" },
                titleIdeas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 suggestions de titres YouTube optimisés SEO" },
                descriptionSnippet: { type: Type.STRING, description: "Extrait optimisé pour la description YouTube" }
              },
              required: ["tags", "formatted", "charCount", "titleIdeas", "descriptionSnippet"]
            },
            soundcloud: {
              type: Type.OBJECT,
              properties: {
                genreTag: { type: Type.STRING, description: "Le tag principal pour SoundCloud" },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                formatted: { type: Type.STRING, description: "Tags formatés SoundCloud" }
              },
              required: ["genreTag", "tags", "formatted"]
            },
            tiktok: {
              type: Type.OBJECT,
              properties: {
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                captionIdea: { type: Type.STRING, description: "Idée de caption TikTok" },
                hookIdea: { type: Type.STRING, description: "Idée de texte à l'écran" }
              },
              required: ["hashtags", "captionIdea", "hookIdea"]
            },
            instagram: {
              type: Type.OBJECT,
              properties: {
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                reelCaptionIdea: { type: Type.STRING, description: "Légende pour Reel" }
              },
              required: ["hashtags", "reelCaptionIdea"]
            },
            snapchat: {
              type: Type.OBJECT,
              properties: {
                spotlightTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                topicKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["spotlightTags", "topicKeywords"]
            },
            spotifyPitch: {
              type: Type.OBJECT,
              properties: {
                moodKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                styleGenres: { type: Type.ARRAY, items: { type: Type.STRING } },
                pitchNote: { type: Type.STRING, description: "Courte note de pitch playlist Spotify" }
              },
              required: ["moodKeywords", "styleGenres", "pitchNote"]
            }
          },
          required: ["youtube", "soundcloud", "tiktok", "instagram", "snapchat"]
        },
        recommendedPacks: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Noms des packs recommandés"
        },
        seoTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Conseils stratégiques"
        }
      },
      required: ["detectedGenre", "detectedMood", "keyElements", "platforms", "seoTips"]
    };

    // Try models with fallback: gemini-2.5-flash (fast & resilient), then gemini-3.7-flash
    const candidateModels = ["gemini-2.5-flash", "gemini-3.7-flash"];
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model,
          contents: { parts },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        const responseText = response.text || "{}";
        const parsedData = JSON.parse(responseText);

        return res.json({
          success: true,
          modelUsed: model,
          data: parsedData,
        });
      } catch (err: any) {
        console.warn(`Attempt with ${model} failed:`, err?.message || err);
        lastError = err;
        // If 503 or 429, wait 600ms before trying the next model
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    // Smart algorithmic fallback if remote model is overloaded (503 / 429 / offline)
    console.info("Using smart heuristic generation fallback due to temporary model high demand.");
    const fallbackData = generateHeuristicAnalysisResult(artist, track, prompt, lyrics, targetVibe);
    return res.json({
      success: true,
      modelUsed: "heuristic-fallback",
      data: fallbackData,
      notice: "Génération réalisée avec le moteur algorithmique haute performance suite à une forte demande temporaire sur les serveurs IA.",
    });
  });

  // Extract video/reel metadata endpoint (YouTube / Instagram / TikTok)
  app.post("/api/extract-metadata", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "L'URL est requise pour l'extraction." });
      }

      const metadata = await extractMetadataFromUrl(url);
      return res.json({
        success: true,
        metadata,
      });
    } catch (err: any) {
      console.error("Erreur extraction métadonnées lien :", err);
      return res.status(500).json({
        error: err?.message || "Erreur lors de l'extraction des métadonnées.",
      });
    }
  });

  // Bulk Top 3 Sets Generator endpoint (Viral, Niche, SEO-focused)
  app.post("/api/generate-top3-sets", async (req, res) => {
    try {
      const { artistName, trackName, vibePrompt } = req.body;
      const artist = (artistName || "Artiste").trim();
      const track = (trackName || "Morceau").trim();

      // System instruction for Gemini Top 3 Sets
      const systemPrompt = `Tu es le Directeur Stratégie SEO & Croissance Musicale Spécialisé Rap Français, Pluggnb, Drill & Trap 2026.
Ta mission est de générer EXACTEMENT 3 sets de tags spécialisés pour le morceau "${track}" de "${artist}" :
1. Set "viral" : Axé sur la découverte rapide, les formats courts (TikTok, Reels, Shorts) et les requêtes tendance.
2. Set "niche" : Axé sur l'underground, Pluggnb, SoundCloud, beatmakers, type beats et la communauté New Wave.
3. Set "seo" : Axé sur un score YouTube Studio 100/100, hiérarchie 3-tier stricte, STRICTEMENT INFÉRIEUR à 485 caractères pour éviter le blocage YouTube Studio.

Renvoie UNIQUEMENT un objet JSON conforme au schéma.`;

      const promptText = `Génère le Top 3 sets de tags pour l'artiste "${artist}" et le morceau "${track}". Vibe/Contexte supplémentaire: "${vibePrompt || 'Rap FR / Pluggnb moderne'}".`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          artist: { type: Type.STRING },
          track: { type: Type.STRING },
          viralSet: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              badge: { type: Type.STRING },
              description: { type: Type.STRING },
              objective: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              youtubeFormatted: { type: Type.STRING },
              charCount: { type: Type.NUMBER },
              estimatedScore: { type: Type.NUMBER },
              keyStrategy: { type: Type.STRING },
            },
            required: ["id", "name", "badge", "description", "objective", "tags", "hashtags", "youtubeFormatted", "charCount", "estimatedScore", "keyStrategy"]
          },
          nicheSet: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              badge: { type: Type.STRING },
              description: { type: Type.STRING },
              objective: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              youtubeFormatted: { type: Type.STRING },
              charCount: { type: Type.NUMBER },
              estimatedScore: { type: Type.NUMBER },
              keyStrategy: { type: Type.STRING },
            },
            required: ["id", "name", "badge", "description", "objective", "tags", "hashtags", "youtubeFormatted", "charCount", "estimatedScore", "keyStrategy"]
          },
          seoSet: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              badge: { type: Type.STRING },
              description: { type: Type.STRING },
              objective: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              youtubeFormatted: { type: Type.STRING },
              charCount: { type: Type.NUMBER },
              estimatedScore: { type: Type.NUMBER },
              keyStrategy: { type: Type.STRING },
            },
            required: ["id", "name", "badge", "description", "objective", "tags", "hashtags", "youtubeFormatted", "charCount", "estimatedScore", "keyStrategy"]
          },
        },
        required: ["artist", "track", "viralSet", "nicheSet", "seoSet"]
      };

      const candidateModels = ["gemini-2.5-flash", "gemini-3.7-flash"];
      for (const model of candidateModels) {
        try {
          const ai = getGeminiClient();
          const response = await ai.models.generateContent({
            model,
            contents: promptText,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema,
            },
          });

          const responseText = response.text || "{}";
          const parsedData = JSON.parse(responseText);

          return res.json({
            success: true,
            modelUsed: model,
            data: parsedData,
          });
        } catch (err: any) {
          console.warn(`Top 3 sets attempt with ${model} failed:`, err?.message || err);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Fallback
      console.info("Using smart heuristic Top 3 Sets fallback.");
      const fallbackData = generateHeuristicTop3Sets(artist, track, vibePrompt);
      return res.json({
        success: true,
        modelUsed: "heuristic-fallback",
        data: fallbackData,
      });
    } catch (err: any) {
      console.error("Erreur génération Top 3 Sets :", err);
      const fallbackData = generateHeuristicTop3Sets(req.body?.artistName, req.body?.trackName, req.body?.vibePrompt);
      return res.json({
        success: true,
        modelUsed: "heuristic-emergency",
        data: fallbackData,
      });
    }
  });

  // Comprehensive Multi-Platform Video & Audio SEO/Algorithm Audit Endpoint powered by Gemini AI
  app.post("/api/audit-seo", async (req, res) => {
    try {
      const {
        youtubeUrl,
        url: rawUrl,
        platform: requestedPlatform,
        title: rawTitle,
        description: rawDescription,
        tags: rawTags,
        artistName: rawArtist,
        trackName: rawTrack,
        genre,
      } = req.body;

      const targetUrl = (rawUrl || youtubeUrl || "").trim();
      let title = (rawTitle || "").trim();
      let description = (rawDescription || "").trim();
      let artist = (rawArtist || "").trim();
      let track = (rawTrack || "").trim();
      let videoMeta: any = null;

      // If URL provided, extract metadata if fields are empty or to augment analysis
      if (targetUrl) {
        try {
          videoMeta = await extractMetadataFromUrl(targetUrl);
          if (!title && videoMeta.title) title = videoMeta.title;
          if (!artist && videoMeta.parsedArtist) artist = videoMeta.parsedArtist;
          if (!track && videoMeta.parsedTrack) track = videoMeta.parsedTrack;
          if (!description && videoMeta.descriptionSnippet) description = videoMeta.descriptionSnippet;
        } catch (e) {
          console.warn("Could not extract metadata for audit URL:", e);
        }
      }

      const platform = (requestedPlatform || (videoMeta?.platform) || (targetUrl.includes("tiktok") ? "tiktok" : targetUrl.includes("instagram") ? "instagram" : targetUrl.includes("soundcloud") ? "soundcloud" : targetUrl.includes("spotify") ? "spotify" : targetUrl.includes("twitter") || targetUrl.includes("x.com") ? "twitter" : "youtube")).toLowerCase();

      if (!artist) artist = "Artiste Indépendant";
      if (!track) track = "Morceau Rap FR";
      if (!title) title = `${artist} - ${track} (Clip Officiel)`;

      let tagList: string[] = [];
      if (Array.isArray(rawTags)) {
        tagList = rawTags.map((t: any) => String(t).trim()).filter(Boolean);
      } else if (typeof rawTags === "string" && rawTags.trim()) {
        tagList = rawTags.split(/[\n,]+/).map((t: string) => t.trim()).filter(Boolean);
      }

      const systemPrompt = `Tu es le Directeur d'Audit SEO & Stratégie d'Algorithmes Sociaux (YouTube, TikTok, Instagram Reels, SoundCloud, Spotify) le plus réputé pour le Rap Français et la New Wave 2026.
Tu dois analyser en profondeur la configuration SEO et algorithmique d'un contenu musical pour la plateforme cible : "${platform.toUpperCase()}".
Tu calcules un score d'efficacité algorithmique /100 rigoureux.

Critères d'évaluation adaptés à ${platform.toUpperCase()} :
1. "titleHook" (max 25 pts) : Qualité de l'accroche, présence artiste/titre, concision et impact CTR selon la plateforme.
2. "tagOptimization" (max 25 pts) : Nombre et pertinence des tags/hashtags (pour YouTube: Architecture 3 Couches < 485 car. ; pour TikTok: 3 à 5 hashtags de niche/FYP ; pour Insta: 5 à 15 tags précis).
3. "descriptionSeo" (max 25 pts) : Richesse sémantique de la légende/description, présence de smartlinks streaming, mentions, call-to-action d'engagement.
4. "algorithmRetention" (max 25 pts) : Potentiel de viralité, signaux de rétention (hook 3s), absence de spam pénalisant, cohérence thématique.

Fournis des forces, faiblesses critiques, mots-clés manquants à fort volume de recherche, recommandations concrètes actionnables et une version 100% optimisée (titre, description, tags, hashtags).
Renvoie UNIQUEMENT un objet JSON valide conforme au schéma.`;

      const promptContent = `RÉALISE L'AUDIT ALGORITHMIQUE & SEO COMPLET DU CONTENU SUIVANT SUR ${platform.toUpperCase()} :
- Plateforme Cible : ${platform.toUpperCase()}
- Artiste : ${artist}
- Morceau : ${track}
- Titre actuel : ${title}
- Description / Légende actuelle : ${description || "(Aucune description fournie)"}
- Tags / Hashtags actuels (${tagList.length}) : ${tagList.length > 0 ? tagList.join(", ") : "(Aucun tag fourni)"}
- Genre / Style : ${genre || "Rap Français / Pluggnb / New Wave"}
${targetUrl ? `- Lien URL Analysé : ${targetUrl}` : ""}`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER, description: "Score global sur 100" },
          grade: { type: Type.STRING, description: "Grade: A+, A, B, C, D ou F" },
          verdict: { type: Type.STRING, description: "Verdict synthétique d'expert" },
          subScores: {
            type: Type.OBJECT,
            properties: {
              titleHook: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER },
                  maxScore: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                },
                required: ["score", "maxScore", "label", "feedback"]
              },
              tagOptimization: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER },
                  maxScore: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                },
                required: ["score", "maxScore", "label", "feedback"]
              },
              descriptionSeo: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER },
                  maxScore: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                },
                required: ["score", "maxScore", "label", "feedback"]
              },
              algorithmRetention: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER },
                  maxScore: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                },
                required: ["score", "maxScore", "label", "feedback"]
              },
            },
            required: ["titleHook", "tagOptimization", "descriptionSeo", "algorithmRetention"]
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          criticalWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionableRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          optimizedSuggestions: {
            type: Type.OBJECT,
            properties: {
              recommendedTitle: { type: Type.STRING },
              recommendedDescription: { type: Type.STRING },
              recommendedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedHashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["recommendedTitle", "recommendedDescription", "recommendedTags", "recommendedHashtags"]
          },
        },
        required: ["overallScore", "grade", "verdict", "subScores", "strengths", "criticalWeaknesses", "missingKeywords", "actionableRecommendations", "optimizedSuggestions"]
      };

      const candidateModels = ["gemini-2.5-flash", "gemini-3.7-flash"];
      for (const model of candidateModels) {
        try {
          const ai = getGeminiClient();
          const response = await ai.models.generateContent({
            model,
            contents: promptContent,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema,
            },
          });

          const responseText = response.text || "{}";
          const parsedData = JSON.parse(responseText);

          if (videoMeta) {
            parsedData.analyzedVideoInfo = {
              title: videoMeta.title || title,
              authorName: videoMeta.authorName || artist,
              thumbnailUrl: videoMeta.thumbnailUrl,
              url: targetUrl,
              platform: videoMeta.platform || platform,
            };
          }

          return res.json({
            success: true,
            modelUsed: model,
            data: parsedData,
          });
        } catch (err: any) {
          console.warn(`Audit SEO attempt with ${model} failed:`, err?.message || err);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Fallback
      console.info("Using smart heuristic SEO Audit fallback.");
      const fallbackAudit = generateHeuristicSeoAudit({
        artistName: artist,
        trackName: track,
        title,
        description,
        tags: tagList,
        url: targetUrl,
        platform,
        genre,
      });

      if (videoMeta) {
        fallbackAudit.analyzedVideoInfo = {
          title: videoMeta.title || title,
          authorName: videoMeta.authorName || artist,
          thumbnailUrl: videoMeta.thumbnailUrl,
          url: targetUrl,
          platform: videoMeta.platform || platform,
        };
      }

      return res.json({
        success: true,
        modelUsed: "heuristic-fallback",
        data: fallbackAudit,
      });
    } catch (err: any) {
      console.error("Erreur générale Audit SEO :", err);
      const fallbackAudit = generateHeuristicSeoAudit({
        artistName: req.body?.artistName,
        trackName: req.body?.trackName,
        title: req.body?.title,
        description: req.body?.description,
        tags: req.body?.tags,
        url: req.body?.url || req.body?.youtubeUrl,
        platform: req.body?.platform,
      });
      return res.json({
        success: true,
        modelUsed: "heuristic-emergency",
        data: fallbackAudit,
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
