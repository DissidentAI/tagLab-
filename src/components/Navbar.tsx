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
  Sliders
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'library' | 'packs' | 'ai' | 'seo';
  setActiveTab: (tab: 'library' | 'packs' | 'ai' | 'seo') => void;
  artistName: string;
  setArtistName: (name: string) => void;
  trackName: string;
  setTrackName: (name: string) => void;
  basketCount: number;
  openBasket: () => void;
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
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner / Brand & Global Metadata Inputs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  TagPulse <span className="text-indigo-600">Master Tags</span>
                </h1>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  AI Engine Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                549 Tags SEO certifiés, 6 Packs Prêts & Analyseur Multimodal
              </p>
            </div>
          </div>

          {/* Quick Artist & Track Customizer */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <div className="relative flex-1 sm:w-44">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="global-artist-input"
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Nom d'artiste..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-medium shadow-2xs"
              />
            </div>

            <div className="relative flex-1 sm:w-44">
              <Music className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="global-track-input"
                type="text"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                placeholder="Titre du morceau..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-medium shadow-2xs"
              />
            </div>

            <button
              onClick={openBasket}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 shadow-sm ${
                basketCount > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panier</span>
              {basketCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-indigo-600 text-[10px] font-black flex items-center justify-center">
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
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Library className="w-4 h-4 text-indigo-600" />
              <span>Bibliothèque (549 Tags)</span>
            </button>

            <button
              id="nav-tab-packs"
              onClick={() => setActiveTab('packs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'packs'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>6 Packs Prêts à Copier</span>
            </button>

            <button
              id="nav-tab-ai"
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Générateur IA & Analyse Audio / Paroles</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white shadow-2xs">
                PRO
              </span>
            </button>

            <button
              id="nav-tab-seo"
              onClick={() => setActiveTab('seo')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'seo'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Conseils SEO & Rétention</span>
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Remplacement auto :</span>
            <span className="text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
              {artistName.trim() || "[NOM D'ARTISTE]"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
