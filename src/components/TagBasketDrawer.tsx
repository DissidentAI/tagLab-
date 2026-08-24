import React, { useState } from 'react';
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
  FileText, 
  Share2,
  Plus
} from 'lucide-react';
import { CopyFormat } from '../types';
import { MASTER_PACKS, formatTagsList } from '../data/masterTags';

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
}

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
}) => {
  const [format, setFormat] = useState<CopyFormat>('comma');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Format tags
  const formattedTags = formatTagsList(selectedTags, artistName, trackName);

  // Compute text according to chosen format
  const getOutputText = () => {
    switch (format) {
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
  const charCount = outputText.length;
  const youtubeMaxChars = 500;
  const isOverYoutubeLimit = charCount > youtubeMaxChars && format === 'comma';
  const percentage = Math.min(100, Math.round((charCount / youtubeMaxChars) * 100));

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
    a.download = `tags-${(artistName || 'artiste').toLowerCase().replace(/\s+/g, '-')}-${(trackName || 'track').toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide">Panier de Tags</h2>
                <p className="text-xs text-slate-500">
                  {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} sélectionné{selectedTags.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {selectedTags.length > 0 && (
                <button
                  onClick={onClearBasket}
                  title="Vider le panier"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Limit Bar & Gauge */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                Jauge Caractères YouTube SEO :
              </span>
              <span className={`font-mono font-bold ${
                isOverYoutubeLimit ? 'text-rose-600 animate-pulse' : 'text-indigo-600'
              }`}>
                {charCount} / {youtubeMaxChars} car.
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverYoutubeLimit
                    ? 'bg-rose-500'
                    : percentage > 85
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {isOverYoutubeLimit && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-600 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Attention : Dépasse les 500 caractères autorisés par YouTube. Retirez quelques tags !</span>
              </div>
            )}
          </div>

          {/* Format Selector Pills */}
          <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
              Format :
            </span>
            <button
              onClick={() => setFormat('comma')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                format === 'comma'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              YouTube (Virgules)
            </button>
            <button
              onClick={() => setFormat('hashtag')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1 ${
                format === 'hashtag'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Hash className="w-3 h-3" />
              Hashtags
            </button>
            <button
              onClick={() => setFormat('newline')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                format === 'newline'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Lignes
            </button>
            <button
              onClick={() => setFormat('quotes')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                format === 'quotes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              &quot;Guillemets&quot;
            </button>
          </div>

          {/* Tags List / Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedTags.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
                <Sparkles className="w-10 h-10 text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">Votre panier est vide</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  Cliquez sur les tags de la bibliothèque ou choisissez un pack prêt à l'emploi pour les ajouter ici.
                </p>

                <div className="w-full space-y-2 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Ajouter rapidement un pack :
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MASTER_PACKS.slice(0, 4).map((pack) => (
                      <button
                        key={pack.id}
                        onClick={() => onAddTags(pack.tags)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
                      >
                        <p className="text-xs font-semibold text-slate-800 truncate">{pack.name.split('—')[1] || pack.name}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Plus className="w-2.5 h-2.5 text-indigo-600" /> {pack.tags.length} tags
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Visual Preview Box */}
                <div className="relative bg-slate-50 rounded-lg p-3 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed max-h-36 overflow-y-auto">
                  <div className="select-all whitespace-pre-wrap">{outputText}</div>
                </div>

                {/* Individual Tags Chips with Remove */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Liste des tags ({selectedTags.length})</span>
                    <span className="text-[10px] text-slate-400">Cliquez sur la croix pour retirer</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1">
                    {formattedTags.map((tag, idx) => (
                      <span
                        key={`${tag}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 hover:border-slate-300 group transition-all"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => onRemoveTag(selectedTags[idx])}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
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
          <div className="p-4 border-t border-slate-200 bg-white flex flex-col gap-2">
            <button
              onClick={handleCopy}
              disabled={selectedTags.length === 0}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : selectedTags.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
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

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={selectedTags.length === 0}
                className="flex-1 py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Télécharger .TXT</span>
              </button>

              <button
                onClick={onClearBasket}
                disabled={selectedTags.length === 0}
                className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vider</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
