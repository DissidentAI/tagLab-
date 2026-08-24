import React, { useState } from 'react';
import { 
  Youtube, 
  Instagram, 
  Copy, 
  Plus, 
  Check, 
  Sparkles, 
  Tag as TagIcon
} from 'lucide-react';
import { SeoPlatformMode } from '../types';
import { formatTag } from '../data/masterTags';

interface TagTooltipProps {
  rawTag: string;
  artistName?: string;
  trackName?: string;
  isSelected?: boolean;
  onToggle?: () => void;
  onCopy?: (text: string) => void;
  platformMode?: SeoPlatformMode;
  categoryName?: string;
  className?: string;
}

export const TagTooltip: React.FC<TagTooltipProps> = ({
  rawTag,
  artistName = '',
  trackName = '',
  isSelected = false,
  onToggle,
  onCopy,
  platformMode = 'both',
  categoryName = '',
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const formattedTag = formatTag(rawTag, artistName, trackName);
  const hashtag = '#' + formattedTag.replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, '');
  const charLength = formattedTag.length;

  // Derive SEO advice based on tag content
  const getTagSeoType = () => {
    const lower = formattedTag.toLowerCase();
    if (lower.includes('{artiste}') || (artistName && lower.includes(artistName.toLowerCase()))) {
      return {
        type: 'Identité & Marque',
        ytTip: 'Crucial : aide l\'algorithme YouTube à lier toutes vos sorties et vidéos entre elles dans les "Vidéos Suggérées".',
        igTip: 'Hashtag de marque personnel à répéter sur chaque publication pour créer un flux dédié.',
        color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
      };
    }
    if (lower.includes('plug') || lower.includes('trap') || lower.includes('rage') || lower.includes('drill') || lower.includes('cloud')) {
      return {
        type: 'Sous-Genre & Niche',
        ytTip: 'Fort taux de conversion : cible les auditeurs et passionnés de sous-genres précis plutôt que le rap grand public.',
        igTip: 'Hashtag de communauté très engagé. Idéal pour être exploré par les fans du genre.',
        color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800',
      };
    }
    if (lower.includes('nocturne') || lower.includes('mélancolique') || lower.includes('808') || lower.includes('nuit') || lower.includes('autotune')) {
      return {
        type: 'Ambiance & Production',
        ytTip: 'Requête de longue traîne : capte les recherches d\'humeur ("rap nuit", "son mélancolique", "slowed").',
        igTip: 'Hashtag de vibe visuelle et sonore pour les Reels esthétiques et vidéos de nuit.',
        color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800',
      };
    }
    if (lower.includes('clip') || lower.includes('officiel') || lower.includes('lyrics') || lower.includes('visualizer')) {
      return {
        type: 'Format & Type de Contenu',
        ytTip: 'Intention de recherche explicite : les utilisateurs recherchant "clip" ou "lyrics" cliquent en priorité.',
        igTip: 'Permet de clarifier le statut de la vidéo (nouveau visuel / extrait de session).',
        color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      };
    }
    return {
      type: categoryName || 'Mot-clé Référencement',
      ytTip: 'Mot-clé stratégique complémentaire pour enrichir la sémantique de votre vidéo YouTube.',
      igTip: 'Hashtag additionnel à combiner avec vos tags de niche.',
      color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    };
  };

  const seoData = getTagSeoType();

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = platformMode === 'instagram' ? hashtag : formattedTag;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    if (onCopy) onCopy(textToCopy);
    setTimeout(() => setIsCopied(false), 1800);
  };

  return (
    <div 
      className="relative inline-block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {/* Interactive Tag Pill */}
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none border cursor-pointer ${
          isSelected
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
            : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800'
        } ${className}`}
      >
        <span className="truncate max-w-[200px] sm:max-w-[280px]">{formattedTag}</span>

        {/* Action icons on tag */}
        <span className="flex items-center gap-1 ml-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
          {isSelected ? (
            <Check className="w-3 h-3 text-white" />
          ) : (
            <Plus className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          )}
        </span>
      </button>

      {/* Rich Contextual Tooltip */}
      {isHovered && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 sm:w-80 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-left pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150"
          role="tooltip"
        >
          {/* Tooltip Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${seoData.color}`}>
                {seoData.type}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              {charLength} car.
            </span>
          </div>

          {/* Tag text preview */}
          <div className="mb-2">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              &quot;{formattedTag}&quot;
            </p>
            <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 truncate">
              {hashtag}
            </p>
          </div>

          {/* Platform Specific SEO Advice */}
          <div className="space-y-1.5 text-[11px] leading-relaxed">
            {(platformMode === 'youtube' || platformMode === 'both') && (
              <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-400 mb-0.5 text-[10px]">
                  <Youtube className="w-3 h-3" />
                  <span>Conseil SEO YouTube Studio :</span>
                </div>
                <p>{seoData.ytTip}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Poids dans le quota : ~{charLength + 2} / 500 car.
                </p>
              </div>
            )}

            {(platformMode === 'instagram' || platformMode === 'both') && (
              <div className="p-2 rounded-lg bg-pink-50/70 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/50 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1 font-bold text-pink-700 dark:text-pink-400 mb-0.5 text-[10px]">
                  <Instagram className="w-3 h-3" />
                  <span>Conseil SEO Instagram & Reels :</span>
                </div>
                <p>{seoData.igTip}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Hashtag : <code className="font-mono text-pink-700 dark:text-pink-300">{hashtag}</code>
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions in Tooltip */}
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCopyClick}
              className="flex-1 py-1 px-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copier ({platformMode === 'instagram' ? 'Hashtag' : 'Texte'})</span>
                </>
              )}
            </button>

            {onToggle && (
              <button
                type="button"
                onClick={onToggle}
                className={`py-1 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  isSelected
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isSelected ? 'Retirer' : 'Ajouter'}
              </button>
            )}
          </div>

          {/* Bottom Arrow Pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800 transform rotate-45" />
        </div>
      )}
    </div>
  );
};
