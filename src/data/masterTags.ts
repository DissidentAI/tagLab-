import { TagCategory, TagPack } from '../types';

export const MASTER_CATEGORIES: TagCategory[] = [
  {
    id: 'identity',
    name: 'IDENTITE / A PERSONNALISER',
    description: 'À adapter avec votre nom d’artiste et le titre de votre morceau pour ancrer votre marque',
    tags: [
      "[TON NOM D'ARTISTE]",
      "[TON NOM D'ARTISTE] rap",
      "[TON NOM D'ARTISTE] plug",
      "[TON NOM D'ARTISTE] pluggnb",
      "[TON NOM D'ARTISTE] trap",
      "[TON NOM D'ARTISTE] musique",
      "[TON NOM D'ARTISTE] officiel",
      "[TON NOM D'ARTISTE] official",
      "[NOM DU MORCEAU]",
      "[NOM DU MORCEAU] rap",
      "[NOM DU MORCEAU] plug",
      "[NOM DU MORCEAU] official audio",
      "[NOM DU MORCEAU] official visualizer",
      "[NOM DU MORCEAU] lyrics"
    ]
  },
  {
    id: 'rap_fr_general',
    name: 'RAP FRANCAIS GENERAL',
    description: 'Tags piliers pour le référencement global dans le rap francophone',
    tags: [
      "rap", "rap français", "rap francais", "rap fr", "rap france", "french rap",
      "rap français 2026", "rap francais 2026", "nouveau rap français", "nouveau rap francais",
      "new french rap", "rap nouvelle génération", "rap nouvelle generation", "new gen rap",
      "new wave rap", "new wave france", "rap moderne", "rap actuel", "rap émergent",
      "rap emergent", "artiste rap français", "artiste rap francais", "nouvel artiste rap",
      "nouveau rappeur français", "nouveau rappeur francais", "musique rap", "musique française",
      "musique francaise", "hip hop français", "hip hop francais", "french hip hop",
      "rap indépendant", "rap independant", "rap indé", "rap inde", "independent french rap",
      "rap alternatif", "rap alternative", "rap expérimental", "rap experimental",
      "alternative rap", "experimental rap"
    ]
  },
  {
    id: 'plug',
    name: 'PLUG',
    description: 'Scène Plug rap moderne, sonorités 808, textures aériennes et underground',
    tags: [
      "plug", "plug rap", "rap plug", "plug fr", "plug france", "plug français", "plug francais",
      "french plug", "plug français 2026", "plug francais 2026", "plug rap français",
      "plug rap francais", "plug underground", "underground plug", "new plug", "new plug music",
      "plug music", "plug song", "plug sound", "plug vibes", "plug vibe", "plug français underground",
      "plug france underground", "plug rap 2026", "plug new wave", "plug new gen", "plug mélodique",
      "plug melodique", "melodic plug", "dark plug", "ambient plug", "atmospheric plug", "cloud plug",
      "dreamy plug", "sad plug", "emotional plug", "experimental plug", "alternative plug",
      "digital plug", "futuristic plug", "plug 808", "plug beats", "plug instrumental",
      "plug freestyle", "plug music france", "plug artist france"
    ]
  },
  {
    id: 'pluggnb',
    name: 'PLUGGNB / RNB PLUG',
    description: 'Mélodies R&B planantes, vibes nocturnes, autotune mélodique et beats pluggnb',
    tags: [
      "pluggnb", "pluggnb fr", "pluggnb france", "pluggnb français", "pluggnb francais",
      "french pluggnb", "pluggnb rap", "rap pluggnb", "pluggnb 2026", "pluggnb underground",
      "pluggnb français 2026", "pluggnb francais 2026", "plug rnb", "plug r&b", "rnb plug",
      "r&b plug", "rnb français", "rnb francais", "french rnb", "alternative rnb", "underground rnb",
      "melodic pluggnb", "dark pluggnb", "sad pluggnb", "emotional pluggnb", "ambient pluggnb",
      "dreamy pluggnb", "cloud pluggnb", "romantic pluggnb", "love pluggnb", "toxic pluggnb",
      "late night pluggnb", "night pluggnb", "smooth pluggnb", "ethereal pluggnb", "spacey pluggnb",
      "experimental pluggnb", "new wave pluggnb"
    ]
  },
  {
    id: 'trap',
    name: 'TRAP',
    description: 'Basses lourdes 808, hi-hats rapides, trap sombre et moderne',
    tags: [
      "trap", "trap fr", "trap france", "trap française", "trap francaise", "french trap",
      "trap français", "trap francais", "trap 2026", "trap française 2026", "trap francaise 2026",
      "rap trap", "trap rap", "trap underground", "underground trap", "dark trap", "melodic trap",
      "ambient trap", "atmospheric trap", "cloud trap", "experimental trap", "alternative trap",
      "new wave trap", "new gen trap", "modern trap", "futuristic trap", "space trap",
      "digital trap", "trap 808", "808 trap", "heavy 808", "bass trap", "trap sombre",
      "trap nocturne", "trap mélodique", "trap melodique", "trap émotionnelle", "trap emotionnelle",
      "trap sad", "sad trap", "late night trap", "night trap", "trap freestyle"
    ]
  },
  {
    id: 'cloud_rap',
    name: 'CLOUD RAP / ATMOSPHERIQUE',
    description: 'Ambiance planante, synthés éthérés, night drive et textures nocturnes',
    tags: [
      "cloud rap", "cloud rap fr", "cloud rap france", "cloud rap français", "cloud rap francais",
      "french cloud rap", "cloud rap 2026", "ambient rap", "atmospheric rap", "rap atmosphérique",
      "rap atmospherique", "dreamy rap", "ethereal rap", "spacey rap", "floating rap",
      "melodic cloud rap", "dark cloud rap", "sad cloud rap", "emotional cloud rap", "night cloud rap",
      "late night rap", "midnight rap", "nocturnal rap", "rap nocturne", "musique nocturne",
      "vibe nocturne", "night drive rap", "night drive music", "car music night", "city night rap",
      "neon rap", "cyber rap", "futuristic rap", "digital rap"
    ]
  },
  {
    id: 'rage_hyperpop',
    name: 'RAGE / HYPERPOP / DIGITAL',
    description: 'Leads saturés, énergie brute, synthés agressifs et esthétique cyber internet',
    tags: [
      "rage", "rage rap", "rage fr", "rage france", "french rage", "rage français", "rage francais",
      "rage trap", "rage plug", "rage rap 2026", "underground rage", "experimental rage",
      "hyperpop rap", "hyperpop fr", "hyperpop france", "french hyperpop", "hyperpop français",
      "hyperpop francais", "rap hyperpop", "hypertrap", "hyper trap", "glitch rap", "glitch trap",
      "glitchcore rap", "cyber trap", "electronic rap", "electronic trap", "experimental hip hop",
      "internet rap", "internet music", "new internet rap", "underground internet rap",
      "distorted rap", "distorted trap", "synth trap", "synth rap"
    ]
  },
  {
    id: 'drill_dark',
    name: 'DRILL / DARK',
    description: 'Glides 808, ambiances froides, drill mélodique et atmosphérique',
    tags: [
      "drill", "drill fr", "drill france", "drill française", "drill francaise", "french drill",
      "drill français", "drill francais", "drill 2026", "dark drill", "melodic drill",
      "ambient drill", "trap drill", "drill trap", "underground drill", "dark rap", "rap sombre",
      "rap dark", "dark french rap", "rap noir", "dark underground rap", "menacing rap",
      "cold rap", "cold trap", "cold drill", "sinister rap", "ominous rap", "noir rap", "night drill"
    ]
  },
  {
    id: 'underground_newwave',
    name: 'UNDERGROUND / NEW WAVE',
    description: 'Nouvelle vague rap français, artistes émergents et scènes indés',
    tags: [
      "underground", "rap underground", "rap underground français", "rap underground francais",
      "underground rap", "underground rap france", "french underground rap", "musique underground",
      "underground music france", "underground français", "underground francais", "scène underground",
      "scene underground", "scène rap française", "scene rap francaise", "new wave",
      "new wave français", "new wave francais", "new gen", "nouvelle vague rap",
      "nouvelle génération rap", "nouvelle generation rap", "artiste émergent", "artiste emergent",
      "underground artist", "indie rap france", "independent rap france", "rap alternatif français",
      "rap alternatif francais", "alternative french rap", "experimental french rap",
      "rap expérimental français", "rap experimental francais"
    ]
  },
  {
    id: 'melodique_emotion',
    name: 'MELODIQUE / EMOTION / LOVE',
    description: 'Thématiques de cœur, mélancolie nocturne, relations toxiques et introspection',
    tags: [
      "rap mélodique", "rap melodique", "melodic rap", "melodic french rap", "rap émotionnel",
      "rap emotionnel", "emotional rap", "sad rap", "sad french rap", "melancholic rap",
      "melancholy rap", "rap mélancolique", "rap melancolique", "love rap", "rap love", "rap amour",
      "toxic love rap", "toxic rap", "heartbreak rap", "breakup rap", "lonely rap", "loneliness rap",
      "solitude rap", "late night feelings", "midnight feelings", "sad night music",
      "emotional trap", "love plug", "romantic plug", "toxic plug"
    ]
  },
  {
    id: 'vibe_ambiance',
    name: 'VIBE / AMBIANCE',
    description: 'Chill, car drive, city lights, musiques de nuit et ambiances immersives',
    tags: [
      "vibe", "vibes", "chill rap", "chill trap", "chill plug", "chill pluggnb", "chill french rap",
      "moody rap", "moody trap", "moody plug", "dreamy music", "dreamy trap", "night vibe",
      "night vibes", "late night vibe", "late night music", "midnight vibe", "midnight music",
      "night drive", "car music", "car rap", "car playlist", "music for driving", "music to drive to",
      "city lights music", "neon vibe", "dark vibe", "dark vibes", "sad vibe", "sad vibes",
      "melodic vibe", "atmospheric music", "spacey music", "ethereal music"
    ]
  },
  {
    id: 'format_video',
    name: 'FORMAT VIDEO / DECOUVERTE',
    description: 'Visuels, audios officiels, clips, paroles et mots-clés de nouveautés',
    tags: [
      "official audio", "audio officiel", "official visualizer", "visualizer", "music visualizer",
      "rap visualizer", "plug visualizer", "official music video", "clip officiel", "music video",
      "vidéo officielle", "video officielle", "lyrics", "paroles", "lyrics video", "video lyrics",
      "lyric video", "rap lyrics", "plug lyrics", "pluggnb lyrics", "nouveau son", "nouveau son rap",
      "nouveau morceau", "nouveau morceau rap", "new song", "new rap song", "new music",
      "new music 2026", "nouvelle musique 2026", "sortie rap", "sortie rap 2026", "nouveauté rap",
      "nouveaute rap", "nouveauté rap français", "nouveaute rap francais", "rap découverte",
      "rap decouverte", "découverte rap", "decouverte rap", "nouvel artiste", "artiste à découvrir",
      "artiste a decouvrir", "underground discovery", "rap discovery"
    ]
  },
  {
    id: 'seo_longtail',
    name: 'SEO / RECHERCHES LONGUE TRAINE',
    description: 'Requêtes de recherche précises tapées par les auditeurs ciblés',
    tags: [
      "meilleur rap underground français", "meilleur rap underground francais",
      "nouveau rap underground français", "nouveau rap underground francais",
      "nouvelle scène rap française", "nouvelle scene rap francaise",
      "rap français nouvelle génération", "rap francais nouvelle generation",
      "nouveau son plug français", "nouveau son plug francais", "nouveau plug français",
      "nouveau plug francais", "plug francais underground", "nouveau pluggnb français",
      "nouveau pluggnb francais", "pluggnb français underground", "pluggnb francais underground",
      "nouvelle trap française", "nouvelle trap francaise", "rap français underground 2026",
      "rap francais underground 2026", "cloud rap français 2026", "cloud rap francais 2026",
      "new wave rap français", "new wave rap francais", "artiste plug français",
      "artiste plug francais", "rappeur plug français", "rappeur plug francais",
      "artiste underground français", "artiste underground francais",
      "rap français alternatif", "rap francais alternatif", "musique plug française",
      "musique plug francaise"
    ]
  },
  {
    id: 'shorts_extraits',
    name: 'SHORTS / EXTRAITS',
    description: 'Formats courts viraux pour YouTube Shorts, snippets et teasers',
    tags: [
      "youtube shorts", "shorts", "rap shorts", "music shorts", "plug shorts", "pluggnb shorts",
      "trap shorts", "french rap shorts", "rap français shorts", "rap francais shorts",
      "underground rap shorts", "music snippet", "rap snippet", "plug snippet", "song snippet",
      "music teaser", "rap teaser", "plug teaser", "new song teaser", "extrait rap",
      "extrait musique", "extrait plug", "extrait morceau", "preview song", "song preview",
      "music preview", "viral rap", "viral music", "underground viral", "rap trend",
      "music trend", "plug trend"
    ]
  },
  {
    id: 'production_sonorites',
    name: 'PRODUCTION / SONORITES',
    description: 'Termes techniques recherchés par les passionnés de beatmaking et toplines',
    tags: [
      "808", "808 bass", "heavy bass", "deep bass", "sub bass", "distorted 808", "melodic 808",
      "spacey beat", "ambient beat", "dark beat", "dreamy beat", "plug beat", "pluggnb beat",
      "trap beat", "rage beat", "cloud rap beat", "futuristic beat", "glitch beat", "synth beat",
      "ethereal beat", "underground beat", "new wave beat", "melodic beat", "sad beat",
      "atmospheric beat", "electronic beat", "experimental beat", "trap production",
      "plug production", "rap production", "vocal effects", "autotune rap", "autotune plug",
      "melodic autotune", "reverb vocals", "ambient vocals", "airy vocals"
    ]
  },
  {
    id: 'france_public',
    name: 'FRANCE / PUBLIC FRANCOPHONE',
    description: 'Ciblage géographique et linguistique pour maximiser la portée francophone',
    tags: [
      "musique france", "musique française 2026", "musique francaise 2026", "rap francophone",
      "rap francophone 2026", "musique francophone", "french music", "french music 2026",
      "rap paris", "rap lyon", "rap marseille", "rap france 2026", "underground france",
      "music france underground", "french underground", "french new wave", "french new gen",
      "french trap 2026", "french plug 2026", "french pluggnb 2026", "french cloud rap 2026",
      "french rage rap"
    ]
  }
];

export const MASTER_PACKS: TagPack[] = [
  {
    id: 'pack_1_plug_fr',
    name: 'PACK 1 — PLUG FR / UNDERGROUND',
    subtitle: 'Idéal pour morceaux Plug avec 808 légères, synths digitaux et ambiance underground',
    tags: [
      "plug", "plug français", "plug fr", "rap plug", "french plug", "rap français",
      "rap underground", "underground rap france", "plug underground", "new wave rap",
      "new gen rap", "plug 2026", "rap français 2026", "dark plug", "melodic plug",
      "cloud plug", "musique underground", "nouveau rap français",
      "[TON NOM D'ARTISTE]", "[NOM DU MORCEAU]"
    ]
  },
  {
    id: 'pack_2_pluggnb',
    name: 'PACK 2 — PLUGGNB / MELODIQUE',
    subtitle: 'Idéal pour morceaux chantés, autotune mélodique, vibes RnB nocturnes et romantiques',
    tags: [
      "pluggnb", "pluggnb france", "pluggnb français", "french pluggnb", "plug rnb",
      "rnb plug", "rap mélodique", "melodic rap", "melodic pluggnb", "sad pluggnb",
      "emotional pluggnb", "dreamy pluggnb", "cloud pluggnb", "rap français",
      "rap underground", "new wave rap", "night vibe", "late night music",
      "[TON NOM D'ARTISTE]", "[NOM DU MORCEAU]"
    ]
  },
  {
    id: 'pack_3_dark_plug',
    name: 'PACK 3 — DARK PLUG / TRAP',
    subtitle: 'Idéal pour ambiances sombres, grosses basses 808, trap agressive et nocturne',
    tags: [
      "dark plug", "plug", "plug français", "trap française", "dark trap", "rap sombre",
      "trap underground", "rap underground", "french trap", "plug underground",
      "ambient trap", "atmospheric trap", "heavy 808", "dark rap", "night trap",
      "new wave trap", "futuristic trap", "rap français 2026",
      "[TON NOM D'ARTISTE]", "[NOM DU MORCEAU]"
    ]
  },
  {
    id: 'pack_4_cloud',
    name: 'PACK 4 — CLOUD / NIGHT DRIVE',
    subtitle: 'Idéal pour ambiances spatiales, balades de nuit en voiture, synthés éthérés',
    tags: [
      "cloud rap", "cloud rap français", "cloud trap", "cloud plug", "ambient rap",
      "atmospheric rap", "rap nocturne", "night drive rap", "night drive music",
      "late night rap", "midnight rap", "dreamy rap", "ethereal rap", "spacey rap",
      "melodic rap", "rap français", "rap underground", "new wave rap",
      "[TON NOM D'ARTISTE]", "[NOM DU MORCEAU]"
    ]
  },
  {
    id: 'pack_5_rage',
    name: 'PACK 5 — RAGE / HYPERPOP',
    subtitle: 'Idéal pour synthés saturés, hypertrap, glitch, énergie brute et new gen internet',
    tags: [
      "rage rap", "rage fr", "french rage", "rage trap", "rage plug", "hyperpop rap",
      "hypertrap", "digital rap", "glitch rap", "futuristic rap", "experimental rap",
      "new wave rap", "new gen rap", "underground rap france", "rap français",
      "trap française", "distorted 808", "synth trap",
      "[TON NOM D'ARTISTE]", "[NOM DU MORCEAU]"
    ]
  },
  {
    id: 'pack_6_shorts',
    name: 'PACK 6 — SHORT / TEASER',
    subtitle: 'Optimisé pour le référencement des extraits, snippets et teasers verticaux',
    tags: [
      "youtube shorts", "rap shorts", "music shorts", "plug shorts", "pluggnb shorts",
      "french rap shorts", "music snippet", "rap snippet", "plug snippet",
      "song snippet", "music teaser", "rap teaser", "extrait rap", "extrait plug",
      "new song teaser", "song preview", "viral rap", "underground viral",
      "[TON NOM D'ARTISTE]", "[NOM DU MORCEAU]"
    ]
  }
];

export const TOTAL_UNIQUE_TAGS = 549;

export const SEO_GUIDELINES = [
  {
    title: "1. Identité d'abord",
    text: "Toujours inclure ton nom d’artiste et le titre exact du morceau en début de liste pour que l'algorithme associe tes futures sorties."
  },
  {
    title: "2. Les 3 couches magiques",
    text: "Mélange toujours 3 couches : Identité (Artiste/Titre) + Genre précis (Plug/Pluggnb/Trap) + Ambiance & Format (Nocturne/Visualizer/Clip)."
  },
  {
    title: "3. Zéro spam hors-sujet",
    text: "Évite les noms d'artistes majeurs sans rapport direct : l'algorithme détecte les faux clics et pénalise la rétention de ta vidéo."
  },
  {
    title: "4. Limite YouTube 500 caractères",
    text: "YouTube accepte jusqu'à 500 caractères dans le champ tags. Privilégie 15 à 25 tags ultra-pertinents plutôt que de surcharger."
  },
  {
    title: "5. Titre & Miniature rois",
    text: "Les tags aident la catégorisation initiale, mais ce sont le titre accrocheur, une miniature percutante et la rétention d'écoute qui créent la viralité."
  }
];

/**
 * Replaces placeholder tokens in tags with real artist and track names.
 */
export function formatTag(tag: string, artistName: string, trackName: string): string {
  let result = tag;
  const a = artistName.trim() || "[TON NOM D'ARTISTE]";
  const t = trackName.trim() || "[NOM DU MORCEAU]";
  
  result = result.replace(/\[TON NOM D'ARTISTE\]/gi, a);
  result = result.replace(/\[NOM DU MORCEAU\]/gi, t);
  return result;
}

export function formatTagsList(tags: string[], artistName: string, trackName: string): string[] {
  return tags.map(tag => formatTag(tag, artistName, trackName));
}
