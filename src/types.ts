export interface TagCategory {
  id: string;
  name: string;
  description?: string;
  tags: string[];
}

export interface TagPack {
  id: string;
  name: string;
  subtitle: string;
  description?: string;
  tags: string[];
}

export interface PlatformTags {
  youtube: {
    tags: string[];
    formatted: string;
    charCount: number;
    titleIdeas: string[];
    descriptionSnippet: string;
  };
  soundcloud: {
    genreTag: string;
    tags: string[];
    formatted: string;
  };
  tiktok: {
    hashtags: string[];
    captionIdea: string;
    hookIdea: string;
  };
  instagram: {
    hashtags: string[];
    reelCaptionIdea: string;
  };
  snapchat: {
    spotlightTags: string[];
    topicKeywords: string[];
  };
  spotifyPitch?: {
    moodKeywords: string[];
    styleGenres: string[];
    pitchNote: string;
  };
}

export interface AiAnalysisResult {
  detectedGenre: string;
  detectedMood: string;
  detectedArtist?: string;
  detectedTrack?: string;
  bpmEstimate?: string;
  energyLevel?: string;
  keyElements: string[];
  audienceTarget?: string;
  platforms: PlatformTags;
  recommendedPacks?: string[];
  seoTips: string[];
}

export type PlatformKey = 'youtube' | 'soundcloud' | 'tiktok' | 'instagram' | 'snapchat' | 'spotifyPitch';

export type CopyFormat = 'comma' | 'hashtag' | 'newline' | 'quotes' | 'bracket';

export type SeoPlatformMode = 'youtube' | 'instagram' | 'both';

export interface PromptHistoryItem {
  id: string;
  timestamp: number;
  promptText: string;
  artistName?: string;
  trackName?: string;
  lyricsSnippet?: string;
  hasAudio?: boolean;
  audioFileName?: string;
  selectedPlatforms?: PlatformKey[];
  detectedGenre?: string;
  bpmEstimate?: string;
}

export type SocialAuditPlatform = 'youtube' | 'tiktok' | 'instagram' | 'soundcloud' | 'spotify' | 'twitter' | 'snapchat' | 'other';

export interface ExtractedVideoMetadata {
  platform: SocialAuditPlatform;
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
}

export interface TagSetBundle {
  id: 'viral' | 'niche' | 'seo';
  name: string;
  badge: string;
  description: string;
  objective: string;
  tags: string[];
  hashtags: string[];
  youtubeFormatted: string;
  charCount: number;
  estimatedScore: number;
  keyStrategy: string;
}

export interface Top3TagSetsResult {
  artist: string;
  track: string;
  viralSet: TagSetBundle;
  nicheSet: TagSetBundle;
  seoSet: TagSetBundle;
}

export interface SeoSubScore {
  score: number;
  maxScore: number;
  label: string;
  feedback: string;
}

export interface SeoAuditResult {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  verdict: string;
  subScores: {
    titleHook: SeoSubScore;
    tagOptimization: SeoSubScore;
    descriptionSeo: SeoSubScore;
    algorithmRetention: SeoSubScore;
  };
  strengths: string[];
  criticalWeaknesses: string[];
  missingKeywords: string[];
  actionableRecommendations: string[];
  optimizedSuggestions: {
    recommendedTitle: string;
    recommendedDescription: string;
    recommendedTags: string[];
    recommendedHashtags: string[];
  };
  analyzedVideoInfo?: {
    title: string;
    authorName: string;
    thumbnailUrl?: string;
    url?: string;
    platform?: string;
  };
}

export interface SeoScoreHistoryPoint {
  id: string;
  timestamp: number;
  dateLabel: string;
  tagCount: number;
  charCount: number;
  score: number;
  artistTrack: string;
  layer1Count: number;
  layer2Count: number;
  layer3Count: number;
}

