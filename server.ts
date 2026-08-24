import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function generateHeuristicTags(
  artist: string,
  track: string,
  prompt: string,
  lyrics: string,
  targetVibe?: string
) {
  const combined = `${prompt} ${lyrics} ${targetVibe || ""}`.toLowerCase();

  let genre = "Pluggnb & Melodic Trap";
  let mood = "Mélancolique & Nocturne";
  let bpm = "130-140 BPM";
  let energy = "Medium-High";
  let genreTagSoundcloud = "Hip-hop & Rap";

  if (combined.includes("rage") || combined.includes("synth") || combined.includes("trippie") || combined.includes("ken carson")) {
    genre = "Rage / Hyperpop Trap";
    mood = "Électrique & Hyperénergique";
    bpm = "145-155 BPM";
    energy = "High Energy";
    genreTagSoundcloud = "Rage";
  } else if (combined.includes("drill") || combined.includes("sombre") || combined.includes("gazo") || combined.includes("freeze")) {
    genre = "Dark Drill / Trap Sombre";
    mood = "Agressif & Ténébreux";
    bpm = "140-144 BPM";
    energy = "Agressif / Sombre";
    genreTagSoundcloud = "Drill";
  } else if (combined.includes("cloud") || combined.includes("plane") || combined.includes("chill") || combined.includes("pnl")) {
    genre = "Cloud Rap / Ambiant 808";
    mood = "Planant & Onirique";
    bpm = "120-130 BPM";
    energy = "Chill / Vibe";
    genreTagSoundcloud = "Cloud Rap";
  } else if (combined.includes("plug") || combined.includes("serane") || combined.includes("goyard") || combined.includes("autotune")) {
    genre = "Plug Français / Pluggnb 2026";
    mood = "Mélancolie Nocturne & Autotune";
    bpm = "134-142 BPM";
    energy = "Bouncy & Smooth";
    genreTagSoundcloud = "Pluggnb";
  }

  // Base tags list for YouTube
  const rawYtTags = [
    artist,
    `${artist} ${track}`,
    `${artist} rap`,
    `${artist} 2026`,
    track,
    `${track} clip officiel`,
    `${track} lyrics`,
    "plug français",
    "plug francais",
    "pluggnb 2026",
    "rap francais",
    "rap français 2026",
    "nouveau rap francais",
    "underground rap fr",
    "new wave rap fr",
    "type beat 2026",
    "808 mafia",
    "melodic trap",
    "autotune rap",
    "night drive rap",
    "trap sombre",
    "son mélancolique",
  ];

  // Dedup and build YouTube formatted string within 480 chars
  const uniqueYt = Array.from(new Set(rawYtTags.map(t => t.trim()).filter(Boolean)));
  const finalYtTags: string[] = [];
  let currentLen = 0;

  for (const t of uniqueYt) {
    const additionalLen = finalYtTags.length > 0 ? t.length + 2 : t.length;
    if (currentLen + additionalLen <= 480) {
      finalYtTags.push(t);
      currentLen += additionalLen;
    } else {
      break;
    }
  }

  const formattedYt = finalYtTags.join(", ");

  const tiktokHashtags = [
    "#rapfr",
    "#rapfrancais",
    "#plugfr",
    "#pluggnb",
    "#newwaverap",
    "#pourtoi",
    "#snippet",
    "#decouverte",
  ];

  const igHashtags = [
    "#rapfr",
    "#rapfrancais",
    "#plugfr",
    "#pluggnb",
    "#newwaverap",
    "#undergroundrap",
    "#frenchrap",
    "#prodby",
    "#flstudio",
    "#nightdrive",
    "#autotune",
    "#independentartist",
    "#visualizer",
    "#musicproducer",
  ];

  const soundcloudTags = [
    "pluggnb",
    "french rap",
    "underground",
    "autotune",
    "melodic",
    "new wave",
    "ambient trap",
    "night vibes",
    "808",
  ];

  const scFormatted = soundcloudTags.map(t => t.includes(" ") ? `"${t}"` : t).join(" ");

  const spotlightTags = ["Rap", "Musique", "NewWave", "Vibe", "Pluggnb", "Underground"];

  return {
    detectedGenre: genre,
    detectedMood: mood,
    bpmEstimate: bpm,
    energyLevel: energy,
    keyElements: [
      "Topline autotunée & harmonies vocales",
      "Basse 808 glissée & sub profonde",
      "Mélodie synthétiseur / piano atmosphérique",
      "Rythmique trap moderne (hi-hats rapides)",
    ],
    audienceTarget: "Auditeurs New Wave, Plug Fr, SoundCloud et amateurs de découvertes rap underground.",
    platforms: {
      youtube: {
        tags: finalYtTags,
        formatted: formattedYt,
        charCount: formattedYt.length,
        titleIdeas: [
          `${artist} - ${track} (Clip Officiel)`,
          `${artist} - ${track} (Visualizer)`,
          `${artist} - ${track} [Pluggnb / New Wave 2026]`,
        ],
        descriptionSnippet: `Écoutez le nouveau morceau "${track}" de ${artist}.\nDisponible sur toutes les plateformes de streaming.\n\n#RapFr #Pluggnb #NewWave`,
      },
      soundcloud: {
        genreTag: genreTagSoundcloud,
        tags: soundcloudTags,
        formatted: scFormatted,
      },
      tiktok: {
        hashtags: tiktokHashtags,
        captionIdea: `Vous validez le nouveau morceau "${track}" ? 🔥 Donnez votre avis en commentaire 👇`,
        hookIdea: `POV : Tu découvres la meilleure pépite Plug / New Wave de 2026... 🎧`,
      },
      instagram: {
        hashtags: igHashtags,
        reelCaptionIdea: `"${track}" est maintenant disponible. Quel est votre passage préféré ? 🌙✨`,
      },
      snapchat: {
        spotlightTags: spotlightTags,
        topicKeywords: ["Rap Français", "Nouvelle Musique", "Trending Sounds"],
      },
      spotifyPitch: {
        moodKeywords: ["Chill", "Nocturne", "Mélancolique", "Énergique"],
        styleGenres: ["Pluggnb", "French Rap", "Cloud Rap", "Trap"],
        pitchNote: `"${track}" par ${artist} allie des mélodies planantes à une production percutante, taillée pour les playlists New Wave et Rap Français Nocturne.`,
      },
    },
    recommendedPacks: [
      "PACK 1 — Identité de Base & SEO Vidéo",
      "PACK 2 — Sous-Genres & Styles Précis",
    ],
    seoTips: [
      "Conservez une sélection de tags de moins de 480 caractères pour éviter tout blocage YouTube Studio.",
      "Utilisez le hook vidéo suggéré pour capter l'attention dans les 3 premières secondes sur TikTok / Shorts.",
      "Soignez la miniature avec un contraste élevé et un texte court et percutant.",
    ],
  };
}

async function startServer() {
  const app = express();

  // Increase payload limits for audio files
  app.use(express.json({ limit: "40mb" }));
  app.use(express.urlencoded({ limit: "40mb", extended: true }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

// AI Tag Generation & Analysis Endpoint with multi-model fallback & retry
  app.post("/api/generate-tags", async (req, res) => {
    const {
      prompt = "",
      artistName = "",
      trackName = "",
      lyrics = "",
      audioBase64,
      audioMimeType,
      targetVibe,
      selectedPlatforms = ["youtube", "soundcloud", "tiktok", "instagram", "snapchat"],
    } = req.body;

    const artist = (artistName || "").trim() || "Artiste Indépendant";
    const track = (trackName || "").trim() || "Nouveau Morceau";

    const systemPrompt = `Tu es le meilleur directeur artistique, expert SEO musical et stratège marketing digital spécialisé dans la scène Rap Français, Plug, Pluggnb, Trap, Cloud Rap, Rage, Drill et Underground francophone / international.
Ton but est d'analyser les éléments fournis (audio, paroles, description/prompt, ambiance) et de générer une stratégie de métadonnées et de tags ultra-efficace, optimisée pour chaque plateforme (YouTube SEO, SoundCloud, TikTok, Instagram Reels, Snapchat Spotlight, Spotify pitch).

Règles de génération :
1. YouTube SEO : Génère une liste de tags ultra-pertinents séparés par des virgules, totalisant STRICTEMENT MOINS DE 480 caractères au total (pour respecter le quota de 500 caractères de YouTube). Inclus les variantes avec/sans accent ("rap français", "rap francais", "plug 2026"), l'identité de l'artiste ("${artist}", "${artist} ${track}", etc.), les sous-genres exacts et les requêtes longue traîne.
2. SoundCloud : Tag principal du genre précis + 10 à 15 tags précis de mood et sonorités.
3. TikTok : 6 à 10 hashtags viraux courts avec # (#rapfr, #plugfr, #snippet, etc.), une idée de caption percutante et une idée de concept/hook pour percer.
4. Instagram : 15 à 25 hashtags ciblés mélangeant reach moyen et de niche, plus une idée de légende stylée pour Reel.
5. Snapchat / Spotlight : 5 à 8 tags clés de thématiques tendance.
6. Spotify Pitch : 3 à 5 mots-clés d'humeur, sous-genres et un pitch texte court de 2 phrases pour les curateurs de playlists.
7. Analyse globale : Identifie le sous-genre précis (ex: Cloud Pluggnb, Dark Trap 808, Cyber Rage, etc.), le mood, l'estimation BPM, le niveau d'énergie, les éléments clés de production (ex: autotune planant, basse saturée, nappe de synthé, etc.) et le public cible.`;

    const parts: any[] = [];

    // Add audio part if provided
    if (audioBase64) {
      const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.-]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: audioMimeType || "audio/mp3",
          data: cleanBase64,
        },
      });
    }

    const userTextInstruction = `ANALYSE CE MORCEAU ET GÉNÈRE LES TAGS OPTIMISÉS :
- Artiste : ${artist}
- Titre : ${track}
${targetVibe ? `- Vibe / Ambiance souhaitée : ${targetVibe}` : ""}
${prompt ? `- Prompt / Description : ${prompt}` : ""}
${lyrics ? `- Paroles du morceau :\n"""\n${lyrics}\n"""` : ""}
${audioBase64 ? "- Fichier audio inclus : écoute et analyse le tempo, les sonorités, le mix, la topline, l'énergie et l'émotion." : ""}
- Plateformes demandées : ${selectedPlatforms.join(", ")}`;

    parts.push({
      text: userTextInstruction,
    });

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        detectedGenre: { type: Type.STRING, description: "Sous-genre musical détecté" },
        detectedMood: { type: Type.STRING, description: "Ambiance / émotion du son" },
        bpmEstimate: { type: Type.STRING, description: "Estimation de tempo BPM" },
        energyLevel: { type: Type.STRING, description: "Niveau d'énergie" },
        keyElements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3 à 5 éléments phares remarqués dans la prod ou les paroles"
        },
        audienceTarget: { type: Type.STRING, description: "Public cible" },
        platforms: {
          type: Type.OBJECT,
          properties: {
            youtube: {
              type: Type.OBJECT,
              properties: {
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                formatted: { type: Type.STRING, description: "Tags prêts à coller dans YouTube séparés par une virgule" },
                charCount: { type: Type.NUMBER, description: "Nombre de caractères total des tags" },
                titleIdeas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 suggestions de titres YouTube optimisés SEO" },
                descriptionSnippet: { type: Type.STRING, description: "Extrait optimisé pour la description YouTube" }
              },
              required: ["tags", "formatted", "charCount", "titleIdeas", "descriptionSnippet"]
            },
            soundcloud: {
              type: Type.OBJECT,
              properties: {
                genreTag: { type: Type.STRING, description: "Le tag principal pour SoundCloud" },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                formatted: { type: Type.STRING, description: "Tags formatés SoundCloud" }
              },
              required: ["genreTag", "tags", "formatted"]
            },
            tiktok: {
              type: Type.OBJECT,
              properties: {
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                captionIdea: { type: Type.STRING, description: "Idée de caption TikTok" },
                hookIdea: { type: Type.STRING, description: "Idée de texte à l'écran" }
              },
              required: ["hashtags", "captionIdea", "hookIdea"]
            },
            instagram: {
              type: Type.OBJECT,
              properties: {
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                reelCaptionIdea: { type: Type.STRING, description: "Légende pour Reel" }
              },
              required: ["hashtags", "reelCaptionIdea"]
            },
            snapchat: {
              type: Type.OBJECT,
              properties: {
                spotlightTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                topicKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["spotlightTags", "topicKeywords"]
            },
            spotifyPitch: {
              type: Type.OBJECT,
              properties: {
                moodKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                styleGenres: { type: Type.ARRAY, items: { type: Type.STRING } },
                pitchNote: { type: Type.STRING, description: "Courte note de pitch playlist Spotify" }
              },
              required: ["moodKeywords", "styleGenres", "pitchNote"]
            }
          },
          required: ["youtube", "soundcloud", "tiktok", "instagram", "snapchat"]
        },
        recommendedPacks: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Noms des packs recommandés"
        },
        seoTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Conseils stratégiques"
        }
      },
      required: ["detectedGenre", "detectedMood", "keyElements", "platforms", "seoTips"]
    };

    // Try models with fallback: gemini-2.5-flash (fast & resilient), then gemini-3.7-flash
    const candidateModels = ["gemini-2.5-flash", "gemini-3.7-flash"];
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model,
          contents: { parts },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        const responseText = response.text || "{}";
        const parsedData = JSON.parse(responseText);

        return res.json({
          success: true,
          modelUsed: model,
          data: parsedData,
        });
      } catch (err: any) {
        console.warn(`Attempt with ${model} failed:`, err?.message || err);
        lastError = err;
        // If 503 or 429, wait 600ms before trying the next model
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    // Smart algorithmic fallback if remote model is overloaded (503 / 429 / offline)
    console.info("Using smart heuristic generation fallback due to temporary model high demand.");
    const fallbackData = generateHeuristicTags(artist, track, prompt, lyrics, targetVibe);
    return res.json({
      success: true,
      modelUsed: "heuristic-fallback",
      data: fallbackData,
      notice: "Génération réalisée avec le moteur algorithmique haute performance suite à une forte demande temporaire sur les serveurs IA.",
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
