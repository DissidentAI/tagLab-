import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  AlertTriangle, 
  Sparkles, 
  Hash, 
  Plus,
  Youtube,
  Instagram,
  Scissors,
  CheckCircle2,
  Info,
  Radio,
  FileSpreadsheet,
  Target,
  Link as LinkIcon,
  Loader2,
  ExternalLink,
  RefreshCw,
  Layers,
  Music2,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowDownAZ,
  CaseLower
} from 'lucide-react';
import { CopyFormat, ExtractedVideoMetadata } from '../types';
import { MASTER_PACKS, formatTagsList } from '../data/masterTags';
import { downloadTagsCsv } from '../utils/csvExport';
import { calculateSeoScore } from '../utils/seoScorer';
import { SeoScoreCard } from './SeoScoreCard';

interface TagBasketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onRemoveTag: (tag: string) => void;
  onClearBasket: () => void;
  onAddTags: (tags: string[]) => void;
  artistName: string;
  trackName: string;
  onCopySuccess: (text: string, title: string) => void;
  onSetArtistName?: (artist: string) => void;
  onSetTrackName?: (track: string) => void;
}

type PlatformGauge = 'youtube' | 'instagram' | 'seo' | 'all';

export const TagBasketDrawer: React.FC<TagBasketDrawerProps> = ({
  isOpen,
  onClose,
  selectedTags,
  onRemoveTag,
  onClearBasket,
  onAddTags,
  artistName,
  trackName,
  onCopySuccess,
  onSetArtistName,
  onSetTrackName,
}) => {
  const [format, setFormat] = useState<CopyFormat>('comma');
  const [copied, setCopied] = useState(false);
  const [selectedGaugePlatform, setSelectedGaugePlatform] = useState<PlatformGauge>('youtube');
  
  // In-Basket Search and Sorting
  const [basketSearch, setBasketSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'az' | 'length'>('default');

  // Format tags
  const formattedTags = useMemo(() => {
    let list = formatTagsList(selectedTags, artistName, trackName);
    if (sortOrder === 'az') {
      list = [...list].sort((a, b) => a.localeCompare(b, 'fr'));
    } else if (sortOrder === 'length') {
      list = [...list].sort((a, b) => b.length - a.length);
    }
    return list;
  }, [selectedTags, artistName, trackName, sortOrder]);

  // Filtered tags by in-basket search
  const displayedTags = useMemo(() => {
    if (!basketSearch.trim()) return formattedTags;
    const q = basketSearch.toLowerCase();
    return formattedTags.filter(t => t.toLowerCase().includes(q));
  }, [formattedTags, basketSearch]);

  // Tag manipulation helpers
  const handleDeduplicate = () => {
    const unique = Array.from(new Set(selectedTags));
    if (unique.length < selectedTags.length) {
      onClearBasket();
      onAddTags(unique);
      onCopySuccess('', `${selectedTags.length - unique.length} doublons supprimés !`);
    } else {
      onCopySuccess('', 'Aucun doublon trouvé.');
    }
  };

  const handleToLowerCase = () => {
    const lower = selectedTags.map(t => t.toLowerCase());
    onClearBasket();
    onAddTags(lower);
    onCopySuccess('', 'Tous les tags convertis en minuscules !');
  };

  // Real-time SEO Score calculation
  const seoScoreData = useMemo(() => {
    return calculateSeoScore(selectedTags, artistName, trackName);
  }, [selectedTags, artistName, trackName]);

  // Compute text according to chosen format
  const getOutputText = (customFormat?: CopyFormat) => {
    const fmt = customFormat || format;
    switch (fmt) {
      case 'comma':
        return formattedTags.join(', ');
      case 'hashtag':
        return formattedTags
          .map(t => '#' + t.replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, ''))
          .filter(t => t.length > 1)
          .join(' ');
      case 'newline':
        return formattedTags.join('\n');
      case 'quotes':
        return formattedTags.map(t => `"${t}"`).join(', ');
      default:
        return formattedTags.join(', ');
    }
  };

  const outputText = getOutputText();

  // Metrics for YouTube
  const youtubeText = getOutputText('comma');
  const youtubeCharCount = youtubeText.length;
  const youtubeMaxChars = 500;
  const isOverYoutube = youtubeCharCount > youtubeMaxChars;
  const youtubePercentage = Math.min(100, Math.round((youtubeCharCount / youtubeMaxChars) * 100));

  // Metrics for Instagram
  const instagramText = getOutputText('hashtag');
  const instagramCharCount = instagramText.length;
  const instagramMaxChars = 2200;
  const instagramTagCount = formattedTags.length;
  const instagramMaxTags = 30;
  const isOverInstagramTags = instagramTagCount > instagramMaxTags;
  const isOverInstagramChars = instagramCharCount > instagramMaxChars;
  const isOverInstagram = isOverInstagramTags || isOverInstagramChars;
  const instagramTagPercentage = Math.min(100, Math.round((instagramTagCount / instagramMaxTags) * 100));
  const instagramCharPercentage = Math.min(100, Math.round((instagramCharCount / instagramMaxChars) * 100));

  if (!isOpen) return null;

  // Auto-trim helper for YouTube
  const handleAutoTrimYouTube = () => {
    const trimmed: string[] = [];
    let currentLen = 0;

    for (let i = 0; i < selectedTags.length; i++) {
      const tag = formattedTags[i];
      const addedLen = trimmed.length > 0 ? tag.length + 2 : tag.length;
      if (currentLen + addedLen <= 485) {
        trimmed.push(selectedTags[i]);
        currentLen += addedLen;
      } else {
        break;
      }
    }

    if (trimmed.length > 0 && trimmed.length < selectedTags.length) {
      onClearBasket();
      onAddTags(trimmed);
      onCopySuccess('', `Panier ajusté automatiquement à ${trimmed.length} tags (${currentLen} car. pour YouTube).`);
    }
  };

  // Auto-trim helper for Instagram (cap at 30 tags)
  const handleAutoTrimInstagram = () => {
    if (selectedTags.length > 30) {
      const trimmed = selectedTags.slice(0, 30);
      onClearBasket();
      onAddTags(trimmed);
      onCopySuccess('', `Panier ajusté à 30 hashtags pour Instagram.`);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    onCopySuccess(outputText, `${selectedTags.length} tags copiés au format ${format.toUpperCase()} !`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taglab-${(artistName || 'artiste').toLowerCase().replace(/\s+/g, '-')}-${(trackName || 'track').toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (selectedTags.length === 0) return;
    downloadTagsCsv(selectedTags, artistName, trackName, 'taglab-panier-tags');
    onCopySuccess('', `${selectedTags.length} tags exportés au format CSV (compatible Excel & Sheets) !`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">
                    Panier de Tags
                  </h2>
                  <span className="px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {selectedTags.length}
                  </span>
                  {selectedTags.length > 0 && (
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                      seoScoreData.totalScore >= 80 
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                        : seoScoreData.totalScore >= 60 
                        ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300' 
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                    }`}>
                      SEO {seoScoreData.totalScore}/100
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Limites YouTube, Instagram & Score SEO
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {selectedTags.length > 0 && (
                <button
                  onClick={onClearBasket}
                  title="Vider le panier"
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Platform Specific Limit Selector & Gauges */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 space-y-3">
            {/* Platform Tab Switcher */}
            <div className="flex items-center justify-between gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-lg">
              <button
                id="gauge-tab-seo"
                onClick={() => setSelectedGaugePlatform('seo')}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedGaugePlatform === 'seo'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Score SEO ({seoScoreData.totalScore})</span>
              </button>

              <button
                id="gauge-tab-youtube"
                onClick={() => {
                  setSelectedGaugePlatform('youtube');
                  setFormat('comma');
                }}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedGaugePlatform === 'youtube'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-rose-500" />
                <span>YouTube (500c)</span>
              </button>

              <button
                id="gauge-tab-instagram"
                onClick={() => {
                  setSelectedGaugePlatform('instagram');
                  setFormat('hashtag');
                }}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedGaugePlatform === 'instagram'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span>Instagram (30#)</span>
              </button>

              <button
                id="gauge-tab-all"
                onClick={() => setSelectedGaugePlatform('all')}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  selectedGaugePlatform === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Aperçu</span>
              </button>
            </div>

            {/* View 0: SEO Score Card Detailed Analysis */}
            {selectedGaugePlatform === 'seo' && (
              <SeoScoreCard scoreData={seoScoreData} compact={false} />
            )}

            {/* View 1: YouTube Dedicated Limit View */}
            {selectedGaugePlatform === 'youtube' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-rose-500" />
                    Limite Tags YouTube Studio :
                  </span>
                  <span className={`font-mono font-bold ${
                    isOverYoutube 
                      ? 'text-rose-600 dark:text-rose-400 animate-pulse' 
                      : youtubePercentage > 85 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {youtubeCharCount} / {youtubeMaxChars} car. ({youtubePercentage}%)
                  </span>
                </div>

                {/* Progress Bar YouTube */}
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isOverYoutube
                        ? 'bg-rose-500'
                        : youtubePercentage > 85
                        ? 'bg-amber-500'
                        : 'bg-indigo-600 dark:bg-indigo-500'
                    }`}
                    style={{ width: `${youtubePercentage}%` }}
                  />
                </div>

                {/* Status message */}
                {isOverYoutube ? (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg flex items-start justify-between gap-2 text-xs text-rose-700 dark:text-rose-300">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                      <span>
                        Dépassement de <strong>{youtubeCharCount - youtubeMaxChars} caractères</strong>. YouTube Studio bloquera l&apos;enregistrement.
                      </span>
                    </div>
                    <button
                      onClick={handleAutoTrimYouTube}
                      className="shrink-0 px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Ajuster automatiquement sous les 500 caractères"
                    >
                      <Scissors className="w-3 h-3" />
                      <span>Ajuster</span>
                    </button>
                  </div>
                ) : youtubeCharCount >= 380 && youtubeCharCount <= 500 ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Longueur SEO idéale pour YouTube Studio (densité maximale optimale).</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Il vous reste {youtubeMaxChars - youtubeCharCount} caractères disponibles pour ajouter des tags.</span>
                  </div>
                )}
              </div>
            )}

            {/* View 2: Instagram Dedicated Limit View */}
            {selectedGaugePlatform === 'instagram' && (
              <div className="space-y-2.5">
                {/* 1. Hashtags Count Gauge (Max 30) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-pink-500" />
                      Compteur Hashtags (Max 30) :
                    </span>
                    <span className={`font-mono font-bold ${
                      isOverInstagramTags 
                        ? 'text-rose-600 dark:text-rose-400 animate-pulse' 
                        : instagramTagCount > 25 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-pink-600 dark:text-pink-400'
                    }`}>
                      {instagramTagCount} / {instagramMaxTags} hashtags
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOverInstagramTags
                          ? 'bg-rose-500'
                          : instagramTagCount > 25
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-pink-500 to-rose-500'
                      }`}
                      style={{ width: `${instagramTagPercentage}%` }}
                    />
                  </div>
                </div>

                {/* 2. Caption Length Gauge (Max 2200 chars) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400">Longueur Texte Légende :</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {instagramCharCount} / {instagramMaxChars} car. ({instagramCharPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-300"
                      style={{ width: `${instagramCharPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Status message */}
                {isOverInstagramTags ? (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg flex items-start justify-between gap-2 text-xs text-rose-700 dark:text-rose-300">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                      <span>
                        Instagram autorise au maximum 30 hashtags (actuellement {instagramTagCount}).
                      </span>
                    </div>
                    <button
                      onClick={handleAutoTrimInstagram}
                      className="shrink-0 px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Garder les 30 premiers hashtags"
                    >
                      <Scissors className="w-3 h-3" />
                      <span>Limiter à 30</span>
                    </button>
                  </div>
                ) : instagramTagCount >= 5 && instagramTagCount <= 20 ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Densité idéale pour l&apos;algorithme Instagram Reels & Posts (5 à 20 hashtags ciblés).</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>{30 - instagramTagCount} emplacements de hashtags restants.</span>
                  </div>
                )}
              </div>
            )}

            {/* View 3: Comparative Overview (YouTube, Instagram, TikTok) */}
            {selectedGaugePlatform === 'all' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2.5 rounded-lg border ${
                    isOverYoutube 
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold flex items-center gap-1 text-slate-800 dark:text-slate-200">
                        <Youtube className="w-3 h-3 text-rose-500" /> YouTube
                      </span>
                      <span className={`font-mono text-[11px] font-bold ${
                        isOverYoutube ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {youtubeCharCount}/500
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isOverYoutube ? 'bg-rose-500' : 'bg-indigo-600'}`}
                        style={{ width: `${youtubePercentage}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      {isOverYoutube ? '⚠️ Trop long (-' + (youtubeCharCount - 500) + 'c)' : '✅ Compatible'}
                    </p>
                  </div>

                  <div className={`p-2.5 rounded-lg border ${
                    isOverInstagram 
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold flex items-center gap-1 text-slate-800 dark:text-slate-200">
                        <Instagram className="w-3 h-3 text-pink-500" /> Instagram
                      </span>
                      <span className={`font-mono text-[11px] font-bold ${
                        isOverInstagramTags ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {instagramTagCount}/30 #
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isOverInstagramTags ? 'bg-rose-500' : 'bg-pink-500'}`}
                        style={{ width: `${instagramTagPercentage}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      {isOverInstagramTags ? '⚠️ > 30 hashtags' : '✅ Conforme'}
                    </p>
                  </div>
                </div>

                {/* Score summary in comparative */}
                <div className="p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Score SEO Global : {seoScoreData.totalScore}/100 ({seoScoreData.gradeLabel})
                  </span>
                  <button
                    onClick={() => setSelectedGaugePlatform('seo')}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Détails →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* YouTube / Instagram Link Metadata Extractor Section */}
          <div className="px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
            <button
              id="toggle-link-extractor-btn"
              onClick={() => setIsLinkExtractorOpen(!isLinkExtractorOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <LinkIcon className="w-3.5 h-3.5" />
                </div>
                <span>Importer & Raffiner depuis un lien Vidéo</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  YouTube / Insta
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-[10px] font-normal hidden sm:inline">
                  {isLinkExtractorOpen ? 'Masquer' : 'Extraire tags & contexte'}
                </span>
                {isLinkExtractorOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            <AnimatePresence>
              {isLinkExtractorOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pt-2.5 pb-1 space-y-2.5"
                >
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Collez l&apos;URL d&apos;un clip YouTube ou Reel Instagram pour extraire automatiquement son titre, créateur et un set de tags ciblés.
                  </p>

                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        id="video-url-input"
                        type="url"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleExtractMetadata();
                          }
                        }}
                        placeholder="https://www.youtube.com/watch?v=... ou instagram.com/reel/..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    </div>

                    <button
                      id="extract-metadata-btn"
                      onClick={() => handleExtractMetadata()}
                      disabled={isExtracting || !videoUrlInput.trim()}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all ${
                        isExtracting || !videoUrlInput.trim()
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                      }`}
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Extraction...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Extraire</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Fast Example Links */}
                  <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    <span className="text-slate-400">Exemples rapides :</span>
                    <button
                      type="button"
                      onClick={() => {
                        const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
                        setVideoUrlInput("https://www.youtube.com/watch?v=k1BneeJTDcU");
                        handleExtractMetadata("https://www.youtube.com/watch?v=k1BneeJTDcU");
                      }}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      Clip YouTube (Serane)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoUrlInput("https://www.instagram.com/reel/C3_exampleRapFR/");
                        handleExtractMetadata("https://www.instagram.com/reel/C3_exampleRapFR/");
                      }}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-pink-400 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      Reel Instagram
                    </button>
                  </div>

                  {/* Error display */}
                  {extractionError && (
                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{extractionError}</span>
                    </div>
                  )}

                  {/* Extracted Metadata Card Preview */}
                  {extractedMetadata && (
                    <div className="p-3 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/80 rounded-xl space-y-2.5 shadow-xs">
                      <div className="flex items-start gap-2.5">
                        {extractedMetadata.thumbnailUrl && (
                          <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                            <img
                              src={extractedMetadata.thumbnailUrl}
                              alt={extractedMetadata.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/70 text-white">
                              {extractedMetadata.platform === 'youtube' ? (
                                <Youtube className="w-2.5 h-2.5 text-rose-500" />
                              ) : (
                                <Instagram className="w-2.5 h-2.5 text-pink-400" />
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={extractedMetadata.title}>
                            {extractedMetadata.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            Chaîne / Créateur : <span className="font-semibold text-slate-700 dark:text-slate-300">{extractedMetadata.authorName}</span>
                          </p>

                          {(extractedMetadata.parsedArtist || extractedMetadata.parsedTrack) && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">
                                {extractedMetadata.parsedArtist || 'Artiste'} • {extractedMetadata.parsedTrack || 'Titre'}
                              </span>
                              {(onSetArtistName || onSetTrackName) && (
                                <button
                                  type="button"
                                  onClick={handleApplyExtractedArtistTrack}
                                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                                  title="Utiliser cet artiste et titre dans l'application"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Synchroniser</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Suggested Tags from context */}
                      {extractedMetadata.suggestedTags && extractedMetadata.suggestedTags.length > 0 && (
                        <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              Tags & Mots-clés extraits ({extractedMetadata.suggestedTags.length}) :
                            </span>
                            <span className="text-[10px] text-slate-400">Cliquez pour ajouter</span>
                          </div>

                          <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-0.5">
                            {extractedMetadata.suggestedTags.map((tag) => {
                              const isAlreadyInBasket = selectedTags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => {
                                    if (isAlreadyInBasket) {
                                      onRemoveTag(tag);
                                    } else {
                                      onAddTags([tag]);
                                    }
                                  }}
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                                    isAlreadyInBasket
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  {isAlreadyInBasket ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                                  <span>{tag}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Quick Batch Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleAddAllExtractedTags}
                              className="flex-1 py-1 px-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Tout ajouter au panier</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleReplaceBasketWithExtracted}
                              className="py-1 px-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              title="Vider le panier et mettre ces tags extraits"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Remplacer panier</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Format Selector Pills */}
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider shrink-0 mr-1">
              Format :
            </span>
            <button
              onClick={() => setFormat('comma')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                format === 'comma'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              YouTube (Virgules)
            </button>
            <button
              onClick={() => setFormat('hashtag')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1 ${
                format === 'hashtag'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Hash className="w-3 h-3" />
              Hashtags (Insta/TikTok)
            </button>
            <button
              onClick={() => setFormat('newline')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                format === 'newline'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Lignes
            </button>
            <button
              onClick={() => setFormat('quotes')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                format === 'quotes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              &quot;Guillemets&quot;
            </button>
          </div>

          {/* Tags List / Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedTags.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Votre panier est vide</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
                  Cliquez sur les tags de la bibliothèque ou choisissez un pack prêt à l&apos;emploi pour les ajouter ici.
                </p>

                <div className="w-full space-y-2 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Ajouter rapidement un pack :
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MASTER_PACKS.slice(0, 4).map((pack) => (
                      <button
                        key={pack.id}
                        onClick={() => onAddTags(pack.tags)}
                        className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-left transition-colors"
                      >
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{pack.name.split('—')[1] || pack.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Plus className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> {pack.tags.length} tags
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Visual Preview Box */}
                <div className="relative bg-slate-50 dark:bg-slate-950 rounded-lg p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed max-h-36 overflow-y-auto">
                  <div className="select-all whitespace-pre-wrap">{outputText}</div>
                </div>

                {/* Individual Tags Toolbar & Chips */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tags dans le panier ({selectedTags.length})
                    </span>

                    {/* Quick Tools: Deduplicate, Sort, Lowercase */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleDeduplicate}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold transition-colors cursor-pointer"
                        title="Supprimer les doublons dans le panier"
                      >
                        Dédoublonner
                      </button>

                      <button
                        type="button"
                        onClick={() => setSortOrder(prev => prev === 'az' ? 'default' : 'az')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-0.5 cursor-pointer ${
                          sortOrder === 'az'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                        title="Trier par ordre alphabétique A-Z"
                      >
                        <ArrowDownAZ className="w-2.5 h-2.5" />
                        <span>A-Z</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToLowerCase}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold transition-colors flex items-center gap-0.5 cursor-pointer"
                        title="Convertir tous les tags en minuscules"
                      >
                        <CaseLower className="w-2.5 h-2.5" />
                        <span>min</span>
                      </button>
                    </div>
                  </div>

                  {/* Search within basket (if more than 6 tags) */}
                  {selectedTags.length > 6 && (
                    <div className="relative">
                      <input
                        type="text"
                        value={basketSearch}
                        onChange={(e) => setBasketSearch(e.target.value)}
                        placeholder="Filtrer dans vos tags..."
                        className="w-full pl-7 pr-3 py-1 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      {basketSearch && (
                        <button
                          type="button"
                          onClick={() => setBasketSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1">
                    {displayedTags.map((tag, idx) => (
                      <span
                        key={`${tag}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 group transition-all"
                      >
                        <span 
                          onClick={() => onCopySuccess(tag, `Tag copié : "${tag}"`)}
                          className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Cliquer pour copier uniquement ce tag"
                        >
                          {tag}
                        </span>
                        <button
                          onClick={() => onRemoveTag(tag)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
                          title="Supprimer ce tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer / Copy & Export Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2">
            <button
              onClick={handleCopy}
              disabled={selectedTags.length === 0}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : selectedTags.length === 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copié dans le presse-papier !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Tout Copier ({selectedTags.length} tags • {format.toUpperCase()})</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="export-csv-basket-btn"
                onClick={handleExportCsv}
                disabled={selectedTags.length === 0}
                className="py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                title="Exporter sous format tableau CSV (Excel, Google Sheets)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Exporter .CSV</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={selectedTags.length === 0}
                className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Télécharger .TXT</span>
              </button>
            </div>

            <button
              onClick={onClearBasket}
              disabled={selectedTags.length === 0}
              className="w-full py-1.5 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3 h-3" />
              <span>Vider le panier</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
