import React from 'react';
import { 
  Sparkles, 
  Library, 
  Layers, 
  Bot, 
  BookOpen, 
  ShoppingBag, 
  User, 
  Music,
  Sliders,
  Sun,
  Moon,
  Target
} from 'lucide-react';
import { calculateSeoScore } from '../utils/seoScorer';

interface NavbarProps {
  activeTab: 'library' | 'packs' | 'ai' | 'seo';
  setActiveTab: (tab: 'library' | 'packs' | 'ai' | 'seo') => void;
  artistName: string;
  setArtistName: (name: string) => void;
  trackName: string;
  setTrackName: (name: string) => void;
  basketCount: number;
  openBasket: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  selectedTags?: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  artistName,
  setArtistName,
  trackName,
  setTrackName,
  basketCount,
  openBasket,
  theme,
  onToggleTheme,
  selectedTags = [],
}) => {
  const seoScoreData = React.useMemo(() => {
    return calculateSeoScore(selectedTags, artistName, trackName);
  }, [selectedTags, artistName, trackName]);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Top Banner / Brand & Global Metadata Inputs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
          
          {/* Logo & Tagline */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center">
                    <span>tag</span>
                    <span className="text-indigo-600 dark:text-indigo-400">Lab</span>
                  </h1>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    SEO & AI v2.5
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tags Rap FR, Score SEO YouTube & Instagram, Générateur IA
                </p>
              </div>
            </div>

            {/* Mobile Theme Switcher Toggle */}
            <button
              onClick={onToggleTheme}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-label="Changer de thème"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

          {/* Quick Artist, Track Customizer, SEO Score Badge & Theme Toggle */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="relative flex-1 sm:w-36 lg:w-40">
              <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="global-artist-input"
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Nom d'artiste..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-medium shadow-2xs"
              />
            </div>

            <div className="relative flex-1 sm:w-36 lg:w-40">
              <Music className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="global-track-input"
                type="text"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                placeholder="Titre morceau..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-medium shadow-2xs"
              />
            </div>

            {/* Desktop Theme Switcher Button */}
            <button
              onClick={onToggleTheme}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 shadow-2xs"
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline">Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden lg:inline">Sombre</span>
                </>
              )}
            </button>

            {/* SEO Quick Badge (if basket has tags) */}
            {basketCount > 0 && (
              <button
                onClick={openBasket}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-2xs transition-colors shrink-0"
                title="Score SEO calculé sur vos tags sélectionnés"
              >
                <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-700 dark:text-slate-300">SEO</span>
                <span className={`px-1.5 py-0.2 rounded font-black text-[11px] ${
                  seoScoreData.totalScore >= 80 
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                    : seoScoreData.totalScore >= 60 
                    ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300' 
                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                }`}>
                  {seoScoreData.totalScore}/100
                </span>
              </button>
            )}

            {/* Basket Button in Header */}
            <button
              onClick={openBasket}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 shadow-sm ${
                basketCount > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panier</span>
              {basketCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 text-[10px] font-black flex items-center justify-center">
                  {basketCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between py-2 overflow-x-auto no-scrollbar gap-2">
          <nav className="flex items-center gap-1.5 min-w-max">
            <button
              id="nav-tab-library"
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'library'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Library className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Bibliothèque (549 Tags)</span>
            </button>

            <button
              id="nav-tab-packs"
              onClick={() => setActiveTab('packs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'packs'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>6 Packs Prêts à Copier</span>
            </button>

            <button
              id="nav-tab-ai"
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Générateur IA & Analyse Audio</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white shadow-2xs">
                LIVE
              </span>
            </button>

            <button
              id="nav-tab-seo"
              onClick={() => setActiveTab('seo')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'seo'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Conseils SEO & Rétention</span>
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Sliders className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Artiste :</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[11px]">
              {artistName.trim() || "[NOM D'ARTISTE]"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
