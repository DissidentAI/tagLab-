import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Plus, 
  Flame,
  FileSpreadsheet,
  Youtube,
  Instagram,
  Sparkles,
  Layers
} from 'lucide-react';
import { MASTER_CATEGORIES, TOTAL_UNIQUE_TAGS, formatTag, formatTagsList } from '../data/masterTags';
import { TagCategory, SeoPlatformMode } from '../types';
import { TagTooltip } from './TagTooltip';
import { downloadTagsCsv } from '../utils/csvExport';

interface MasterTagsViewProps {
  artistName: string;
  trackName: string;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onAddTags: (tags: string[]) => void;
  onCopySuccess: (text: string, title: string) => void;
  onOpenBasket: () => void;
}

export const MasterTagsView: React.FC<MasterTagsViewProps> = ({
  artistName,
  trackName,
  selectedTags,
  onToggleTag,
  onAddTags,
  onCopySuccess,
  onOpenBasket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [copiedCategoryId, setCopiedCategoryId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [seoPlatformMode, setSeoPlatformMode] = useState<SeoPlatformMode>('both');

  // Filtered categories and tags based on search query
  const filteredCategories = useMemo(() => {
    let list = MASTER_CATEGORIES;

    if (selectedCategoryId !== 'all') {
      list = list.filter(c => c.id === selectedCategoryId);
    }

    if (!searchQuery.trim()) {
      return list;
    }

    const query = searchQuery.toLowerCase().trim();

    return list.map(category => {
      const matchingTags = category.tags.filter(tag => {
        const formatted = formatTag(tag, artistName, trackName).toLowerCase();
        return formatted.includes(query) || tag.toLowerCase().includes(query);
      });

      return {
        ...category,
        tags: matchingTags,
      };
    }).filter(c => c.tags.length > 0);
  }, [searchQuery, selectedCategoryId, artistName, trackName]);

  // Total matching tags count
  const matchingTagsCount = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.tags.length, 0);
  }, [filteredCategories]);

  // All 549 tags flattened
  const allTagsList = useMemo(() => {
    const all = MASTER_CATEGORIES.flatMap(c => c.tags);
    return Array.from(new Set(all));
  }, []);

  const handleCopyCategory = (category: TagCategory) => {
    const formatted = formatTagsList(category.tags, artistName, trackName);
    const text = formatted.join(', ');
    navigator.clipboard.writeText(text);
    setCopiedCategoryId(category.id);
    onCopySuccess(text, `Catégorie "${category.name}" (${formatted.length} tags) copiée !`);
    setTimeout(() => setCopiedCategoryId(null), 2000);
  };

  const handleCopyAll = () => {
    const formatted = formatTagsList(allTagsList, artistName, trackName);
    const text = formatted.join(', ');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    onCopySuccess(text, `La bibliothèque entière (${formatted.length} tags uniques) a été copiée !`);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleExportAllCsv = () => {
    const tagsToExport = searchQuery.trim() || selectedCategoryId !== 'all'
      ? filteredCategories.flatMap(c => c.tags)
      : allTagsList;

    downloadTagsCsv(tagsToExport, artistName, trackName, 'master-tags-database');
    onCopySuccess('', `${tagsToExport.length} tags exportés en fichier CSV (tableur Excel / Sheets) !`);
  };

  const handleAddAllCategoryToBasket = (category: TagCategory) => {
    onAddTags(category.tags);
    onCopySuccess('', `${category.tags.length} tags de "${category.name}" ajoutés au panier.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="relative rounded-xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Base Master SEO 2026</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{TOTAL_UNIQUE_TAGS} Tags uniques</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Bibliothèque Master Tags Rap FR & Plug
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Survolez les tags pour afficher les <strong>infobulles SEO dynamiques</strong> (YouTube Studio vs Instagram). Sélectionnez, filtrez et exportez en CSV ou texte en un clic.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="copy-all-master-tags-btn"
              onClick={handleCopyAll}
              className={`px-4 py-2.5 rounded-lg font-semibold text-xs flex items-center gap-2 shadow-sm transition-all ${
                copiedAll
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>549 Tags Copiés !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Tout Copier ({TOTAL_UNIQUE_TAGS} Tags)</span>
                </>
              )}
            </button>

            <button
              id="export-csv-master-btn"
              onClick={handleExportAllCsv}
              className="px-3.5 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Exporter les mots-clés sous forme de tableur CSV pour base de données hors-ligne"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Exporter CSV</span>
            </button>

            <button
              onClick={() => onAddTags(allTagsList)}
              className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Tout au Panier</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEO Platform Focus Selector & Search Controls */}
      <div className="space-y-3">
        {/* SEO Platform Mode Toggle Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Infobulles SEO Actives :
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              id="seo-mode-both"
              onClick={() => setSeoPlatformMode('both')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                seoPlatformMode === 'both'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tous Conseils</span>
            </button>

            <button
              id="seo-mode-youtube"
              onClick={() => setSeoPlatformMode('youtube')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                seoPlatformMode === 'youtube'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Focus YouTube</span>
            </button>

            <button
              id="seo-mode-instagram"
              onClick={() => setSeoPlatformMode('instagram')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                seoPlatformMode === 'instagram'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400'
              }`}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Focus Instagram</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-master-tags"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher parmi les 549 tags (ex: pluggnb, 808, mélodique, 2026, nuit, autotune...)"
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-850 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-2xs font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Matches Count Pill */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
            <span>{matchingTagsCount} tags affichés</span>
            {selectedTags.length > 0 && (
              <button
                onClick={onOpenBasket}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-2 font-bold"
              >
                ({selectedTags.length} dans le panier)
              </button>
            )}
          </div>
        </div>

        {/* Categories Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Toutes les Catégories ({MASTER_CATEGORIES.length})
          </button>

          {MASTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name.split('/')[0].trim()} ({cat.tags.length})
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <Search className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Aucun tag trouvé</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Aucun tag ne correspond à votre recherche &quot;{searchQuery}&quot;. Essayez d&apos;autres mots-clés ou réinitialisez le filtre.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryId('all');
            }}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category) => {
            const isCategoryCopied = copiedCategoryId === category.id;
            const categoryAllInBasket = category.tags.every(t => selectedTags.includes(t));

            return (
              <div
                key={category.id}
                id={`category-${category.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {category.name}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {category.tags.length} tags
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{category.description}</p>
                    )}
                  </div>

                  {/* Category Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                        isCategoryCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isCategoryCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>Copier ({category.tags.length})</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleAddAllCategoryToBasket(category)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                        categoryAllInBasket
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{categoryAllInBasket ? 'Déjà au panier' : '+ Panier'}</span>
                    </button>
                  </div>
                </div>

                {/* Tags Grid with Rich SEO Tooltips */}
                <div className="flex flex-wrap gap-2">
                  {category.tags.map((rawTag, tagIndex) => {
                    const isSelected = selectedTags.includes(rawTag);

                    return (
                      <TagTooltip
                        key={`${category.id}-${tagIndex}`}
                        rawTag={rawTag}
                        artistName={artistName}
                        trackName={trackName}
                        isSelected={isSelected}
                        categoryName={category.name}
                        platformMode={seoPlatformMode}
                        onToggle={() => onToggleTag(rawTag)}
                        onCopy={(text) => onCopySuccess(text, `Tag "${text}" copié !`)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
