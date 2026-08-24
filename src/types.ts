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
