import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Plus, 
  Layers, 
  Sparkles, 
  SlidersHorizontal,
  Hash,
  ExternalLink,
  Flame
} from 'lucide-react';
import { MASTER_CATEGORIES, TOTAL_UNIQUE_TAGS, formatTag, formatTagsList } from '../data/masterTags';
import { TagCategory } from '../types';

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

  const handleAddAllCategoryToBasket = (category: TagCategory) => {
    onAddTags(category.tags);
    onCopySuccess('', `${category.tags.length} tags de "${category.name}" ajoutés au panier.`);
  };

  const handleCopyIndividualTag = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    const formatted = formatTag(tag, artistName, trackName);
    navigator.clipboard.writeText(formatted);
    onCopySuccess(formatted, `Tag "${formatted}" copié !`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="relative rounded-xl bg-white p-5 sm:p-6 border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-indigo-600" />
              <span>Base Master SEO 2026</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{TOTAL_UNIQUE_TAGS} Tags uniques</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Bibliothèque Master Tags Rap FR & Plug
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Sélectionnez, filtrez et copiez les tags idéaux pour YouTube, SoundCloud et les réseaux. Remplacement automatique du nom d'artiste et du titre du morceau.
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
              onClick={() => onAddTags(allTagsList)}
              className="px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Tout au Panier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-master-tags"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher parmi les 549 tags (ex: pluggnb, 808, mélodique, 2026, nuit, autotune...)"
              className="w-full pl-10 pr-10 py-2.5 bg-white text-sm text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-2xs font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Matches Count Pill */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-slate-500 px-1">
            <span>{matchingTagsCount} tags affichés</span>
            {selectedTags.length > 0 && (
              <button
                onClick={onOpenBasket}
                className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2 font-bold"
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
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
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
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name.split('/')[0].trim()} ({cat.tags.length})
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">Aucun tag trouvé</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Aucun tag ne correspond à votre recherche &quot;{searchQuery}&quot;. Essayez d'autres mots-clés ou réinitialisez le filtre.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryId('all');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
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
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-colors"
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        {category.name}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {category.tags.length} tags
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-xs text-slate-500">{category.description}</p>
                    )}
                  </div>

                  {/* Category Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                        isCategoryCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isCategoryCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copier ({category.tags.length})</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleAddAllCategoryToBasket(category)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                        categoryAllInBasket
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{categoryAllInBasket ? 'Déjà au panier' : '+ Panier'}</span>
                    </button>
                  </div>
                </div>

                {/* Tags Grid */}
                <div className="flex flex-wrap gap-2">
                  {category.tags.map((rawTag, tagIndex) => {
                    const formatted = formatTag(rawTag, artistName, trackName);
                    const isSelected = selectedTags.includes(rawTag);

                    return (
                      <div
                        key={`${category.id}-${tagIndex}`}
                        onClick={() => onToggleTag(rawTag)}
                        title="Cliquez pour ajouter/retirer du panier ou utilisez le bouton copier"
                        className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border select-none ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                        }`}
                      >
                        <span className="font-mono text-xs">{formatted}</span>

                        {/* Direct copy icon on hover */}
                        <button
                          onClick={(e) => handleCopyIndividualTag(e, rawTag)}
                          title="Copier ce tag seul"
                          className={`p-0.5 rounded transition-colors ${
                            isSelected
                              ? 'text-indigo-200 hover:text-white hover:bg-indigo-700'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
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
