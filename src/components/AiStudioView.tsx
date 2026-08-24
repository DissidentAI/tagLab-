import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Music, 
  FileText, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2, 
  Youtube, 
  Instagram, 
  Volume2, 
  Radio, 
  Ghost, 
  Disc3, 
  Trash2, 
  Plus, 
  Mic, 
  MicOff, 
  History, 
  RotateCcw, 
  Clock, 
  Lightbulb, 
  CheckCircle2, 
  FileMusic,
  Zap,
  Activity,
  Target,
  Flame,
  FileSpreadsheet,
  Layers,
  Award,
  BarChart3,
  Tag,
  Compass,
  ArrowRight,
  TrendingUp,
  Search,
  Video,
  ExternalLink
} from 'lucide-react';
import { AiAnalysisResult, PlatformKey, Top3TagSetsResult, TagSetBundle, ExtractedVideoMetadata } from '../types';
import { calculateSeoScore } from '../utils/seoScorer';
import { SeoScoreCard } from './SeoScoreCard';
import { downloadTagsCsv } from '../utils/csvExport';

interface PromptHistoryItem {
  id: string;
  timestamp: number;
  promptText?: string;
  artistName?: string;
  trackName?: string;
  lyricsSnippet?: string;
  hasAudio?: boolean;
  audioFileName?: string;
  selectedPlatforms?: PlatformKey[];
  detectedGenre?: string;
  bpmEstimate?: string;
}

interface AiStudioViewProps {
  artistName: string;
  setArtistName: (name: string) => void;
  trackName: string;
  setTrackName: (name: string) => void;
  onAddTags: (tags: string[]) => void;
  onCopySuccess: (text: string, title: string) => void;
  selectedTags?: string[];
  initialPrompt?: string;
  onOpenBasket?: () => void;
}

const QUICK_VIBES = [
  "Pluggnb nocturne avec synthé planant et autotune mélancolique",
  "Dark Trap 808 agressive, flow rapide, ambiance rue et nuit",
  "Cloud Rap planant, mélodie guitare mélancolique, reverb spatiale",
  "Jersey Drill club rapide, kick percutant, sample vocal pitché",
  "New Wave / Hyperpop futuriste, basses saturées et mélodies catchy",
  "R&B Trap suave, accords Rhodes sensuels, voix feutrée"
];

export const AiStudioView: React.FC<AiStudioViewProps> = ({
  artistName,
  setArtistName,
  trackName,
  setTrackName,
  onAddTags,
  onCopySuccess,
  selectedTags = [],
  initialPrompt,
  onOpenBasket,
}) => {
  // Input states
  const [activeInputTab, setActiveInputTab] = useState<'prompt' | 'audio' | 'lyrics'>('prompt');
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [lyrics, setLyrics] = useState('');

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      setActiveInputTab('prompt');
    }
  }, [initialPrompt]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformKey[]>([
    'youtube', 'tiktok', 'soundcloud', 'instagram', 'snapchat', 'spotifyPitch'
  ]);

  // Media (Audio or YouTube Video) State
  const [mediaMode, setMediaMode] = useState<'audio' | 'youtube'>('audio');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState<string>('');
  const [isExtractingYt, setIsExtractingYt] = useState<boolean>(false);
  const [extractedYtMeta, setExtractedYtMeta] = useState<ExtractedVideoMetadata | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Speech Recognition (Voice prompt dictation)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Continuous Auto-Generation Mode
  const [autoContinuous, setAutoContinuous] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('taglab_auto_continuous');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const autoGenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastGeneratedSignatureRef = useRef<string>('');

  // Results & Loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformKey>('youtube');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Bulk Generation Top 3 Sets State ('Viral', 'Niche', 'SEO-focused')
  const [isGeneratingTop3Sets, setIsGeneratingTop3Sets] = useState(false);
  const [top3SetsResult, setTop3SetsResult] = useState<Top3TagSetsResult | null>(null);
  const [activeTop3Tab, setActiveTop3Tab] = useState<'viral' | 'niche' | 'seo'>('viral');

  // Prompt History state (Top 5)
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('taglab_prompt_history');
      if (saved) {
        return JSON.parse(saved).slice(0, 5);
      }
    } catch (e) {
      console.warn("Failed to load prompt history from localStorage", e);
    }
    return [
      {
        id: 'hist-demo-1',
        timestamp: Date.now() - 1000 * 60 * 25,
        promptText: "Pluggnb nocturne avec mélodie piano mélancolique et 808 lourde style Serane",
        artistName: "Serane",
        trackName: "Prada Bag",
        selectedPlatforms: ['youtube', 'instagram', 'tiktok'],
        detectedGenre: "Pluggnb / Rap FR",
        bpmEstimate: "142 BPM",
      },
      {
        id: 'hist-demo-2',
        timestamp: Date.now() - 1000 * 60 * 180,
        promptText: "Trap sombre agressive, kick percutant et voix saturée style Freeze Corleone",
        artistName: "Freeze Corleone",
        trackName: "Phantom",
        selectedPlatforms: ['youtube', 'soundcloud'],
        detectedGenre: "Dark Trap / Drill",
        bpmEstimate: "140 BPM",
      }
    ];
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [reappliedId, setReappliedId] = useState<string | null>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('taglab_prompt_history', JSON.stringify(promptHistory.slice(0, 5)));
    } catch (e) {
      console.warn("Failed to save history", e);
    }
  }, [promptHistory]);

  // Save autoContinuous preference
  useEffect(() => {
    try {
      localStorage.setItem('taglab_auto_continuous', autoContinuous ? 'true' : 'false');
    } catch (e) {
      console.warn("Failed to save autoContinuous setting", e);
    }
  }, [autoContinuous]);

  // Continuous Auto-Generation Listener
  useEffect(() => {
    if (!autoContinuous) return;

    const trimmedArtist = artistName.trim();
    const trimmedTrack = trackName.trim();
    const trimmedPrompt = prompt.trim();

    // Requires at least artist, track, or prompt to have sufficient content
    if (!trimmedArtist && !trimmedTrack && trimmedPrompt.length < 5) return;

    const currentSignature = `${trimmedArtist}::${trimmedTrack}::${trimmedPrompt}`;
    if (currentSignature === lastGeneratedSignatureRef.current) return;

    if (autoGenTimeoutRef.current) {
      clearTimeout(autoGenTimeoutRef.current);
    }

    autoGenTimeoutRef.current = setTimeout(async () => {
      if (loading || isAutoGenerating) return;

      lastGeneratedSignatureRef.current = currentSignature;
      setIsAutoGenerating(true);

      try {
        const response = await fetch('/api/generate-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: trimmedPrompt || `Morceau rap français de style ${trimmedArtist || 'artiste'} intitulé ${trimmedTrack || 'morceau'}`,
            lyrics: lyrics.trim() || undefined,
            artistName: trimmedArtist || undefined,
            trackName: trimmedTrack || undefined,
            platforms: selectedPlatforms,
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          const data: AiAnalysisResult = resJson.data || resJson;
          setAnalysisResult(data);
          setError(null);
        }
      } catch (err) {
        console.warn("Auto-generation background error:", err);
      } finally {
        setIsAutoGenerating(false);
      }
    }, 850);

    return () => {
      if (autoGenTimeoutRef.current) {
        clearTimeout(autoGenTimeoutRef.current);
      }
    };
  }, [artistName, trackName, prompt, autoContinuous, lyrics, selectedPlatforms, loading, isAutoGenerating]);

  // Voice dictation handler
  const handleToggleVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez Chrome ou Edge.");
      return;
    }

    if (isRecordingVoice) {
      recognitionRef.current?.stop();
      setIsRecordingVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setPrompt(prev => (prev ? prev + ' ' + transcript : transcript).trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsRecordingVoice(false);
    }
  };

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

    // Create preview URL
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    // Convert to Base64 for Gemini API upload
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setAudioBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl(null);
    setAudioBase64(null);
    setIsPlayingAudio(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle YouTube Video Extraction for AI Analysis
  const handleExtractYoutubeVideo = async () => {
    if (!youtubeVideoUrl.trim()) {
      setError("Veuillez coller un lien YouTube valide.");
      return;
    }
    setIsExtractingYt(true);
    setError(null);
    try {
      const res = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeVideoUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.metadata) {
        setExtractedYtMeta(data.metadata);
        if (data.metadata.parsedArtist && !artistName) {
          setArtistName(data.metadata.parsedArtist);
        }
        if (data.metadata.parsedTrack && !trackName) {
          setTrackName(data.metadata.parsedTrack);
        }
        if (!prompt && data.metadata.detectedVibe) {
          setPrompt(`Vidéo YouTube : ${data.metadata.title}. Style : ${data.metadata.detectedVibe}`);
        }
        onCopySuccess('', `Vidéo "${data.metadata.title}" analysée avec succès !`);
      } else {
        throw new Error(data.error || "Impossible d'extraire les données de la vidéo.");
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'extraction de la vidéo YouTube.");
    } finally {
      setIsExtractingYt(false);
    }
  };

  const handleRemoveYoutubeVideo = () => {
    setExtractedYtMeta(null);
    setYoutubeVideoUrl('');
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

  const togglePlatform = (p: PlatformKey) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length === 1) return;
      setSelectedPlatforms(prev => prev.filter(x => x !== p));
    } else {
      setSelectedPlatforms(prev => [...prev, p]);
    }
  };

  // Reapply a historical prompt
  const handleReapplyPrompt = (item: PromptHistoryItem) => {
    setPrompt(item.promptText || '');
    if (item.artistName) setArtistName(item.artistName);
    if (item.trackName) setTrackName(item.trackName);
    if (item.lyricsSnippet) setLyrics(item.lyricsSnippet);
    if (item.selectedPlatforms && item.selectedPlatforms.length > 0) {
      setSelectedPlatforms(item.selectedPlatforms);
    }
    
    setReappliedId(item.id);
    onCopySuccess('', `Prompt réappliqué : "${(item.promptText || item.trackName || 'Historique').substring(0, 35)}..."`);
    setTimeout(() => setReappliedId(null), 1800);
  };

  // Delete a history item
  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPromptHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setPromptHistory([]);
    onCopySuccess('', 'Historique des prompts effacé.');
  };

  // AI Generation Trigger
  const handleGenerate = async () => {
    if (!prompt.trim() && !audioBase64 && !lyrics.trim() && !artistName.trim() && !trackName.trim() && !extractedYtMeta) {
      setError("Veuillez fournir au moins une source : une description, un lien YouTube, un fichier audio, des paroles ou un nom d'artiste.");
      return;
    }

    setLoading(true);
    setError(null);

    const activePromptText = prompt.trim();
    const activeLyricsText = lyrics.trim();
    const ytContext = extractedYtMeta ? ` [Vidéo YouTube: ${extractedYtMeta.title}, Chaîne: ${extractedYtMeta.authorName}]` : '';

    try {
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: (activePromptText + ytContext).trim() || `Morceau rap ${artistName || ''} ${trackName || ''}`.trim(),
          lyrics: activeLyricsText || undefined,
          audioBase64: audioBase64 || undefined,
          audioMimeType: audioFile?.type || 'audio/mp3',
          artistName: artistName.trim() || undefined,
          trackName: trackName.trim() || undefined,
          platforms: selectedPlatforms,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur HTTP ${response.status}`);
      }

      const resJson = await response.json();
      const data: AiAnalysisResult = resJson.data || resJson;
      setAnalysisResult(data);

      // Auto update artist/track name if detected and currently empty
      if (!artistName && data.detectedArtist) {
        setArtistName(data.detectedArtist);
      }
      if (!trackName && data.detectedTrack) {
        setTrackName(data.detectedTrack);
      }

      // Add to prompt history (Keep top 5 unique)
      const newHistoryItem: PromptHistoryItem = {
        id: 'hist-' + Date.now(),
        timestamp: Date.now(),
        promptText: activePromptText || (audioFile ? `Analyse audio: ${audioFile.name}` : `Morceau: ${artistName} - ${trackName}`),
        artistName: artistName.trim() || data.detectedArtist || undefined,
        trackName: trackName.trim() || data.detectedTrack || undefined,
        lyricsSnippet: activeLyricsText || undefined,
        hasAudio: !!audioBase64,
        audioFileName: audioFile?.name,
        selectedPlatforms: [...selectedPlatforms],
        detectedGenre: data.detectedGenre,
        bpmEstimate: data.bpmEstimate,
      };

      setPromptHistory(prev => {
        const filtered = prev.filter(p => p.promptText !== newHistoryItem.promptText);
        return [newHistoryItem, ...filtered].slice(0, 5);
      });

      if (selectedPlatforms.length > 0) {
        setActivePlatformTab(selectedPlatforms[0]);
      }
    } catch (err: unknown) {
      console.error("Erreur génération tags IA :", err);
      setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Bulk Generation of Top 3 Sets (Viral, Niche, SEO-focused)
  const handleGenerateTop3Sets = async () => {
    const currentArtist = artistName.trim() || 'Serane';
    const currentTrack = trackName.trim() || 'Prada Bag';

    if (!artistName.trim() && !trackName.trim()) {
      setArtistName(currentArtist);
      setTrackName(currentTrack);
    }

    setIsGeneratingTop3Sets(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-top3-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName: currentArtist,
          trackName: currentTrack,
          vibePrompt: prompt.trim() || lyrics.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur HTTP ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setTop3SetsResult(resJson.data);
        onCopySuccess('', `Top 3 sets (Viral, Niche, SEO) générés pour "${currentArtist} - ${currentTrack}" !`);
      } else {
        throw new Error("Impossible de générer le Top 3 sets.");
      }
    } catch (err: unknown) {
      console.error("Erreur génération Top 3 sets :", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du Top 3 sets de tags.");
    } finally {
      setIsGeneratingTop3Sets(false);
    }
  };

  const handleExportTop3Csv = (setBundle: TagSetBundle) => {
    downloadTagsCsv(
      setBundle.tags,
      artistName || 'artiste',
      trackName || 'morceau',
      `taglab-${setBundle.id}-set`
    );
    onCopySuccess('', `Set ${setBundle.name} exporté en fichier CSV !`);
  };

  const handleCopyPlatform = (key: string, text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onCopySuccess(text, `${label} copié dans le presse-papier !`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatTimeAgo = (timestamp: number) => {
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsed < 60) return "À l'instant";
    if (elapsed < 3600) return `Il y a ${Math.floor(elapsed / 60)} min`;
    if (elapsed < 86400) return `Il y a ${Math.floor(elapsed / 3600)} h`;
    return new Date(timestamp).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  };

  // Compute SEO score of the current generated YouTube tags
  const generatedYtTags = analysisResult?.platforms?.youtube?.tags || [];
  const generatedSeoScore = calculateSeoScore(
    generatedYtTags.length > 0 ? generatedYtTags : selectedTags,
    artistName,
    trackName
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>tagLab AI Studio • Gemini Multi-Modal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Générateur de Tags IA & Analyseur Musical
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Analysez votre son, décrivez votre vibe ou activez la génération automatique en continu dès que vous tapez un nom d&apos;artiste ou de morceau.
            </p>
          </div>

          {/* Continuous Auto-Generation Toggle Switch */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shrink-0 flex flex-col sm:items-end justify-center gap-1.5">
            <div className="flex items-center gap-3">
              <label htmlFor="auto-gen-toggle" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                <Zap className={`w-3.5 h-3.5 ${autoContinuous ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                <span>Génération Continue (Live)</span>
              </label>

              <button
                id="auto-gen-toggle"
                type="button"
                role="switch"
                aria-checked={autoContinuous}
                onClick={() => {
                  const next = !autoContinuous;
                  setAutoContinuous(next);
                  onCopySuccess('', next ? 'Mode génération en continu activé !' : 'Mode génération en continu désactivé.');
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                  autoContinuous ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    autoContinuous ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {autoContinuous ? (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isAutoGenerating ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                  {isAutoGenerating ? 'Génération IA en direct...' : 'En veille : réagit à la saisie'}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Déclenchement manuel par bouton
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Inputs, Sidebar History, and Outputs */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left / Center Column: Input Form (Tabs + Generator) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-colors">
            
            {/* Input Mode Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  id="tab-input-prompt"
                  onClick={() => setActiveInputTab('prompt')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeInputTab === 'prompt'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. Prompt & Vibe</span>
                  {prompt && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>

                <button
                  id="tab-input-audio"
                  onClick={() => setActiveInputTab('audio')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeInputTab === 'audio'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>2. Importer Audio</span>
                  {audioFile && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>

                <button
                  id="tab-input-lyrics"
                  onClick={() => setActiveInputTab('lyrics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeInputTab === 'lyrics'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>3. Coller Paroles</span>
                  {lyrics && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              </div>

              <button
                onClick={() => setIsHistoryOpen(prev => !prev)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
              >
                <History className="w-3.5 h-3.5" />
                <span>{isHistoryOpen ? 'Masquer Historique' : 'Historique (5)'}</span>
              </button>
            </div>

            {/* TAB 1: PROMPT / VIBE */}
            {activeInputTab === 'prompt' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="ai-prompt-input" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Décrivez l&apos;ambiance, les instruments, la vibe ou le style :
                    </label>

                    {/* Microphone Dictation Button */}
                    <button
                      type="button"
                      onClick={handleToggleVoiceDictation}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                        isRecordingVoice
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600'
                      }`}
                      title="Dicter la description au micro"
                    >
                      {isRecordingVoice ? (
                        <>
                          <MicOff className="w-3 h-3" />
                          <span>Écoute en cours...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3" />
                          <span>Dicter au micro</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    id="ai-prompt-input"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Morceau Pluggnb nocturne avec une mélodie mélancolique au piano, 808 lourde, flow chanté autotuné, style Goyard / Serane, balade nocturne..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors leading-relaxed shadow-2xs font-medium"
                  />
                </div>

                {/* Quick Inspiration Pills */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    Suggestions rapides de styles :
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_VIBES.map((vibe, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(vibe)}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors text-left"
                      >
                        {vibe.length > 40 ? vibe.substring(0, 38) + '...' : vibe}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AUDIO UPLOAD OR YOUTUBE VIDEO */}
            {activeInputTab === 'audio' && (
              <div className="space-y-4">
                {/* Switcher Audio File vs YouTube Video */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 w-fit">
                  <button
                    type="button"
                    onClick={() => setMediaMode('audio')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      mediaMode === 'audio'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <FileMusic className="w-3.5 h-3.5" />
                    <span>Fichier Audio (MP3/WAV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaMode('youtube')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      mediaMode === 'youtube'
                        ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-600" />
                    <span>Lien Vidéo YouTube</span>
                    {extractedYtMeta && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </button>
                </div>

                {mediaMode === 'audio' ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Importer votre fichier audio pour analyse spectrale directe :
                    </label>

                    {!audioFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all group"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mx-auto mb-2 transition-colors" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                          Cliquez pour importer votre son ou glissez-déposez ici
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Formats supportés : MP3, WAV, M4A, OGG (Max 25 Mo)
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                              <FileMusic className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{audioFile.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {(audioFile.size / (1024 * 1024)).toFixed(2)} Mo • Audio chargé
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {audioUrl && (
                              <button
                                onClick={togglePlayAudio}
                                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                                title={isPlayingAudio ? "Pause" : "Écouter"}
                              >
                                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button
                              onClick={handleRemoveAudio}
                              className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Supprimer l'audio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {audioUrl && (
                          <audio
                            ref={audioRef}
                            src={audioUrl}
                            onEnded={() => setIsPlayingAudio(false)}
                            className="hidden"
                          />
                        )}

                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Audio prêt pour l&apos;analyse spectrale Gemini (BPM, Mood, 808, Style).</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Collez l&apos;URL d&apos;une vidéo YouTube (Clip, Son, Type Beat, Visualizer) :
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        value={youtubeVideoUrl}
                        onChange={(e) => setYoutubeVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                        className="w-full pl-9 pr-28 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={handleExtractYoutubeVideo}
                        disabled={isExtractingYt}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isExtractingYt ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Extraction...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Extraire</span>
                          </>
                        )}
                      </button>
                    </div>

                    {extractedYtMeta && (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {extractedYtMeta.thumbnailUrl ? (
                              <img
                                src={extractedYtMeta.thumbnailUrl}
                                alt="Miniature YouTube"
                                className="w-16 h-12 object-cover rounded-lg border border-slate-300 dark:border-slate-600 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 shrink-0">
                                <Youtube className="w-6 h-6" />
                              </div>
                            )}

                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                {extractedYtMeta.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Chaîne : {extractedYtMeta.authorName || 'Non spécifiée'}
                              </p>
                              {extractedYtMeta.detectedVibe && (
                                <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.2 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300">
                                  {extractedYtMeta.detectedVibe}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={handleRemoveYoutubeVideo}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Retirer la vidéo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Vidéo YouTube chargée ! Cliquez sur &quot;Générer les Tags IA&quot; ci-dessous pour lancer l&apos;analyse complète.</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: LYRICS / PAROLES */}
            {activeInputTab === 'lyrics' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="ai-lyrics-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Collez les paroles ou un extrait du texte :
                  </label>
                  <textarea
                    id="ai-lyrics-input"
                    rows={4}
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="Collez ici les paroles (refrain, couplet, punchlines)... L'IA va extraire les thèmes, le vocabulaire rap et les punchlines virales."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors leading-relaxed shadow-2xs font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Idéal pour générer des tags thématiques précis (nuit, mélancolie, argent, rue, amour toxique...).
                </p>
              </div>
            )}

            {/* Targeted Platforms Selector */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Plateformes ciblées pour la génération :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => togglePlatform('youtube')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('youtube')
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Youtube className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>YouTube</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('tiktok')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('tiktok')
                      ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/60 text-cyan-700 dark:text-cyan-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>TikTok / Shorts</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('soundcloud')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('soundcloud')
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Radio className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>SoundCloud</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('instagram')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('instagram')
                      ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/60 text-pink-700 dark:text-pink-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Instagram className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  <span>Instagram / Reels</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('snapchat')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('snapchat')
                      ? 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900/60 text-yellow-800 dark:text-yellow-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Ghost className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span>Snapchat</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('spotifyPitch')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedPlatforms.includes('spotifyPitch')
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Disc3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Spotify Pitch</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons: Full AI Analysis & Bulk Top 3 Sets */}
            <div className="space-y-2 pt-1">
              <button
                id="ai-generate-tags-btn"
                onClick={handleGenerate}
                disabled={loading || isAutoGenerating || isGeneratingTop3Sets}
                className={`w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                  loading || isAutoGenerating
                    ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-400 cursor-wait'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                }`}
              >
                {loading || isAutoGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>L&apos;IA analyse le morceau et génère les tags...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Lancer l&apos;Analyse IA Multi-Plateforme</span>
                  </>
                )}
              </button>

              {/* Bulk Generation Button: Top 3 Sets (Viral, Niche, SEO-focused) */}
              <button
                id="bulk-generate-top3-btn"
                onClick={handleGenerateTop3Sets}
                disabled={isGeneratingTop3Sets || loading || isAutoGenerating}
                className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border shadow-2xs transition-all ${
                  isGeneratingTop3Sets
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-pink-500/10 hover:from-amber-500/20 hover:via-indigo-500/20 hover:to-pink-500/20 border-amber-300 dark:border-amber-800/80 text-slate-800 dark:text-slate-100 hover:border-amber-400 cursor-pointer'
                }`}
                title="Génère 3 stratégies distinctes : 1. Viral (Reels/TikTok), 2. Niche (Pluggnb/SoundCloud), 3. Master SEO YouTube (100/100)"
              >
                {isGeneratingTop3Sets ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
                    <span>Génération des 3 Sets Stratégiques en cours...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Générer le Top 3 Sets de Tags (Viral • Niche • SEO)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LATERAL SIDEBAR / PANEL: 5 RECENT PROMPTS HISTORY */}
          {isHistoryOpen && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Historique des Prompts</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                        {promptHistory.length}/5
                      </span>
                    </h3>
                  </div>
                </div>

                {promptHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    Effacer tout
                  </button>
                )}
              </div>

              {promptHistory.length === 0 ? (
                <div className="py-4 text-center text-slate-400 dark:text-slate-500 text-xs">
                  <Clock className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                  <p>Aucun prompt récent pour l&apos;instant.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Vos 5 dernières analyses s&apos;afficheront ici avec un bouton pour les réappliquer instantanément.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {promptHistory.map((item) => {
                    const isReapplied = reappliedId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="group relative bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                              {formatTimeAgo(item.timestamp)}
                            </span>
                            {item.detectedGenre && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-100/70 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 truncate max-w-[140px]">
                                {item.detectedGenre}
                              </span>
                            )}
                            {item.hasAudio && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                <Music className="w-2.5 h-2.5" /> Audio
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-2 leading-relaxed">
                            &quot;{item.promptText}&quot;
                          </p>

                          {(item.artistName || item.trackName) && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              🎵 {item.artistName || 'Artiste'} — {item.trackName || 'Morceau'}
                            </p>
                          )}
                        </div>

                        {/* Actions for history card */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            id={`reapply-prompt-${item.id}`}
                            onClick={() => handleReapplyPrompt(item)}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                              isReapplied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700'
                            }`}
                            title="Réappliquer ce prompt et ses réglages dans le formulaire"
                          >
                            {isReapplied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Réappliqué !</span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Réappliquer</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Supprimer cet historique"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: AI Results & Multi-platform Outputs */}
        <div className="xl:col-span-5 space-y-4">

          {/* TOP 3 SETS SECTION (BULK GENERATION RESULT) */}
          {top3SetsResult && (
            <div id="top3-sets-container" className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 shadow-sm space-y-3.5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 dark:border-amber-950/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Top 3 Sets Stratégiques</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold">
                        Génération Ciblée
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Morceau : <span className="font-semibold text-slate-700 dark:text-slate-300">{top3SetsResult.artist} — {top3SetsResult.track}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => {
                      const currentSet = activeTop3Tab === 'viral' 
                        ? top3SetsResult.viralSet 
                        : activeTop3Tab === 'niche' 
                        ? top3SetsResult.nicheSet 
                        : top3SetsResult.seoSet;
                      handleExportTop3Csv(currentSet);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
                    title="Télécharger ce set en CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Set Selection Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  id="tab-top3-viral"
                  onClick={() => setActiveTop3Tab('viral')}
                  className={`py-2 px-2 rounded-md text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                    activeTop3Tab === 'viral'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span className="truncate">1. Viral</span>
                </button>

                <button
                  id="tab-top3-niche"
                  onClick={() => setActiveTop3Tab('niche')}
                  className={`py-2 px-2 rounded-md text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                    activeTop3Tab === 'niche'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                  <span className="truncate">2. Niche</span>
                </button>

                <button
                  id="tab-top3-seo"
                  onClick={() => setActiveTop3Tab('seo')}
                  className={`py-2 px-2 rounded-md text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                    activeTop3Tab === 'seo'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  <span className="truncate">3. SEO YouTube</span>
                </button>
              </div>

              {/* Active Set Details */}
              {(() => {
                const currentBundle: TagSetBundle = activeTop3Tab === 'viral'
                  ? top3SetsResult.viralSet
                  : activeTop3Tab === 'niche'
                  ? top3SetsResult.nicheSet
                  : top3SetsResult.seoSet;

                const isViral = activeTop3Tab === 'viral';
                const isNiche = activeTop3Tab === 'niche';
                const isSeo = activeTop3Tab === 'seo';

                return (
                  <div className="space-y-3 pt-1">
                    {/* Strategy Banner */}
                    <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                      isViral
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                        : isNiche
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {isViral && <Flame className="w-3.5 h-3.5 text-amber-500" />}
                          {isNiche && <Compass className="w-3.5 h-3.5 text-indigo-500" />}
                          {isSeo && <Award className="w-3.5 h-3.5 text-emerald-500" />}
                          {currentBundle.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {currentBundle.badge}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        {currentBundle.description}
                      </p>
                      <div className="pt-1 flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>📊 <b>{currentBundle.tags.length}</b> tags</span>
                        <span>📏 <b>{currentBundle.charCount}</b> caractères</span>
                        {currentBundle.estimatedScore && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            ⭐ Score SEO : {currentBundle.estimatedScore}/100
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tags Preview Box */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Tags du Set ({currentBundle.tags.length})
                        </span>
                        <span className="text-[10px] text-slate-400">Format virgules ou clic direct</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed max-h-28 overflow-y-auto select-all mb-2">
                        {currentBundle.tags.join(', ')}
                      </div>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-0.5">
                        {currentBundle.tags.map((tag, idx) => {
                          const isInBasket = (selectedTags || []).includes(tag);
                          return (
                            <button
                              key={`${tag}-${idx}`}
                              type="button"
                              onClick={() => onAddTags([tag])}
                              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                                isInBasket
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              }`}
                              title="Ajouter au panier"
                            >
                              {isInBasket ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                              <span>{tag}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hashtags preview if available */}
                    {currentBundle.hashtags && currentBundle.hashtags.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Hashtags Associés (Réseaux Sociaux) :
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {currentBundle.hashtags.map((ht, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium">
                              {ht}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons for this set */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleCopyPlatform(
                          `top3-${currentBundle.id}-tags`,
                          currentBundle.tags.join(', '),
                          `Tags ${currentBundle.name}`
                        )}
                        className="py-2 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        {copiedKey === `top3-${currentBundle.id}-tags` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === `top3-${currentBundle.id}-tags` ? 'Copié !' : 'Copier le Set'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onAddTags(currentBundle.tags);
                          onCopySuccess('', `${currentBundle.tags.length} tags ajoutés au panier !`);
                        }}
                        className="py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter au Panier</span>
                      </button>

                      {currentBundle.hashtags && (
                        <button
                          onClick={() => handleCopyPlatform(
                            `top3-${currentBundle.id}-ht`,
                            currentBundle.hashtags!.join(' '),
                            `Hashtags ${currentBundle.name}`
                          )}
                          className="col-span-2 sm:col-span-1 py-2 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                        >
                          {copiedKey === `top3-${currentBundle.id}-ht` ? <Check className="w-3.5 h-3.5" /> : <Tag className="w-3.5 h-3.5 text-indigo-500" />}
                          <span>{copiedKey === `top3-${currentBundle.id}-ht` ? 'Copié !' : 'Copier Hashtags'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* MAIN SINGLE ANALYSIS RESULTS OR PLACEHOLDER */}
          {!analysisResult && !top3SetsResult ? (
            <div className="h-full min-h-[380px] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm transition-colors">
              <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">En attente de votre morceau</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
                Remplissez les informations à gauche ou cliquez sur le bouton Top 3 Sets pour générer instantanément vos tags.
              </p>
              <button
                onClick={handleGenerateTop3Sets}
                disabled={isGeneratingTop3Sets}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>Générer un Top 3 Sets Rapide</span>
              </button>
            </div>
          ) : analysisResult && (
            <div className="space-y-4">
              
              {/* Musical D.A. Breakdown Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3 transition-colors">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Analyse Musicale & D.A.
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 font-bold">
                    {analysisResult.bpmEstimate || 'BPM Auto'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Genre Détecté</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{analysisResult.detectedGenre}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Ambiance / Mood</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{analysisResult.detectedMood}</p>
                  </div>
                </div>

                {/* Key sonic elements */}
                {analysisResult.keyElements && analysisResult.keyElements.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-1">
                      Éléments Clés de Production :
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.keyElements.map((el, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {el}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Score on AI Suggestions */}
              <SeoScoreCard scoreData={generatedSeoScore} compact={false} />

              {/* Platform Output Tabs Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3 transition-colors">
                
                {/* Platform Tab Selector */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800 pb-2">
                  <button
                    onClick={() => setActivePlatformTab('youtube')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activePlatformTab === 'youtube'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
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
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>TikTok</span>
                  </button>

                  <button
                    onClick={() => setActivePlatformTab('soundcloud')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activePlatformTab === 'soundcloud'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
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
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
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
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Ghost className="w-3.5 h-3.5" />
                    <span>Snapchat</span>
                  </button>

                  <button
                    onClick={() => setActivePlatformTab('spotifyPitch')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activePlatformTab === 'spotifyPitch'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Disc3 className="w-3.5 h-3.5" />
                    <span>Spotify Pitch</span>
                  </button>
                </div>

                {/* YOUTUBE CONTENT */}
                {activePlatformTab === 'youtube' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Tags Formatés YouTube Studio
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        {(analysisResult.platforms.youtube.formatted || analysisResult.platforms.youtube.tags.join(', ')).length}/500 car.
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed max-h-28 overflow-y-auto select-all">
                      {analysisResult.platforms.youtube.formatted || analysisResult.platforms.youtube.tags.join(', ')}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyPlatform(
                          'yt-tags',
                          analysisResult.platforms.youtube.formatted || analysisResult.platforms.youtube.tags.join(', '),
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
                          onCopySuccess('', `${analysisResult.platforms.youtube.tags.length} tags IA ajoutés au panier.`);
                        }}
                        className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Panier</span>
                      </button>
                    </div>

                    {/* Title Ideas */}
                    {analysisResult.platforms.youtube.titleIdeas && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block mb-1.5">
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
                              className="text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-between text-slate-700 dark:text-slate-300 group transition-colors"
                            >
                              <span className="truncate">{title}</span>
                              <Copy className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0" />
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
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Hashtags Viraux TikTok & Shorts
                    </span>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-cyan-800 dark:text-cyan-300 leading-relaxed max-h-28 overflow-y-auto select-all">
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
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      {analysisResult.platforms.tiktok.hookIdea && (
                        <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase block">
                            🎯 Idée de Hook / Texte à l&apos;écran :
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 mt-0.5">{analysisResult.platforms.tiktok.hookIdea}</p>
                        </div>
                      )}
                      {analysisResult.platforms.tiktok.captionIdea && (
                        <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold uppercase block">
                            ✍️ Idée de Caption :
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 mt-0.5">{analysisResult.platforms.tiktok.captionIdea}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SOUNDCLOUD CONTENT */}
                {activePlatformTab === 'soundcloud' && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase block">
                        Tag Principal Genre SoundCloud :
                      </span>
                      <p className="text-slate-900 dark:text-slate-100 font-bold text-sm mt-0.5">
                        {analysisResult.platforms.soundcloud.genreTag}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tags Secondaires SoundCloud
                    </span>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed max-h-28 overflow-y-auto select-all">
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
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Hashtags Instagram (Reels & Posts)
                    </span>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-pink-700 dark:text-pink-400 leading-relaxed max-h-28 overflow-y-auto select-all">
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
                      <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold uppercase block">
                          📸 Idée de Légende Reel :
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 mt-0.5">{analysisResult.platforms.instagram.reelCaptionIdea}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* SNAPCHAT CONTENT */}
                {activePlatformTab === 'snapchat' && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Spotlight Tags & Thématiques Snapchat
                    </span>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-amber-800 dark:text-amber-400 leading-relaxed select-all">
                      {analysisResult.platforms.snapchat.spotlightTags.join(', ')}
                    </div>

                    <button
                      onClick={() => handleCopyPlatform(
                        'snap-tags',
                        analysisResult.platforms.snapchat.spotlightTags.join(', '),
                        'Tags Snapchat'
                      )}
                      className="w-full py-2 px-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      {copiedKey === 'snap-tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'snap-tags' ? 'Copié !' : 'Copier les Tags Snapchat'}</span>
                    </button>
                  </div>
                )}

                {/* SPOTIFY PITCH CONTENT */}
                {activePlatformTab === 'spotifyPitch' && analysisResult.platforms.spotifyPitch && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Pitch Playlist Spotify for Artists
                    </span>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed select-all">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Note pour les curateurs :</p>
                      <p className="italic">{analysisResult.platforms.spotifyPitch.pitchNote}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Mots-clés d&apos;humeur & sous-genres :</span>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.platforms.spotifyPitch.moodKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
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
                <div className="bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 p-4 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Conseils Spécifiques de l&apos;IA pour ce Morceau :
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
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
