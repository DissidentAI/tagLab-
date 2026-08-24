import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  History, 
  Plus, 
  Trash2, 
  Sparkles, 
  Award, 
  Layers, 
  BarChart3, 
  Info,
  RotateCcw
} from 'lucide-react';
import { SeoScoreHistoryPoint } from '../types';

interface SeoScoreEvolutionChartProps {
  currentScore: number;
  currentTagCount: number;
  currentCharCount: number;
  artistName?: string;
  trackName?: string;
  layer1Count?: number;
  layer2Count?: number;
  layer3Count?: number;
}

const STORAGE_KEY = 'taglab-seo-evolution-history-v1';

export const SeoScoreEvolutionChart: React.FC<SeoScoreEvolutionChartProps> = ({
  currentScore,
  currentTagCount,
  currentCharCount,
  artistName,
  trackName,
  layer1Count = 0,
  layer2Count = 0,
  layer3Count = 0,
}) => {
  // Load or initialize history
  const [history, setHistory] = useState<SeoScoreHistoryPoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load SEO history:", e);
    }

    // Default realistic trajectory baseline
    return [
      {
        id: '1',
        timestamp: Date.now() - 86400000 * 6,
        dateLabel: 'J-6 (Brut)',
        tagCount: 3,
        charCount: 42,
        score: 35,
        artistTrack: 'Titre sans tags précis',
        layer1Count: 1,
        layer2Count: 1,
        layer3Count: 1,
      },
      {
        id: '2',
        timestamp: Date.now() - 86400000 * 4,
        dateLabel: 'J-4 (Essai)',
        tagCount: 12,
        charCount: 180,
        score: 58,
        artistTrack: 'Ajout de sous-genres simples',
        layer1Count: 3,
        layer2Count: 5,
        layer3Count: 4,
      },
      {
        id: '3',
        timestamp: Date.now() - 86400000 * 2,
        dateLabel: 'J-2 (Spam test)',
        tagCount: 48,
        charCount: 620,
        score: 45,
        artistTrack: 'Surcharge (> 500 car.)',
        layer1Count: 8,
        layer2Count: 25,
        layer3Count: 15,
      },
      {
        id: '4',
        timestamp: Date.now() - 86400000 * 1,
        dateLabel: 'Hier (3-Couches)',
        tagCount: 22,
        charCount: 410,
        score: 88,
        artistTrack: 'Mix équilibré & longue traîne',
        layer1Count: 5,
        layer2Count: 10,
        layer3Count: 7,
      },
    ];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Failed to save SEO history:", e);
    }
  }, [history]);

  // Save current state as a snapshot
  const handleSaveCurrentSnapshot = () => {
    const trackLabel = (artistName && trackName) 
      ? `${artistName} - ${trackName}`
      : (artistName || trackName || `Panier (${currentTagCount} tags)`);

    const now = new Date();
    const dateLabel = `Aujourd'hui ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newPoint: SeoScoreHistoryPoint = {
      id: `${Date.now()}`,
      timestamp: Date.now(),
      dateLabel,
      tagCount: currentTagCount,
      charCount: currentCharCount,
      score: currentScore,
      artistTrack: trackLabel,
      layer1Count,
      layer2Count,
      layer3Count,
    };

    setHistory(prev => [...prev.slice(-14), newPoint]); // Keep last 15 points
  };

  const handleResetHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([
      {
        id: 'init-1',
        timestamp: Date.now() - 86400000 * 2,
        dateLabel: 'Base',
        tagCount: 6,
        charCount: 90,
        score: 42,
        artistTrack: 'Premier jet',
        layer1Count: 2,
        layer2Count: 2,
        layer3Count: 2,
      },
      {
        id: 'init-2',
        timestamp: Date.now(),
        dateLabel: 'Actuel',
        tagCount: currentTagCount || 18,
        charCount: currentCharCount || 380,
        score: currentScore || 85,
        artistTrack: (artistName && trackName) ? `${artistName} - ${trackName}` : 'Session en cours',
        layer1Count: layer1Count || 4,
        layer2Count: layer2Count || 8,
        layer3Count: layer3Count || 6,
      },
    ]);
  };

  // Stats
  const stats = useMemo(() => {
    if (history.length === 0) return { avg: 0, max: 0, latest: 0 };
    const scores = history.map(h => h.score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const max = Math.max(...scores);
    const latest = scores[scores.length - 1];
    return { avg, max, latest };
  }, [history]);

  // Chart data format
  const chartData = useMemo(() => {
    return history.map(point => ({
      name: point.dateLabel,
      score: point.score,
      tagCount: point.tagCount,
      charCount: point.charCount,
      artistTrack: point.artistTrack,
    }));
  }, [history]);

  return (
    <div id="seo-score-evolution-container" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Évolution du Score SEO Global</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                Recharts Analytics
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualisez l&apos;impact de vos combinaisons de tags et de la hiérarchie 3-couches sur votre visibilité YouTube.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="save-seo-snapshot-btn"
            onClick={handleSaveCurrentSnapshot}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Enregistrer le score du panier actuel dans l'historique"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enregistrer l&apos;état actuel ({currentScore}/100)</span>
          </button>

          <button
            onClick={handleResetHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Réinitialiser l'historique"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Score Actuel</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-black ${
              currentScore >= 80 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : currentScore >= 60 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {currentScore}
            </span>
            <span className="text-[11px] text-slate-400">/100</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Moyenne Historique</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{stats.avg}</span>
            <span className="text-[11px] text-slate-400">/100</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Meilleur Score</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.max}</span>
            <span className="text-[11px] text-slate-400">/100</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Sessions Analysées</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{history.length}</span>
            <span className="text-[11px] text-slate-400">tests</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-64 sm:h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-15" vertical={false} />
            
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#94a3b8' }} 
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />

            <YAxis 
              domain={[0, 100]} 
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 11, fill: '#94a3b8' }} 
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />

            {/* Target 80+ Excellence Zone */}
            <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Zone Recommandation (80+)', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />

            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1 backdrop-blur-md">
                      <p className="font-bold text-emerald-400 flex items-center justify-between gap-2">
                        <span>{data.name}</span>
                        <span className="text-xs px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300">
                          {data.score}/100
                        </span>
                      </p>
                      <p className="text-slate-300 text-[11px]">
                        Contexte : <span className="text-white font-medium">{data.artistTrack}</span>
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 border-t border-slate-800">
                        <span>🏷️ {data.tagCount} tags</span>
                        <span>📏 {data.charCount} caractères</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#10b981" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#scoreColor)" 
              activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Strategic Insight Notice */}
      <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-lg flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Comment atteindre 95+ en continu ?</span> Maintenez un total entre 18 et 26 tags (environ 380-460 caractères), incluez impérativement le nom d&apos;artiste en 4 variantes, 2 sous-genres de niche précis, et 3 requêtes d&apos;ambiance ou de format officiel.
        </div>
      </div>
    </div>
  );
};
