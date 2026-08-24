<div align="center">

# 🧪 tagLab

### YouTube Tag Generator & Music SEO Toolkit

Generate smarter metadata for **rap, plug, pluggnb, trap, cloud rap, rage, hyperpop, drill and underground music**.

[![GitHub stars](https://img.shields.io/github/stars/DissidentAI/tagLab-?style=for-the-badge&logo=github&label=Stars)](https://github.com/DissidentAI/tagLab-/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/DissidentAI/tagLab-?style=for-the-badge&logo=github&label=Forks)](https://github.com/DissidentAI/tagLab-/forks)
[![GitHub issues](https://img.shields.io/github/issues/DissidentAI/tagLab-?style=for-the-badge&logo=github)](https://github.com/DissidentAI/tagLab-/issues)
![HTML5](https://img.shields.io/badge/HTML5-Standalone-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No framework](https://img.shields.io/badge/framework-none-111111?style=for-the-badge)

**500+ built-in tags · Prompt generation · Optional AI · Audio analysis · One-click copy**

</div>

---

## ✨ What is tagLab?

**tagLab** is a lightweight, standalone web application for artists, producers and content creators who want to generate, organize and optimize YouTube metadata for music releases.

It is designed especially for:

- French rap
- Plug / PluggnB
- Trap
- Cloud rap
- Rage
- Hyperpop
- Drill
- Underground / New Wave
- Melodic / emotional rap
- Dark / atmospheric music

The core application works **locally in your browser** and does **not require an account, backend, framework or AI API**.

---

## 🖼️ How tagLab works

```mermaid
flowchart LR
    A[🎵 Your track] --> B[🧪 tagLab]
    C[✍️ Track prompt] --> B
    B --> D[🔎 Local analysis]
    B --> E[🏷️ Tag library]
    B --> F[🤖 Optional AI]
    D --> G[⚡ Optimized tags]
    E --> G
    F --> G
    G --> H[📋 Copy to YouTube]
```

---

## 🚀 Main features

### 🏷️ 500+ built-in music tags

A large built-in tag library covering genres, moods, formats and search intents.

```text
plug
plug français
pluggnb
rap underground
cloud rap français
dark plug
melodic trap
new wave rap
french plug
music visualizer
rap shorts
...
```

You can:

- Search tags instantly
- Filter by category
- Select individual tags
- Copy all tags
- Copy only your selection
- Build compact tag packs
- Reuse presets depending on the track

---

## 🧠 Prompt-based tag generation

Describe your song in natural language:

```text
Dark French pluggnb track with atmospheric synths,
melodic autotune vocals, heavy 808s and a late-night mood.
```

Then tagLab generates a relevant set of tags around the description.

```mermaid
flowchart TD
    A[Prompt] --> B{Generation mode}
    B -->|Local| C[Keyword + genre matching]
    B -->|AI| D[AI model]
    C --> E[Relevant tag set]
    D --> E
    E --> F[Review / filter / copy]
```

The local generator works without any API.

---

## 🎧 Audio import & analysis

Import an audio file directly into tagLab.

Common browser-supported formats include:

- MP3
- WAV
- M4A / AAC
- OGG
- FLAC

The app contains a built-in audio player and can inspect several properties directly in the browser.

### Local audio metrics

| Metric | Purpose |
|---|---|
| Duration | Track length |
| Approx. BPM | Tempo estimation |
| RMS | Average energy |
| Peak level | Maximum amplitude |
| Sample rate | Audio resolution information |
| Channels | Mono / stereo detection |
| Zero-crossing rate | Rough spectral / texture indicator |

---

## 🤖 Optional AI integration

AI is completely optional.

You can configure:

```text
API endpoint
AI model
API key
Optional audio-analysis endpoint
```

### Architecture

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant T as 🧪 tagLab
    participant P as 🔐 Backend / Proxy
    participant AI as 🤖 AI Provider

    U->>T: Import track + write prompt
    T->>T: Local audio analysis
    T->>P: Prompt + metadata + optional audio
    P->>AI: Authenticated AI request
    AI-->>P: Analysis + suggested tags
    P-->>T: Clean response
    T-->>U: Optimized tag selection
```

> [!IMPORTANT]
> Do not expose a production API key in a publicly hosted HTML/JavaScript application. Use a backend or secure proxy for public deployments.

---

## 🔐 Privacy-first local workflow

Without AI enabled:

```mermaid
flowchart LR
    A[Your computer] --> B[Browser]
    B --> C[tagLab]
    C --> D[Local Web Audio API]
    D --> E[Tags / analysis]
    E --> A
```

Your audio does not need to leave the browser for the local features.

When you explicitly configure and use an external AI endpoint, the privacy and data-processing rules of that provider apply.

---

## ⚡ Quick start

### Download

Clone the repository:

```bash
git clone https://github.com/DissidentAI/tagLab-.git
cd tagLab-
```

Then open the HTML application in a modern browser.

### Optional local server

For better compatibility with browser APIs:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

No `npm install` required.

---

## 🎯 Recommended workflow

```mermaid
flowchart TD
    A[1. Import your track] --> B[2. Describe the sound]
    B --> C[3. Run local analysis]
    C --> D{Use AI?}
    D -->|No| E[Local tag generation]
    D -->|Yes| F[AI-assisted generation]
    E --> G[5. Filter tags]
    F --> G
    G --> H[6. Copy optimized pack]
    H --> I[7. Publish on YouTube]
```

A useful final tag set combines several layers:

```text
Artist identity
+
Track title
+
Main genre
+
Subgenre
+
Mood
+
Production style
+
Language / market
+
Video format
```

Example:

```text
artist name,
track title,
plug,
plug français,
pluggnb,
rap français,
rap underground,
dark plug,
melodic plug,
cloud rap,
new wave rap,
french plug,
official audio,
music visualizer
```

---

## 🛠️ Technology

<div align="center">

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| UI | CSS3 |
| Logic | Vanilla JavaScript |
| Audio | Web Audio API |
| Files | File API |
| Network | Fetch API |
| Processing | Browser-side |

</div>

The project intentionally avoids unnecessary dependencies.

---

## 📦 Suggested project structure

```text
tagLab-/
├── tagLab.html
├── README.md
├── LICENSE
└── assets/
```

The application can also remain entirely contained in a single HTML file.

---

## 🗺️ Roadmap

```mermaid
mindmap
  root((tagLab))
    YouTube SEO
      Title generator
      Description generator
      Hashtag generator
      SEO scoring
      Shorts keywords
    Audio Intelligence
      Better BPM detection
      Key detection
      Mood classification
      Genre detection
      Lyrics analysis
    AI
      Multi-provider support
      Local models
      Audio multimodal analysis
    Creator workflow
      Artist profiles
      Release presets
      Export templates
      YouTube Data API
```

### Planned ideas

- [ ] YouTube title generator
- [ ] YouTube description generator
- [ ] Hashtag generator
- [ ] Shorts keyword generator
- [ ] SEO score
- [ ] Thumbnail concept generator
- [ ] Improved BPM detection
- [ ] Key detection
- [ ] Automatic genre detection
- [ ] Mood classification
- [ ] Lyrics analysis
- [ ] YouTube Data API integration
- [ ] Spotify metadata integration
- [ ] Saved artist profiles
- [ ] Release templates
- [ ] Multi-provider AI support
- [ ] Local AI model support

---

## ⭐ Support the project

If tagLab is useful to you, **leave a star** — it helps the project become more visible and makes it easier for other artists and creators to discover it.

<div align="center">

[![Star tagLab](https://img.shields.io/github/stars/DissidentAI/tagLab-?style=for-the-badge&logo=github&label=STAR%20TAGLAB)](https://github.com/DissidentAI/tagLab-/stargazers)

</div>

---

## 🤝 Contributing

Contributions, bug reports and feature requests are welcome.

```bash
git checkout -b feature/my-feature
git commit -m "Add my feature"
git push origin feature/my-feature
```

Then open a Pull Request.

---

## 🏷️ GitHub Topics

```text
youtube-seo
youtube-tags
tag-generator
music-seo
music-tools
youtube-tools
rap
french-rap
plug
pluggnb
trap
cloud-rap
underground-rap
music-marketing
artist-tools
audio-analysis
ai-tools
javascript
html
web-app
open-source
```

---

## ⚠️ Disclaimer

tagLab is an independent project and is not affiliated with, endorsed by or sponsored by YouTube or Google.

Metadata optimization can improve organization and contextual signals, but no tag strategy can guarantee views, recommendations, rankings or viral performance.

---

<div align="center">

## 🧪 tagLab

**Generate smarter tags · Understand your track · Publish faster**

[⭐ Star](https://github.com/DissidentAI/tagLab-/stargazers) · [🐛 Issues](https://github.com/DissidentAI/tagLab-/issues) · [🍴 Fork](https://github.com/DissidentAI/tagLab-/fork)

</div>
