import React, { useState, useRef } from 'react';
import { 
  Bot, 
  Upload, 
  Music, 
  FileText, 
  Sparkles, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  Check, 
  Plus, 
  Youtube, 
  Radio, 
  Share2, 
  Instagram, 
  Ghost, 
  Disc3, 
  AlertCircle, 
  Loader2,
  CheckCircle2,
  Volume2,
  Flame,
  Lightbulb,
  FileMusic,
  Maximize2
} from 'lucide-react';
import { AiAnalysisResult, PlatformKey } from '../types';

interface AiStudioViewProps {
  artistName: string;
  setArtistName: (name: string) => void;
  trackName: string;
  setTrackName: (name: string) => void;
  onAddTags: (tags: string[]) => void;
  onCopySuccess: (text: string, title: string) => void;
  onOpenBasket: () => void;
  initialPrompt?: string;
}

const QUICK_VIBES = [
  "Pluggnb mélancolique, 808 glissante, voix autotunée planante de nuit",
  "Dark Trap 808 lourde, ambiance nocturne agressive et froide",
  "Cloud Rap planant, synthé éthéré type balade nocturne en voiture",
  "Rage Rap hyperpop 2026, leads distordus et grosse énergie",
  "Drill mélodique sombre, vibe mélancolique et basse glide",
  "Plug FR nouvelle génération, flow rapide et ambiance underground",
];

export const AiStudioView: React.FC<AiStudioViewProps> = ({
  artistName,
  setArtistName,
  trackName,
  setTrackName,
  onAddTags,
  onCopySuccess,
  onOpenBasket,
  initialPrompt = '',
}) => {
  // Input states
  const [prompt, setPrompt] = useState(initialPrompt);
  const [lyrics, setLyrics] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeInputTab, setActiveInputTab] = useState<'prompt' | 'audio' | 'lyrics'>('prompt');
  
  // Platform selections
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformKey[]>([
    'youtube', 'tiktok', 'soundcloud', 'instagram', 'snapchat', 'spotifyPitch'
  ]);

  // Loading & Result states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformKey>('youtube');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Audio File Selection
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setError("Veuillez sélectionner un fichier audio valide (.mp3, .wav, .m4a, .ogg).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError("Le fichier audio est trop volumineux (max 25 Mo).");
      return;
    }

    setError(null);
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      setAudioBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioBase64(null);
    setAudioUrl(null);
    setIsPlayingAudio(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Toggle platform
  const togglePlatform = (p: PlatformKey) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  // Execute AI Generation
  const handleGenerate = async () => {
    if (!prompt.trim() && !lyrics.trim() && !audioBase64) {
      setError("Veuillez fournir au moins un prompt/description, des paroles ou un fichier audio à analyser.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          artistName,
          trackName,
          lyrics,
          audioBase64,
          audioMimeType: audioFile?.type || 'audio/mp3',
          selectedPlatforms,
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || "Échec de l'analyse par l'IA.");
      }

      setAnalysisResult(resJson.data);
      if (resJson.notice) {
        onCopySuccess('', resJson.notice);
      } else {
        onCopySuccess('', "Tags et analyse générés avec succès par l'IA !");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de la communication avec l'IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPlatform = (key: string, text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onCopySuccess(text, `${label} copié dans le presse-papier !`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-xl bg-white p-6 border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>IA Multimodale Gemini 3.7</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Générateur de Tags IA & Analyseur Musical
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Importez votre audio (.mp3, .wav), collez vos paroles ou décrivez votre vibe. L'IA écoute le morceau, détecte le BPM/mood et génère des tags calibrés pour YouTube, SoundCloud, TikTok, Instagram et Snapchat.
          </p>
        </div>
      </div>

      {/* Main Studio Controls Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Sources (Tabs: Prompt, Audio, Lyrics) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            
            {/* Input Mode Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveInputTab('prompt')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeInputTab === 'prompt'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. Prompt & Vibe</span>
                  {prompt && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>

                <button
                  onClick={() => setActiveInputTab('audio')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeInputTab === 'audio'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>2. Importer Audio</span>
                  {audioFile && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>

                <button
                  onClick={() => setActiveInputTab('lyrics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeInputTab === 'lyrics'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>3. Coller Paroles</span>
                  {lyrics && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Combinez les 3 entrées
              </span>
            </div>

            {/* TAB 1: PROMPT / VIBE */}
            {activeInputTab === 'prompt' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="ai-prompt-input" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Décrivez l'ambiance, les instruments, la vibe ou le style :
                  </label>
                  <textarea
                    id="ai-prompt-input"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Morceau Pluggnb nocturne avec une mélodie mélancolique au piano, 808 lourde, flow chanté autotuné, style Goyard / Serane, balade nocturne..."
                    className="w-full p-3 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-colors leading-relaxed shadow-2xs font-medium"
                  />
                </div>

                {/* Quick Inspiration Pills */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    Suggestions rapides de styles :
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_VIBES.map((vibe, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(vibe)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all text-left truncate max-w-xs shadow-2xs"
                      >
                        {vibe}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AUDIO UPLOAD & PLAYER */}
            {activeInputTab === 'audio' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAudioUpload}
                  accept="audio/*"
                  className="hidden"
                />

                {!audioFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-slate-100/70 p-6 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Glissez-déposez votre audio ou <span className="text-indigo-600 underline">parcourez vos fichiers</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Formats supportés : MP3, WAV, M4A, OGG, FLAC (Max 25 Mo)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2 bg-white px-3 py-1 rounded-full border border-slate-200">
                      L'IA Gemini va analyser le tempo, la structure harmonique, le mix et les sonorités
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                          <FileMusic className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 truncate max-w-xs">{audioFile.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {(audioFile.size / (1024 * 1024)).toFixed(2)} Mo • {audioFile.type || 'audio'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={togglePlayAudio}
                          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                          title={isPlayingAudio ? "Mettre en pause" : "Écouter l'extrait"}
                        >
                          {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={handleRemoveAudio}
                          className="p-2 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
                          title="Supprimer le fichier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Audio element */}
                    {audioUrl && (
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={() => setIsPlayingAudio(false)}
                        className="w-full h-8 mt-2"
                        controls
                      />
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span>Fichier audio chargé et prêt pour l'analyse IA multimodale.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: LYRICS / PAROLES */}
            {activeInputTab === 'lyrics' && (
              <div className="space-y-2">
                <label htmlFor="ai-lyrics-input" className="block text-xs font-bold text-slate-800">
                  Collez les paroles du morceau pour extraire le mood, le vocabulaire et les thèmes :
                </label>
                <textarea
                  id="ai-lyrics-input"
                  rows={4}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="[Couplet 1]&#10;Dans la ville j'accélère la nuit, les phares illuminent le vide...&#10;J'ai mis l'autotune au max..."
                  className="w-full p-3 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-colors font-mono leading-relaxed shadow-2xs"
                />
              </div>
            )}

            {/* Target Platforms Multi-Check */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Plateformes cibles à générer :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => togglePlatform('youtube')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('youtube')
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Youtube className="w-4 h-4 text-rose-600" />
                  <span>YouTube SEO</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('tiktok')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('tiktok')
                      ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Flame className="w-4 h-4 text-cyan-600" />
                  <span>TikTok / Shorts</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('soundcloud')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('soundcloud')
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Radio className="w-4 h-4 text-amber-600" />
                  <span>SoundCloud</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('instagram')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('instagram')
                      ? 'bg-pink-50 border-pink-200 text-pink-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span>Instagram / Reels</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('snapchat')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('snapchat')
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Ghost className="w-4 h-4 text-yellow-600" />
                  <span>Snapchat</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('spotifyPitch')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('spotifyPitch')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Disc3 className="w-4 h-4 text-emerald-600" />
                  <span>Spotify Pitch</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="ai-generate-tags-btn"
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                loading
                  ? 'bg-indigo-100 text-indigo-400 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>L'IA analyse le morceau et génère la stratégie de tags...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Lancer l'Analyse IA & Générer les Tags</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Results & Multi-platform Outputs */}
        <div className="lg:col-span-5 space-y-4">
          {!analysisResult ? (
            <div className="h-full min-h-[380px] bg-white border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <Bot className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">En attente de votre morceau</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Remplissez les informations à gauche et cliquez sur Générer pour obtenir l'analyse complète et vos tags prêts à coller.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Musical D.A. Breakdown Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Analyse Musicale & D.A.
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                    {analysisResult.bpmEstimate || 'BPM Auto'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Genre Détecté</span>
                    <p className="font-bold text-slate-900 truncate">{analysisResult.detectedGenre}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Ambiance / Mood</span>
                    <p className="font-bold text-slate-900 truncate">{analysisResult.detectedMood}</p>
                  </div>
                </div>

                {/* Key sonic elements */}
                {analysisResult.keyElements && analysisResult.keyElements.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                      Éléments Clés de Production :
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.keyElements.map((el, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {el}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Platform Output Tabs Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                
                {/* Platform Tab Selector */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-100 pb-2">
                  <button
                    onClick={() => setActivePlatformTab('youtube')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activePlatformTab === 'youtube'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube</span>
                  </button>

                  <button
                    onClick={() => setActivePlatformTab('tiktok')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activePlatformTab === 'tiktok'
                        ? 'bg-cyan-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>TikTok</span>
                  </button>

                  <button
                    onClick={() => setActivePlatformTab('soundcloud')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activePlatformTab === 'soundcloud'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>SoundCloud</span>
                  </button>

                  <button
                    onClick={() => setActivePlatformTab('instagram')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activePlatformTab === 'instagram'
                        ? 'bg-pink-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </button>

                  <button
                    onClick={() => setActivePlatformTab('snapchat')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activePlatformTab === 'snapchat'
                        ? 'bg-yellow-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Ghost className="w-3.5 h-3.5" />
                    <span>Snap</span>
                  </button>

                  {analysisResult.platforms.spotifyPitch && (
                    <button
                      onClick={() => setActivePlatformTab('spotifyPitch')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        activePlatformTab === 'spotifyPitch'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Disc3 className="w-3.5 h-3.5" />
                      <span>Spotify</span>
                    </button>
                  )}
                </div>

                {/* YOUTUBE CONTENT */}
                {activePlatformTab === 'youtube' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Tags YouTube SEO ({analysisResult.platforms.youtube.tags.length} tags)
                      </span>
                      <span className={`text-[11px] font-mono font-bold ${
                        analysisResult.platforms.youtube.charCount > 500 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {analysisResult.platforms.youtube.charCount}/500 car.
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed max-h-36 overflow-y-auto select-all">
                      {analysisResult.platforms.youtube.formatted}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyPlatform(
                          'yt-tags',
                          analysisResult.platforms.youtube.formatted,
                          'Tags YouTube'
                        )}
                        className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        {copiedKey === 'yt-tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'yt-tags' ? 'Copié !' : 'Copier les Tags YouTube'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onAddTags(analysisResult.platforms.youtube.tags);
                          onCopySuccess('', 'Tags ajoutés au panier.');
                        }}
                        className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Panier</span>
                      </button>
                    </div>

                    {/* Title Ideas */}
                    {analysisResult.platforms.youtube.titleIdeas && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1.5">
                          Idées de Titres Optimisés SEO :
                        </span>
                        <div className="space-y-1">
                          {analysisResult.platforms.youtube.titleIdeas.map((title, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                navigator.clipboard.writeText(title);
                                onCopySuccess(title, 'Titre copié !');
                              }}
                              className="text-xs bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-between text-slate-700 group transition-colors"
                            >
                              <span className="truncate">{title}</span>
                              <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-700 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TIKTOK CONTENT */}
                {activePlatformTab === 'tiktok' && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800">
                      Hashtags Viraux TikTok & Shorts
                    </span>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-cyan-800 leading-relaxed max-h-28 overflow-y-auto select-all">
                      {analysisResult.platforms.tiktok.hashtags.join(' ')}
                    </div>

                    <button
                      onClick={() => handleCopyPlatform(
                        'tiktok-tags',
                        analysisResult.platforms.tiktok.hashtags.join(' '),
                        'Hashtags TikTok'
                      )}
                      className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      {copiedKey === 'tiktok-tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'tiktok-tags' ? 'Copié !' : 'Copier les Hashtags TikTok'}</span>
                    </button>

                    {/* Hook idea & Caption idea */}
                    <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                      {analysisResult.platforms.tiktok.hookIdea && (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-amber-600 font-bold uppercase block">
                            🎯 Idée de Hook / Texte à l'écran :
                          </span>
                          <p className="text-slate-800 mt-0.5">{analysisResult.platforms.tiktok.hookIdea}</p>
                        </div>
                      )}
                      {analysisResult.platforms.tiktok.captionIdea && (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-cyan-700 font-bold uppercase block">
                            ✍️ Idée de Caption :
                          </span>
                          <p className="text-slate-800 mt-0.5">{analysisResult.platforms.tiktok.captionIdea}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SOUNDCLOUD CONTENT */}
                {activePlatformTab === 'soundcloud' && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                      <span className="text-[10px] text-amber-700 font-bold uppercase block">
                        Tag Principal Genre SoundCloud :
                      </span>
                      <p className="text-slate-900 font-bold text-sm mt-0.5">
                        {analysisResult.platforms.soundcloud.genreTag}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-slate-800">
                      Tags Secondaires SoundCloud
                    </span>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed max-h-28 overflow-y-auto select-all">
                      {analysisResult.platforms.soundcloud.formatted || analysisResult.platforms.soundcloud.tags.join(' ')}
                    </div>

                    <button
                      onClick={() => handleCopyPlatform(
                        'sc-tags',
                        analysisResult.platforms.soundcloud.formatted || analysisResult.platforms.soundcloud.tags.join(' '),
                        'Tags SoundCloud'
                      )}
                      className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      {copiedKey === 'sc-tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'sc-tags' ? 'Copié !' : 'Copier les Tags SoundCloud'}</span>
                    </button>
                  </div>
                )}

                {/* INSTAGRAM CONTENT */}
                {activePlatformTab === 'instagram' && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800">
                      Hashtags Instagram (Reels & Posts)
                    </span>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-pink-700 leading-relaxed max-h-28 overflow-y-auto select-all">
                      {analysisResult.platforms.instagram.hashtags.join(' ')}
                    </div>

                    <button
                      onClick={() => handleCopyPlatform(
                        'ig-tags',
                        analysisResult.platforms.instagram.hashtags.join(' '),
                        'Hashtags Instagram'
                      )}
                      className="w-full py-2 px-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      {copiedKey === 'ig-tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'ig-tags' ? 'Copié !' : 'Copier les Hashtags Instagram'}</span>
                    </button>

                    {analysisResult.platforms.instagram.reelCaptionIdea && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                        <span className="text-[10px] text-pink-600 font-bold uppercase block">
                          📸 Idée de Légende Reel :
                        </span>
                        <p className="text-slate-800 mt-0.5">{analysisResult.platforms.instagram.reelCaptionIdea}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* SNAPCHAT CONTENT */}
                {activePlatformTab === 'snapchat' && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800">
                      Spotlight Tags & Thématiques Snapchat
                    </span>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-amber-800 leading-relaxed select-all">
                      {analysisResult.platforms.snapchat.spotlightTags.join(', ')}
                    </div>

                    <button
                      onClick={() => handleCopyPlatform(
                        'snap-tags',
                        analysisResult.platforms.snapchat.spotlightTags.join(', '),
                        'Tags Snapchat'
                      )}
                      className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      {copiedKey === 'snap-tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'snap-tags' ? 'Copié !' : 'Copier les Tags Snapchat'}</span>
                    </button>
                  </div>
                )}

                {/* SPOTIFY PITCH CONTENT */}
                {activePlatformTab === 'spotifyPitch' && analysisResult.platforms.spotifyPitch && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800">
                      Pitch Playlist Spotify for Artists
                    </span>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed select-all">
                      <p className="font-semibold text-emerald-700 mb-1">Note pour les curateurs :</p>
                      <p className="italic">{analysisResult.platforms.spotifyPitch.pitchNote}</p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Mots-clés d'humeur & sous-genres :</span>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.platforms.spotifyPitch.moodKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-emerald-700 text-[11px] font-semibold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyPlatform(
                        'spotify-pitch',
                        analysisResult.platforms.spotifyPitch!.pitchNote,
                        'Pitch Spotify'
                      )}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      {copiedKey === 'spotify-pitch' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'spotify-pitch' ? 'Copié !' : 'Copier le Pitch Spotify'}</span>
                    </button>
                  </div>
                )}

              </div>

              {/* Specific Strategic Advice from AI */}
              {analysisResult.seoTips && analysisResult.seoTips.length > 0 && (
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Conseils Spécifiques de l'IA pour ce Morceau :
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    {analysisResult.seoTips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
