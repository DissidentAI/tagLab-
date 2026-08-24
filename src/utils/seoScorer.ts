import { formatTagsList } from '../data/masterTags';

export interface SeoBreakdown {
  identityScore: number; // 0-25
  genreScore: number;    // 0-25
  moodScore: number;     // 0-20
  formatScore: number;   // 0-15
  lengthScore: number;   // 0-15
  instagramTagScore: number; // 0-35
  instagramNicheScore: number; // 0-35
  instagramDiversityScore: number; // 0-30
}

export interface SeoScoreResult {
  totalScore: number;      // 0 - 100
  youtubeScore: number;    // 0 - 100
  instagramScore: number;  // 0 - 100
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  gradeLabel: string;
  gradeColor: string;
  youtubeCharCount: number;
  youtubeCharLimit: number;
  instagramTagCount: number;
  instagramTagLimit: number;
  breakdown: SeoBreakdown;
  strengths: string[];
  recommendations: string[];
  layerStatus: {
    hasIdentity: boolean;
    hasGenre: boolean;
    hasMood: boolean;
    hasFormat: boolean;
  };
}

const GENRE_KEYWORDS = [
  'rap', 'plug', 'pluggnb', 'trap', 'drill', 'cloud', 'boombap', 'jersey', 
  'rnb', 'rage', 'hyperpop', 'melodic', 'freestyle', 'detroit', 'underground',
  'hip hop', 'hiphop', 'us', 'fr', 'french', 'uk', 'new wave', 'newgen'
];

const MOOD_KEYWORDS = [
  '808', 'sombre', 'dark', 'melancolique', 'mélancolique', 'sad', 'piano',
  'guitare', 'nuit', 'nocturne', 'plane', 'autotune', 'flow', 'vibe',
  'chill', 'energetique', 'agressif', 'glissante', 'lourd', 'bass', 'synth', 'ambient'
];

const FORMAT_KEYWORDS = [
  'clip', 'officiel', 'official', 'audio', 'lyrics', 'paroles', 'clip officiel',
  'visualizer', 'snippet', 'prod', 'type beat', 'instru', 'instrumental',
  'session', 'live', 'album', 'ep', 'single', 'feat', 'ft'
];

/**
 * Calculates a comprehensive yet transparent SEO score for selected tags.
 * Evaluates 3-layer architecture for YouTube (Identity, Subgenres, Mood/Production, Format, Capacity)
 * and Instagram Discovery potential (Hashtag density, broad/niche mix, branding).
 */
export function calculateSeoScore(
  rawTags: string[],
  artistName: string = '',
  trackName: string = ''
): SeoScoreResult {
  if (!rawTags || rawTags.length === 0) {
    return {
      totalScore: 0,
      youtubeScore: 0,
      instagramScore: 0,
      grade: 'D',
      gradeLabel: 'Aucun tag sélectionné',
      gradeColor: 'text-slate-400 dark:text-slate-500',
      youtubeCharCount: 0,
      youtubeCharLimit: 500,
      instagramTagCount: 0,
      instagramTagLimit: 30,
      breakdown: {
        identityScore: 0,
        genreScore: 0,
        moodScore: 0,
        formatScore: 0,
        lengthScore: 0,
        instagramTagScore: 0,
        instagramNicheScore: 0,
        instagramDiversityScore: 0,
      },
      strengths: [],
      recommendations: [
        "Sélectionnez au moins 5 à 15 tags dans la bibliothèque ou utilisez l'IA pour démarrer.",
        "Renseignez votre nom d'artiste et le titre du morceau en haut pour un scoring personnalisé."
      ],
      layerStatus: {
        hasIdentity: false,
        hasGenre: false,
        hasMood: false,
        hasFormat: false,
      },
    };
  }

  const formattedTags = formatTagsList(rawTags, artistName, trackName);
  const lowerTags = formattedTags.map(t => t.toLowerCase());
  const cleanArtist = artistName.trim().toLowerCase();
  const cleanTrack = trackName.trim().toLowerCase();

  // 1. YouTube Analysis
  const youtubeString = formattedTags.join(', ');
  const youtubeCharCount = youtubeString.length;
  const isOverYoutube = youtubeCharCount > 500;

  // Identity layer (Artist / Track / Combo)
  let identityScore = 0;
  let hasIdentity = false;
  if (cleanArtist && lowerTags.some(t => t.includes(cleanArtist))) {
    identityScore += 15;
    hasIdentity = true;
  }
  if (cleanTrack && lowerTags.some(t => t.includes(cleanTrack))) {
    identityScore += 10;
    hasIdentity = true;
  }
  // Generic identity tags if no artist name provided yet
  if (!cleanArtist && lowerTags.some(t => t.includes('[nom d\'artiste]') || t.includes('artiste') || t.includes('rap fr'))) {
    identityScore = Math.max(identityScore, 10);
  }
  identityScore = Math.min(25, identityScore);

  // Genre / Niche layer
  let genreMatches = 0;
  lowerTags.forEach(t => {
    if (GENRE_KEYWORDS.some(k => t.includes(k))) {
      genreMatches++;
    }
  });
  let genreScore = Math.min(25, genreMatches * 5);
  const hasGenre = genreMatches > 0;

  // Mood / Production layer
  let moodMatches = 0;
  lowerTags.forEach(t => {
    if (MOOD_KEYWORDS.some(k => t.includes(k))) {
      moodMatches++;
    }
  });
  let moodScore = Math.min(20, moodMatches * 5);
  const hasMood = moodMatches > 0;

  // Format layer
  let formatMatches = 0;
  lowerTags.forEach(t => {
    if (FORMAT_KEYWORDS.some(k => t.includes(k))) {
      formatMatches++;
    }
  });
  let formatScore = Math.min(15, formatMatches * 5);
  const hasFormat = formatMatches > 0;

  // Length optimization (500 limit)
  let lengthScore = 0;
  if (isOverYoutube) {
    lengthScore = 0; // Penalty for overflow
  } else if (youtubeCharCount >= 360 && youtubeCharCount <= 495) {
    lengthScore = 15; // Optimal density (72-99%)
  } else if (youtubeCharCount >= 220 && youtubeCharCount < 360) {
    lengthScore = 10;
  } else if (youtubeCharCount >= 100 && youtubeCharCount < 220) {
    lengthScore = 6;
  } else {
    lengthScore = 2;
  }

  const rawYoutubeScore = identityScore + genreScore + moodScore + formatScore + lengthScore;
  const youtubeScore = isOverYoutube ? Math.max(20, rawYoutubeScore - 35) : rawYoutubeScore;

  // 2. Instagram Analysis
  const instagramTagCount = formattedTags.length;
  const isOverInstagram = instagramTagCount > 30;

  // Tag count score
  let instagramTagScore = 0;
  if (isOverInstagram) {
    instagramTagScore = 0; // Exceeded limit
  } else if (instagramTagCount >= 8 && instagramTagCount <= 22) {
    instagramTagScore = 35; // Algorithm sweet spot
  } else if (instagramTagCount >= 5 && instagramTagCount < 8) {
    instagramTagScore = 25;
  } else if (instagramTagCount > 22 && instagramTagCount <= 30) {
    instagramTagScore = 25;
  } else {
    instagramTagScore = 10;
  }

  // Niche Rap & Discovery score
  let instagramNicheScore = Math.min(35, (genreMatches + moodMatches) * 4);

  // Diversity & Branding score
  let instagramDiversityScore = 0;
  if (hasIdentity) instagramDiversityScore += 15;
  if (hasGenre && hasMood) instagramDiversityScore += 15;
  instagramDiversityScore = Math.min(30, instagramDiversityScore);

  const rawInstagramScore = instagramTagScore + instagramNicheScore + instagramDiversityScore;
  const instagramScore = isOverInstagram ? Math.max(15, rawInstagramScore - 40) : rawInstagramScore;

  // 3. Combined Total Score (50% YT, 50% IG)
  const totalScore = Math.round((youtubeScore * 0.55) + (instagramScore * 0.45));

  // Grade & Label
  let grade: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
  let gradeLabel = 'Insuffisant';
  let gradeColor = 'text-rose-500 dark:text-rose-400';

  if (totalScore >= 90) {
    grade = 'S';
    gradeLabel = 'SEO Optimal Master';
    gradeColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (totalScore >= 78) {
    grade = 'A';
    gradeLabel = 'Très Pertinent';
    gradeColor = 'text-emerald-500 dark:text-emerald-400';
  } else if (totalScore >= 60) {
    grade = 'B';
    gradeLabel = 'Bonne Base SEO';
    gradeColor = 'text-indigo-600 dark:text-indigo-400';
  } else if (totalScore >= 40) {
    grade = 'C';
    gradeLabel = 'Moyen / À perfectionner';
    gradeColor = 'text-amber-500 dark:text-amber-400';
  } else {
    grade = 'D';
    gradeLabel = 'Incomplet';
    gradeColor = 'text-rose-500 dark:text-rose-400';
  }

  // Strengths & Recommendations
  const strengths: string[] = [];
  const recommendations: string[] = [];

  if (hasIdentity) {
    strengths.push("Tags d'identité présents (Artiste / Titre)");
  } else {
    recommendations.push("Renseignez votre nom d'artiste dans la barre du haut pour booster l'indexation de votre marque.");
  }

  if (genreMatches >= 3) {
    strengths.push("Excellente couverture des sous-genres rap & niches");
  } else {
    recommendations.push("Ajoutez 2 à 3 tags de sous-genre précis (ex: 'Pluggnb', 'Dark Trap', 'Cloud Rap').");
  }

  if (moodMatches >= 2) {
    strengths.push("Mots-clés d'ambiance et de production sonores bien ciblés");
  } else {
    recommendations.push("Intégrez 1 ou 2 tags de mood/prod (ex: '808 nocturne', 'mélancolique', 'autotune').");
  }

  if (hasFormat) {
    strengths.push("Balise de format détectée (Clip officiel / Audio / Type Beat)");
  } else {
    recommendations.push("Ajoutez un tag de format vidéo ('clip officiel', 'audio officiel' ou 'paroles').");
  }

  if (isOverYoutube) {
    recommendations.push(`YouTube : Dépassement de ${youtubeCharCount - 500} caractères. Utilisez le bouton "Ajuster".`);
  } else if (youtubeCharCount >= 360 && youtubeCharCount <= 495) {
    strengths.push(`Quota YouTube parfait : ${youtubeCharCount}/500 caractères.`);
  } else if (youtubeCharCount < 250) {
    recommendations.push(`YouTube : Seulement ${youtubeCharCount}/500 car. utilisés. Ajoutez des tags pour maximiser la portée.`);
  }

  if (isOverInstagram) {
    recommendations.push(`Instagram : ${instagramTagCount} tags sélectionnés (limite stricte à 30 hashtags).`);
  } else if (instagramTagCount >= 8 && instagramTagCount <= 22) {
    strengths.push(`Densité Instagram idéale (${instagramTagCount} hashtags) pour l'algorithme Reels.`);
  }

  return {
    totalScore,
    youtubeScore,
    instagramScore,
    grade,
    gradeLabel,
    gradeColor,
    youtubeCharCount,
    youtubeCharLimit: 500,
    instagramTagCount,
    instagramTagLimit: 30,
    breakdown: {
      identityScore,
      genreScore,
      moodScore,
      formatScore,
      lengthScore,
      instagramTagScore,
      instagramNicheScore,
      instagramDiversityScore,
    },
    strengths,
    recommendations,
    layerStatus: {
      hasIdentity,
      hasGenre,
      hasMood,
      hasFormat,
    },
  };
}
