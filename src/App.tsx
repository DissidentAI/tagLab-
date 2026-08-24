import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { MasterTagsView } from './components/MasterTagsView';
import { PacksView } from './components/PacksView';
import { AiStudioView } from './components/AiStudioView';
import { SeoGuideView } from './components/SeoGuideView';
import { TagBasketDrawer } from './components/TagBasketDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ShoppingBag, Target } from 'lucide-react';
import { calculateSeoScore } from './utils/seoScorer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'library' | 'packs' | 'ai' | 'seo'>('library');
  const [artistName, setArtistName] = useState<string>('');
  const [trackName, setTrackName] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isBasketOpen, setIsBasketOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taglab-theme') || localStorage.getItem('tagpulse-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('taglab-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // SEO Score calculation for real-time floating feedback
  const seoScoreData = useMemo(() => {
    return calculateSeoScore(selectedTags, artistName, trackName);
  }, [selectedTags, artistName, trackName]);

  // Toast Helper
  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Basket Management
  const handleAddTags = (tags: string[]) => {
    setSelectedTags((prev) => {
      const combined = [...prev];
      tags.forEach((tag) => {
        if (!combined.includes(tag)) {
          combined.push(tag);
        }
      });
      return combined;
    });
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        showToast('Tag retiré du panier', tag, 'info');
        return prev.filter((t) => t !== tag);
      } else {
        showToast('Tag ajouté au panier', tag, 'success');
        return [...prev, tag];
      }
    });
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleClearBasket = () => {
    setSelectedTags([]);
    showToast('Panier vidé', undefined, 'info');
  };

  const handleSendToAi = (vibePrompt: string) => {
    setAiInitialPrompt(vibePrompt);
    setActiveTab('ai');
    showToast('Prompt transmis au Studio IA', `Vibe : ${vibePrompt}`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased flex flex-col transition-colors duration-150">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        artistName={artistName}
        setArtistName={setArtistName}
        trackName={trackName}
        setTrackName={setTrackName}
        basketCount={selectedTags.length}
        openBasket={() => setIsBasketOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        selectedTags={selectedTags}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {activeTab === 'library' && (
          <MasterTagsView
            artistName={artistName}
            trackName={trackName}
            selectedTags={selectedTags}
            onToggleTag={handleToggleTag}
            onAddTags={handleAddTags}
            onCopySuccess={(text, title) => showToast(title, text ? `(${text.length} caractères)` : undefined, 'success')}
            onOpenBasket={() => setIsBasketOpen(true)}
          />
        )}

        {activeTab === 'packs' && (
          <PacksView
            artistName={artistName}
            trackName={trackName}
            onAddTags={handleAddTags}
            onCopySuccess={(text, title) => showToast(title, text ? `(${text.length} caractères)` : undefined, 'success')}
            onSendToAi={handleSendToAi}
            onOpenBasket={() => setIsBasketOpen(true)}
          />
        )}

        {activeTab === 'ai' && (
          <AiStudioView
            artistName={artistName}
            setArtistName={setArtistName}
            trackName={trackName}
            setTrackName={setTrackName}
            onAddTags={handleAddTags}
            onCopySuccess={(text, title) => showToast(title, text ? `(${text.length} caractères)` : undefined, 'success')}
            onOpenBasket={() => setIsBasketOpen(true)}
            initialPrompt={aiInitialPrompt}
            selectedTags={selectedTags}
          />
        )}

        {activeTab === 'seo' && (
          <SeoGuideView
            onGoToLibrary={() => setActiveTab('library')}
            onGoToPacks={() => setActiveTab('packs')}
            selectedTags={selectedTags}
            artistName={artistName}
            trackName={trackName}
            onAddTags={handleAddTags}
            onCopySuccess={(text, title) => showToast(title, text ? `(${text.length} caractères)` : undefined, 'success')}
            onOpenBasket={() => setIsBasketOpen(true)}
          />
        )}
      </main>

      {/* Floating Bottom Basket Bar when tags are selected */}
      {selectedTags.length > 0 && !isBasketOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[calc(100%-2rem)] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-white/95 dark:bg-slate-900/95 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-3 shadow-xl backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {selectedTags.length}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>Tags sélectionnés</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    seoScoreData.totalScore >= 80
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : seoScoreData.totalScore >= 60
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                  }`}>
                    SEO {seoScoreData.totalScore}/100
                  </span>
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Vérifiez les jauges YouTube & Instagram</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBasketOpen(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Ouvrir Panier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Basket Drawer */}
      <TagBasketDrawer
        isOpen={isBasketOpen}
        onClose={() => setIsBasketOpen(false)}
        selectedTags={selectedTags}
        onRemoveTag={handleRemoveTag}
        onClearBasket={handleClearBasket}
        onAddTags={handleAddTags}
        artistName={artistName}
        trackName={trackName}
        onSetArtistName={setArtistName}
        onSetTrackName={setTrackName}
        onCopySuccess={(text, title) => showToast(title, text ? `(${text.length} caractères)` : '', 'success')}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
