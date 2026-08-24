import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Plus, 
  Hash, 
  Sparkles, 
  Radio
} from 'lucide-react';
import { MASTER_PACKS, formatTagsList } from '../data/masterTags';
import { TagPack } from '../types';

interface PacksViewProps {
  artistName: string;
  trackName: string;
  onAddTags: (tags: string[]) => void;
  onCopySuccess: (text: string, title: string) => void;
  onSendToAi: (vibePrompt: string) => void;
  onOpenBasket: () => void;
}

export const PacksView: React.FC<PacksViewProps> = ({
  artistName,
  trackName,
  onAddTags,
  onCopySuccess,
  onSendToAi,
}) => {
  const [copiedPackId, setCopiedPackId] = useState<string | null>(null);
  const [copiedHashtagsId, setCopiedHashtagsId] = useState<string | null>(null);

  const handleCopyPack = (pack: TagPack) => {
    const formatted = formatTagsList(pack.tags, artistName, trackName);
    const text = formatted.join(', ');
    navigator.clipboard.writeText(text);
    setCopiedPackId(pack.id);
    onCopySuccess(text, `${pack.name} (${formatted.length} tags) copié pour YouTube !`);
    setTimeout(() => setCopiedPackId(null), 2000);
  };

  const handleCopyAsHashtags = (pack: TagPack) => {
    const formatted = formatTagsList(pack.tags, artistName, trackName);
    const hashtags = formatted
      .map(t => '#' + t.replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, ''))
      .filter(t => t.length > 1)
      .join(' ');
    navigator.clipboard.writeText(hashtags);
    setCopiedHashtagsId(pack.id);
    onCopySuccess(hashtags, `${pack.name} copié sous forme de Hashtags !`);
    setTimeout(() => setCopiedHashtagsId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Packs Officiels Clés en Main</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            6 Packs de Tags Prêts à Copier
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Ces combinaisons équilibrées respectent la règle des 3 couches (Identité + Genre + Ambiance) et restent sous les 500 caractères recommandés par YouTube.
          </p>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {MASTER_PACKS.map((pack) => {
          const formattedTags = formatTagsList(pack.tags, artistName, trackName);
          const fullText = formattedTags.join(', ');
          const charCount = fullText.length;
          const isCopied = copiedPackId === pack.id;
          const isHashtagCopied = copiedHashtagsId === pack.id;

          return (
            <div
              key={pack.id}
              id={`pack-card-${pack.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Pack Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {pack.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {pack.subtitle}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    <span>{charCount}/500 car.</span>
                  </div>
                </div>

                {/* Tags Preview Box */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 my-3.5 font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {formattedTags.map((tag, tIdx) => {
                      const isIdentity = tag.includes(artistName || "[TON NOM D'ARTISTE]") || tag.includes(trackName || "[NOM DU MORCEAU]");
                      return (
                        <span
                          key={tIdx}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            isIdentity
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold'
                              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pack Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCopyPack(pack)}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copié YouTube !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier YouTube ({formattedTags.length})</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyAsHashtags(pack)}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border shadow-2xs ${
                      isHashtagCopied
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isHashtagCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Hashtags Copiés !</span>
                      </>
                    ) : (
                      <>
                        <Hash className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Copier Hashtags</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onAddTags(pack.tags);
                      onCopySuccess('', `${pack.tags.length} tags ajoutés au panier.`);
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Ajouter au Panier</span>
                  </button>

                  <button
                    onClick={() => onSendToAi(pack.name.split('—')[1]?.trim() || pack.name)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Dériver avec l&apos;IA</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
