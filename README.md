# 🌱 SAHYADRI AI — Karnataka Agricultural Advisory System

[![Live Web App](https://img.shields.io/badge/Live_Demo-amith1994.github.io%2FSAHYADRI--AI-22c55e?style=for-the-badge&logo=googlechrome&logoColor=white)](https://amith1994.github.io/SAHYADRI-AI/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Amith1994%2FSAHYADRI--AI-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Amith1994/SAHYADRI-AI)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19+-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini Multi-Model](https://img.shields.io/badge/Google_Gemini-2.5_Flash_Lite_|_3.1_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> **Live Web App Available at**: [https://amith1994.github.io/SAHYADRI-AI/](https://amith1994.github.io/SAHYADRI-AI/)  
> **GitHub Repository**: [https://github.com/Amith1994/SAHYADRI-AI](https://github.com/Amith1994/SAHYADRI-AI)

An enterprise-grade, **Retrieval-Augmented Generation (RAG)** Agricultural AI Assistant purpose-built for Karnataka farmers, agronomists, researchers, and extension officers. Sahyadri delivers authoritative, scientifically verified cultivation intelligence for **Groundnut, Rice/Paddy, Maize, and Arecanut**, cross-referenced with real-time **IMD Agromet Weather Bulletins** across all 31 districts of Karnataka in both **English and Kannada (ಕನ್ನಡ)**.

---

## 📑 Table of Contents

1. [Key Highlights & Core Principles](#-key-highlights--core-principles)
2. [ChatGPT / Claude-Level Agronomic Intelligence](#-chatgpt--claude-level-agronomic-intelligence)
3. [Supported Crops & Agronomic Intents](#-supported-crops--agronomic-intents)
4. [IMD Agromet 5-Day Weather Advisory Engine](#-imd-agromet-5-day-weather-advisory-engine)
5. [Farm Context & Personalization System](#-farm-context--personalization-system)
6. [System Architecture & Multi-Model RAG Pipeline](#-system-architecture--multi-model-rag-pipeline)
7. [Knowledge Base & Institutional Hierarchy](#-knowledge-base--institutional-hierarchy)
8. [Professional Report UI & Typography Standards](#-professional-report-ui--typography-standards)
9. [Backend Services & Code Structure](#-backend-services--code-structure)
10. [REST API Documentation](#-rest-api-documentation)
11. [Quick Start & Installation](#-quick-start--installation)
12. [Automated Testing Suite](#-automated-testing-suite)
13. [Agricultural Safety & Ethics Guardrails](#-agricultural-safety--ethics-guardrails)
14. [Project Directory Layout](#-project-directory-layout)
15. [Roadmap](#-roadmap)
16. [License & Acknowledgements](#-license--acknowledgements)

---

## 🌟 Key Highlights & Core Principles

- **Zero Chemical Hallucination**: Strict context-bounded generation guarantees that pesticide, fungicide, herbicide, and fertilizer dosages come only from university-approved Packages of Practices (PoP 2026).
- **Stage-Aware Crop Precision**: The AI detects specific crop age/stage (e.g., *30 days after sowing, flowering, pegging, transplanting, maturity*) and delivers tailored field operations rather than generic pre-sowing advice.
- **Multi-Model Gemini Failover Ladder**: Automatic failover across `gemini-2.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-2.5-flash`, `gemini-3-flash-preview`, and `gemini-3.7-flash` with rate-limit retry and sub-second latency.
- **Karnataka-First Institutional Hierarchy**: Regional recommendations prioritize **KSNUAHS Shivamogga**, **UAS Dharwad**, **UAS Bengaluru (GKVK)**, and **UAS Raichur**, backed by national **ICAR** apex institutes.
- **Collapsible Sources & Verification**: Sources are cleanly collapsed by default with an interactive `[SHOW ▼] / [HIDE ▲]` toggle and numbered citations (`[1]`, `[2]`).
- **Professional Academic & Report Typography**: Sharp black text (`#000000`), full text justification (`text-justify`), 1.45–1.5 line spacing, and highlighted bold agricultural values/dosages.
- **Native Bilingual Support (English & ಕನ್ನಡ)**: Automatic Unicode script detection with localized prompt templates and native Kannada responses for rural accessibility.
- **Agromet 5-Day Forecast & Spray Windows**: Real-time integration of IMD agrometeorological data spanning 31 Karnataka districts and 193+ block series with automated spray-window safety checks.
- **Dynamic Offline Agronomy Engine**: Stage-aware offline rule engine for full functionality when internet or API keys are unavailable.

---

## 🧠 ChatGPT / Claude-Level Agronomic Intelligence

Sahyadri is engineered to think and respond with the depth, nuance, and contextual precision of state-of-the-art AI models, fine-tuned specifically for Karnataka crops, physiological growth stages (DAS), and agro-climatic conditions.

### 📐 Standardized 5-Part Agricultural Response Framework

Every query is answered following a strict, structured agronomic framework designed to deliver direct, actionable, and scientific advice:

```markdown
### Diagnosis & Direct Answer
Direct, empathetic diagnosis that explicitly identifies the current physiological growth stage (e.g. Peak Flowering to Active Pegging at 45 DAS), explains the transition to the next upcoming growth stage (e.g. Pod Development & Kernel Filling at 55–75 DAS), and directly addresses the farmer's question with respect to variety and location.

### What to do & Recommended Field Operations
1. **[Core Stage Operation & Higher Yield Priority — Stage & Fertilizer Dosages]**:
   - Explicitly names the growth stage.
   - Prescribes exact fertilizer schedules: NPK split ratios, secondary nutrients (Gypsum @ 500 kg/ha or 200 kg/acre for pod filling and calcium/sulfur), micronutrients (Zinc Sulphate @ 2 g/L, Borax @ 1 g/L), and foliar boosters (2% DAP @ 20 g/L or Planofix NAA @ 0.25 mL/L or 19:19:19 @ 5 g/L).
2. **[Field & Soil Management]**:
   - Actionable physical field management, weeding windows, and drainage precautions (e.g. strictly NO mechanical hoeing after peg entry to protect gynophores; clear furrows for drainage).
3. **[Pest & Disease Management — 3 Approaches]**:
   - **Major Pests & Diseases at this Stage**: Explicit scientific & common names (e.g., Tikka Leaf Spot, Rust, Spodoptera caterpillar, Leaf miner, Thrips).
   - **Chemical Control (PoP 2026)**: Specific approved chemical molecules with exact dosages in g/L or mL/L and spray volumes (500 L/ha).
   - **Biological & Organic Control**: Bio-agents (*Trichoderma*, *Pseudomonas fluorescens* @ 10 g/L, *Nomuraea rileyi* @ 2 kg/ha, NSKE 5% @ 50 mL/L, *Verticillium* @ 5 g/L).
   - **IPM & Cultural Practices**: Pointwise IPM recommendations (4–5 pheromone traps/acre for *Spodoptera*, 10–12 yellow sticky traps/acre, hand destruction of egg masses, border barrier crops).

### 🌦️ IMD Agromet 5-Day Weather-Based Advisory
1. **[Question-Specific Weather Advisory]**: Direct advisory synthesizing the 5-day rainfall in mm and forecast with the farmer's exact question and current stage (Point 1 in this section).
2. **[Field Operation / Spray Window]**: Precise spray timing (6:30–9:00 AM or 4:30–6:30 PM) under calm winds (<8 km/h).
3. **[Micro-Climate & Agronomic Risk Alert]**: Microclimate risk warnings (e.g., morning RH >85–95% and overcast skies accelerating fungal epidemics).

### ⚠️ Important Message for Farmer
Crucial golden rule, stage-specific precaution, or critical safety warning.

### Sources
[1] University / ICAR verified source references
```

---

### 🇮🇳 Kannada Standardized Framework (ಕನ್ನಡ ಮಾದರಿ)

```markdown
### ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ನೇರ ಉತ್ತರ
ಪ್ರಸ್ತುತ ಬೆಳೆಯ ಬೆಳವಣಿಗೆಯ ನಿರ್ದಿಷ್ಟ ಹಂತದ ಹೆಸರು (ಉದಾ: 45 ದಿನಗಳಲ್ಲಿ ಗರಿಷ್ಠ ಹೂವಾಡುವಿಕೆಯಿಂದ ಸಕ್ರಿಯ ಕಾಯಿ ಇಳಿಯುವ ಹಂತ), ಮುಂದಿನ ಹಂತಕ್ಕೆ ಬದಲಾವಣೆಯ ವಿವರ ಮತ್ತು ರೈತರ ಪ್ರಶ್ನೆಗೆ ನೇರವಾದ ಸಮಗ್ರ ಉತ್ತರ.

### ಏನು ಮಾಡಬೇಕು (ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆಗಳು)
1. **[ಪ್ರಸ್ತುತ ಹಂತದ ಮುಖ್ಯ ಕ್ರಮ ಮತ್ತು ಪೋಷಕಾಂಶ/ಗೊಬ್ಬರದ ನಿಖರ ಪ್ರಮಾಣ]**: ಹಂತದ ಹೆಸರು, NPK ರಸಗೊಬ್ಬರದ ಪ್ರಮಾಣ, ಜಿಪ್ಸಮ್/ದ್ವಿತೀಯ ಪೋಷಕಾಂಶ (200 ಕೆಜಿ/ಎಕರೆ), ಲಘು ಪೋಷಕಾಂಶಗಳು (ಸತು/ಬೋರಾನ್) ಮತ್ತು ಸಿಂಪಡಣೆ ಪ್ರಮಾಣ.
2. **[ಕ್ಷೇತ್ರ ಮತ್ತು ಮಣ್ಣಿನ ನಿರ್ವಹಣೆ]**: ಮಣ್ಣು ಏರಿಸುವುದು, ಕಳೆ ನಿರ್ವಹಣೆ ಹಾಗೂ ಬಸಿಗಾಲುವೆ ಸಿದ್ಧತೆ (ಕಾಯಿ ಇಳಿಯುವಾಗ ಎಡೆಕುಂಟೆ ನಿಷೇಧ).
3. **[ರೋಗ ಮತ್ತು ಕೀಟ ನಿರ್ವಹಣೆ — ೩ ವಿಧಾನಗಳಲ್ಲಿ]**:
   - **ಈ ಹಂತದ ಪ್ರಮುಖ ಕೀಟ ಮತ್ತು ರೋಗಗಳು**: ಟಿಕ್ಕಾ ಎಲೆಚುಕ್ಕೆ, ತುಕ್ಕು ರೋಗ, ತಂಬಾಕು ಕಂಬಳಿಹುಳು (ಸ್ಪೊಡೋಪ್ಟೆರಾ), ಎಲೆ ಸುರುಳಿ ಹುಳು, ಥ್ರಿಪ್ಸ್.
   - **ರಾಸಾಯನಿಕ ನಿರ್ವಹಣೆ (PoP 2026)**: ಶಿಫಾರಸು ಮಾಡಿದ ಕೀಟನಾಶಕ/ಶಿಲೀಂಧ್ರನಾಶಕಗಳು ಮತ್ತು ನಿಖರ ಪ್ರಮಾಣ ಗ್ರಾಂ/ಮಿ.ಲೀ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ.
   - **ಜೈವಿಕ ಮತ್ತು ಸಾವಯವ ನಿಯಂತ್ರಣ**: ಜೈವಿಕ ಪೀಡೆನಾಶಕಗಳು (ಟ್ರೈಕೋಡರ್ಮಾ, ಸ್ಯೂಡೋಮೊನಾಸ್, ಬೇವಿನ ಕಷಾಯ NSKE 5%) ನಿಖರ ಪ್ರಮಾಣದೊಂದಿಗೆ.
   - **ಸಮಗ್ರ ಕೀಟ ಹಾಗೂ ರೋಗ ನಿರ್ವಹಣೆ (IPM)**: ಮೋಹಕ ಬಲೆಗಳ ಸಂಖ್ಯೆ, ಹಳದಿ ಅಂಟು ಬಲೆ, ಬಲೆ ಬೆಳೆಗಳು ಮತ್ತು ಕೃಷಿ ಪದ್ಧತಿಗಳು.

### 🌦️ ಐಎಂಡಿ 5-ದಿನಗಳ ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ
1. **[ಪ್ರಶ್ನೆ ಆಧಾರಿತ ಹವಾಮಾನ ಸಲಹೆ]**: ಮುನ್ಸೂಚನೆಯ 5 ದಿನಗಳ ಮಳೆ (ಮಿ.ಮೀ) ಮತ್ತು ಹವಾಮಾನಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಕೇಳಿದ ಪ್ರಶ್ನೆ ಮತ್ತು ಬೆಳೆಯ ಹಂತಕ್ಕೆ ನೇರ ಸಲಹೆ.
2. **[ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ (Spray Window)]**: ಮಳೆ, ತಾಪಮಾನ ಮತ್ತು ಶಾಂತ ಗಾಳಿಯ ವೇಳೆಯಲ್ಲಿ (6:30–9:00 AM) ಸಿಂಪಡಣೆ ಸಮಯ.
3. **[ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಮತ್ತು ರೋಗ/ಕೀಟ ಎಚ್ಚರಿಕೆ]**: ಆರ್ದ್ರತೆ (>85%), ಮೋಡ ಮತ್ತು ತಾಪಮಾನಕ್ಕೆ ಅನುಗುಣವಾಗಿ ರೋಗ/ಕೀಟ ಬಾಧೆಯ ಮುನ್ನೆಚ್ಚರಿಕೆ.

### ⚠️ ರೈತರಿಗೆ ಪ್ರಮುಖ ಸಂದೇಶ
ರೈತರು ಕಡ್ಡಾಯವಾಗಿ ಪಾಲಿಸಬೇಕಾದ ಮುಖ್ಯ ಎಚ್ಚರಿಕೆ ಅಥವಾ ಮಹತ್ವದ ನಿಯಮ.

### ಮೂಲಗಳು
[1] ಅಧಿಕೃತ ವಿಶ್ವವಿದ್ಯಾಲಯ ಮೂಲಗಳು (KSNUAHS ಶಿವಮೊಗ್ಗ, UAS ಧಾರವಾಡ, ICAR)
```

---

## 🌾 Supported Crops & Agronomic Intents

### 1. The 4 Target Crops

| Crop | Botanical Name | Kannada Name | Major Agro-Climatic Zones in Karnataka |
| :--- | :--- | :--- | :--- |
| 🥜 **Groundnut** | *Arachis hypogaea* | **ಶೇಂಗಾ / ಕಡಲೆಕಾಯಿ** | Northern Dry Zone, Southern Dry Zone, Central Dry Zone |
| 🌾 **Rice / Paddy** | *Oryza sativa* | **ಭತ್ತ** | Coastal Zone, Hilly Zone, Southern Transitional Zone, Tungabhadra Command |
| 🌽 **Maize** | *Zea mays* | **ಮೆಕ್ಕೆಜೋಳ** | Northern Transitional Zone, Central Dry Zone, Southern Dry Zone |
| 🌴 **Arecanut** | *Areca catechu* | **ಅಡಿಕೆ** | Malnad / Hilly Zone, Coastal Zone, Southern Transitional Zone |

---

### 2. The 5 Core Agronomic Intents

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     5 CORE CULTIVATION INTENTS                          │
├──────────────────┬──────────────────────────────────────────────────────┤
│ 1. Crop          │ Land prep, recommended varieties (TMV-2, Jyothi,     │
│    Production    │ NK-6240, Mangala), seed rate, seed treatment,        │
│                  │ spacing, sowing windows, intercropping systems.      │
├──────────────────┼──────────────────────────────────────────────────────┤
│ 2. Soil &        │ NPK split schedules, basal vs top-dressing, FYM/     │
│    Nutrient      │ organic manure, gypsum application, micronutrients   │
│    Management    │ (Zinc, Boron), soil pH correction, biofertilizers.   │
├──────────────────┼──────────────────────────────────────────────────────┤
│ 3. Pest &        │ Economic Threshold Levels (ETL), symptom diagnosis,  │
│    Disease       │ biological controls (Trichoderma, NPV, NSKE 5%),     │
│    Management    │ CIBRC-approved chemical formulations, spray PPE.     │
├──────────────────┼──────────────────────────────────────────────────────┤
│ 4. Irrigation &  │ Critical growth stages (flowering, pegging, silking),│
│    Water         │ Alternate Wetting & Drying (AWD), drip scheduling,   │
│    Management    │ drainage during waterlogging, drought mitigation.    │
├──────────────────┼──────────────────────────────────────────────────────┤
│ 5. Harvest &     │ Physiological maturity indices, harvesting moisture, │
│    Post-Harvest  │ threshing, drying guidelines, hermetic bag storage,   │
│                  │ aflatoxin / storage pest prevention (Warehouse tips).│
└──────────────────┴──────────────────────────────────────────────────────┘
```

---

## 🌦️ IMD Agromet 5-Day Weather Advisory Engine

Sahyadri features an embedded **Agrometeorological Advisory System** built upon official **India Meteorological Department (IMD)** forecast formats and agromet datasets covering **all 31 districts and 193+ block series of Karnataka**.

### Forecast Parameters Tracked:
- 🌧️ **Rainfall (mm)**
- 🌡️ **Maximum & Minimum Temperatures (°C)**
- 💧 **Morning (RH-I) & Afternoon (RH-II) Relative Humidity (%)**
- 💨 **Wind Speed (km/h) & Wind Direction (16-point Compass)**
- ☁️ **Cloud Cover (Octas)**
- ⚠️ **IMD Weather Warnings & Heavy Rain Alerts**

### 🛡️ Smart Spray Window Advisory:
The engine assesses weather parameters against scientific spraying thresholds:
- ✅ **Optimal**: Rainfall $< 2\text{ mm}$, Wind Speed $5\text{–}10\text{ km/h}$, Temperature $< 32^\circ\text{C}$, Morning (6:30–9:00 AM) or Late Afternoon (4:30–6:30 PM).
- ⚠️ **Caution / Unfavorable**: Rainfall $> 5\text{ mm}$, Wind $> 15\text{ km/h}$ (drift hazard), Rain forecast within 6 hours, Extreme midday heat.

---

## 🚜 Farm Context & Personalization System

Farmers and field agents can customize the **Farm Profile** via the interactive context drawer to receive hyper-localized recommendations:

```
[ Farm Profile Drawer ]
  ├── District & Taluk: (e.g., Shivamogga → Thirthahalli / Chitradurga → Hiriyur / Dharwad → Navalgund)
  ├── Agro-Climatic Zone: (Coastal, Hilly/Malnad, Northern Dry, Central Dry, Southern Transitional)
  ├── Cultivation Season: (Kharif, Rabi, Summer)
  ├── Selected Variety: (e.g., Groundnut: TMV-2, GPBD-4 | Rice: Jyothi, BPT-5204 | Maize: NK-6240 | Arecanut: Mohitnagar)
  └── Soil Type: (Red Sandy Loam, Black Clay/Vertisol, Laterite Soil, Alluvial Soil)
```

---

## 🏛️ System Architecture & Multi-Model RAG Pipeline

```
                               ┌────────────────────────┐
                               │  Farmer / User Query   │
                               │  (English or ಕನ್ನಡ)    │
                               └───────────┬────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │     React 19 + Vite + Tailwind UI      │
                       │  - Language Selector (EN / KN)         │
                       │  - 4-Crop Ribbon & Prompt Library      │
                       │  - Farm Context (District/Soil/Season) │
                       │  - Professional Justified Typography   │
                       └───────────────────┬────────────────────┘
                                           │ POST /api/chat
                                           ▼
                       ┌────────────────────────────────────────┐
                       │    Express + TypeScript Backend API    │
                       ├────────────────────────────────────────┤
                       │ 1. Language Detector (Unicode Regex)   │
                       │ 2. Crop Detector (Aliases & Context)   │
                       │ 3. Intent & Stage Classifier           │
                       │ 4. Domain Query Rewriter               │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │     TF-IDF Vector Retrieval Engine     │
                       ├────────────────────────────────────────┤
                       │ Multi-Factor Weighted Scoring:         │
                       │  • Base TF-IDF Cosine Match            │
                       │  • Crop Match Boost (2.5x)             │
                       │  • Intent Match Boost (1.8x)           │
                       │  • Karnataka Authority Boost (1.3x)    │
                       │  • Farm Context Soil/Zone Alignment    │
                       │ => Retrieves Top-K Chunk Excerpts      │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │    Multi-Model LLM Failover Ladder     │
                       ├────────────────────────────────────────┤
                       │  1. gemini-2.5-flash-lite (Primary)    │
                       │  2. gemini-3.1-flash-lite (Fallback 1) │
                       │  3. gemini-2.5-flash      (Fallback 2) │
                       │  4. gemini-3-flash-preview(Fallback 3) │
                       │  5. gemini-3.7-flash      (Fallback 4) │
                       │  6. Smart Stage-Aware Offline Engine   │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │      Citation & Confidence Engine      │
                       ├────────────────────────────────────────┤
                       │ • Resolves inline [1], [2] to sources  │
                       │ • Formats Collapsible Source Cards     │
                       │ • Generates Warning & PPE Badges       │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │       Academic Report UI Render        │
                       │ • Sharp Black Text (#000000)           │
                       │ • Full Text Justification              │
                       │ • Highlighted Bold Values & Doses      │
                       │ • Collapsible Sources [SHOW ▼/HIDE ▲]  │
                       │ • IMD Weather Advisory & Alert Cards   │
                       └────────────────────────────────────────┘
```

---

## 🎨 Professional Report UI & Typography Standards

The chatbot interface adheres to academic publishing and extension report aesthetics:

| Element | Specification | Visual Benefit |
| :--- | :--- | :--- |
| **Text Color** | **Sharp Deep Black (`#000000`)** | High contrast, crisp legibility in outdoor and bright mobile environments. |
| **Alignment** | **Full Justification (`text-justify`)** | Publication-style alignment (`text-justify: inter-word`). |
| **Line Height** | **`1.45–1.5` (`leading-report`)** | Optimal reading rhythm without crowding. |
| **Font Family** | **Aptos, Segoe UI, Inter, Times New Roman, Noto Sans Kannada** | Clean, modern sans-serif body with bilingual Kannada support. |
| **Bold Values** | **Colored Highlight Badges** | Active ingredients, dosages (`@ 0.6 g/L`, `500 kg/ha`), and timings (`6:30–9:00 AM`) rendered in distinct badges (`text-[#166534] bg-[#ECFDF5]`). |
| **Sources Section** | **Collapsible Accordion (`[SHOW ▼]`)** | Keeps answers concise while providing full source transparency upon one click. |
| **Farmer Warning** | **`⚠️ Important Message for Farmer`** | Prominent amber-orange alert container for critical field precautions. |

---

## 📚 Knowledge Base & Institutional Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INSTITUTIONAL TRUST HIERARCHY                         │
├────────┬─────────────────┬──────────────────────────────────┬───────────────┤
│ Tier   │ Category        │ Key Institutions                 │ Weight Boost  │
├────────┼─────────────────┼──────────────────────────────────┼───────────────┤
│ Tier 1 │ National ICAR   │ • ICAR-IIGR (Groundnut)          │ Primary Apex  │
│        │ Research        │ • ICAR-IIRR / ICAR-NRRI (Rice)   │ Standard      │
│        │ Institutes      │ • ICAR-IIMR (Maize)              │               │
│        │                 │ • ICAR-CPCRI (Arecanut)          │               │
├────────┼─────────────────┼──────────────────────────────────┼───────────────┤
│ Tier 2 │ Karnataka State │ • KSNUAHS Shivamogga (AMFU)      │ +30% Regional │
│        │ Agricultural    │ • UAS Dharwad (Karnataka PoP)    │ Priority      │
│        │ Universities    │ • UAS Bengaluru (GKVK)           │ Boost         │
│        │ (SAUs)          │ • UAS Raichur                    │               │
├────────┼─────────────────┼──────────────────────────────────┼───────────────┤
│ Tier 3 │ Agromet & IMD   │ • IMD Agromet Advisory Service   │ Weather       │
│        │ Bulletins       │ • District Agromet Units (DAMU)  │ Priority      │
├────────┼─────────────────┼──────────────────────────────────┼───────────────┤
│ Tier 4 │ Government &    │ • Vikaspedia Agriculture         │ Baseline      │
│        │ Extension       │ • Karnataka State Dept of Agri   │ Context       │
└────────┴─────────────────┴──────────────────────────────────┴───────────────┘
```

---

## ⚙️ Backend Services & Code Structure

| Service File | Responsibility |
| :--- | :--- |
| [`backend/src/server.ts`](backend/src/server.ts) | Express server configuration, CORS, rate limits, health checks. |
| [`backend/src/routes/chat.ts`](backend/src/routes/chat.ts) | Route handlers for `/api/chat`, `/api/weather`, `/api/crops`, `/api/sources`. |
| [`backend/src/services/rag.ts`](backend/src/services/rag.ts) | Main RAG pipeline orchestrator; coordinates intent detection, retrieval, LLM synthesis, and citations. |
| [`backend/src/services/cropDetect.ts`](backend/src/services/cropDetect.ts) | Kannada/English language detection, crop entity extraction, intent classification. |
| [`backend/src/services/retrieval.ts`](backend/src/services/retrieval.ts) | In-memory TF-IDF indexer, multi-factor ranking algorithm, context formatting. |
| [`backend/src/services/weather.ts`](backend/src/services/weather.ts) | Karnataka district/block weather loader (193 series), IMD bulletin generator, spray-window evaluation. |
| [`backend/src/services/llm.ts`](backend/src/services/llm.ts) | Multi-model Gemini failover ladder, OpenAI fallback, and dynamic offline mock engine. |
| [`backend/src/prompts/agricultural.ts`](backend/src/prompts/agricultural.ts) | Agronomist system prompts with strict stage-specific rules and weather integration. |
| [`backend/src/services/citations.ts`](backend/src/services/citations.ts) | Inline citation validator, URL resolver, and relevance confidence scoring. |

---

## 📡 REST API Documentation

### 1. Execute RAG Chat Query
- **Endpoint**: `POST /api/chat`
- **Request Body**:
```json
{
  "question": "my crop is at 45 DAS. WHAT ARE THE PEST AND DISEASES?",
  "crop": "groundnut",
  "language": "en",
  "sessionId": "session-12345",
  "farmContext": {
    "district": "Shivamogga",
    "block": "Shivamogga",
    "season": "Kharif",
    "variety": "TMV-2",
    "soil": "Sandy Loam"
  }
}
```
- **Response**:
```json
{
  "answer": "### Diagnosis & Direct Answer\nAt 45 Days After Sowing (DAS), your TMV-2 Groundnut crop in Shivamogga is at the Peak Flowering to Active Peg Penetration & Early Pod Development / Pegging Stage...\n\n### What to do & Recommended Field Operations\n1. **[Core Stage Operation & Higher Yield Priority — Gypsum & Foliar Nutrition at 40–45 DAS]**:\n   - Top-Dress Gypsum @ 500 kg/ha (200 kg/acre)...\n   - Foliar Booster: 2% DAP (20 g/L) + Planofix (0.25 mL/L)...\n2. **[Field & Soil Management]**: Strictly STOP all mechanical hoeing...\n3. **[Pest & Disease Management — 3 Approaches]**:\n   - **Major Pests & Diseases**: Tikka Leaf Spot, Rust, Spodoptera, Leaf Miner, Thrips...\n   - **Chemical Control (PoP 2026)**: Hexaconazole 5% EC @ 1 mL/L, Chlorantraniliprole 18.5% SC @ 0.3 mL/L...\n   - **Biological & Organic Control**: Pseudomonas fluorescens @ 10 g/L, Nomuraea rileyi @ 2 kg/ha, NSKE 5%...\n   - **IPM & Cultural Practices**: 4–5 Spodoptera pheromone traps/acre, 10–12 yellow sticky traps...\n\n### 🌦️ IMD Agromet 5-Day Weather-Based Advisory\n1. **[Question-Specific Weather Advisory]**: With 34.6 mm cumulative rainfall...\n2. **[Field Operation / Spray Window]**: Morning window (6:30–9:00 AM) under wind <8 km/h...\n3. **[Micro-Climate & Agronomic Risk Alert]**: High humidity (>85%) triggers Tikka risk...\n\n### ⚠️ Important Message for Farmer\nStrictly avoid mechanical hoeing from 45 DAS onwards...\n\n### Sources\n[1] KSNUAHS Shivamogga — Groundnut PoP 2026\n    https://uahs.edu.in/\n[2] ICAR-IIGR Directorate of Groundnut Research\n    https://www.icar-iigr.org.in/",
  "crop": "groundnut",
  "intent": "pest_disease",
  "language": "en",
  "provider": "gemini",
  "citations": [
    {
      "id": 1,
      "title": "KSNUAHS Shivamogga — PoP 2026",
      "url": "https://uahs.edu.in/",
      "sourceId": "ksnuahs",
      "relevance": 0.98
    },
    {
      "id": 2,
      "title": "ICAR-IIGR Directorate of Groundnut Research",
      "url": "https://www.icar-iigr.org.in/",
      "sourceId": "icar",
      "relevance": 0.95
    }
  ]
}
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Operating System**: Windows, macOS, or Linux

---

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Choose Provider: 'gemini' | 'openai' | 'mock'
LLM_PROVIDER=gemini

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite

# OpenAI (Optional Fallback)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

---

### 3. Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

### 4. Running the Application

#### Option A: One-Click Startup (Windows)
Double-click [`run_sahyadri.bat`](run_sahyadri.bat) or run from PowerShell:
```cmd
.\run_sahyadri.bat
```

#### Option B: Manual Startup
```bash
# Terminal 1: Backend API (Port 3001)
cd backend && npm run dev

# Terminal 2: Frontend App (Port 5173)
cd frontend && npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Automated Testing Suite

The project includes an automated test runner validating **all 4 crops across all 5 intents, Kannada queries, and multi-model failover**:

```bash
cd backend
npm test
```

### Test Coverage Checklist (22 / 22 Passed — 100%):
- [x] **Groundnut**: Seed rate, Gypsum timing at 30 DAS, Tikka disease control, Irrigation stages, Harvest indicators.
- [x] **Rice / Paddy**: Nursery area, NPK schedule (Jyothi), Blast management, AWD irrigation, Harvest moisture.
- [x] **Maize**: Sowing spacing, Split nitrogen doses, FAW biological control, Water stress, Black layer maturity.
- [x] **Arecanut**: Spacing/Pits, Bearing palm NPK fertilizer, Koleroga (fruit rot) control, Summer water requirement, Green chali vs red harvest.
- [x] **Kannada NLP**: Parsing of `ಅಡಿಕೆಯಲ್ಲಿ ಕೊಳೆರೋಗವನ್ನು ಹೇಗೆ ನಿಯಂತ್ರಿಸಬೇಕು?`.
- [x] **Out-of-Scope Safety**: Safe refusal and guidance redirection for non-supported crops (e.g., Sugarcane).
- [x] **Multi-Model Failover**: Seamless rate-limit failover across Gemini models.

---

## 🛡️ Agricultural Safety & Ethics Guardrails

1. **Anti-Hallucination Policy**: Chemical doses (e.g., Tricyclazole, Carbendazim, Hexaconazole, Mancozeb) are strictly bound to Central Insecticides Board & Registration Committee (CIBRC) and Karnataka SAU Package of Practices.
2. **Integrated Pest Management (IPM) First**: Non-chemical controls (cultural, mechanical, biological like *Trichoderma harzianum*, *Pseudomonas fluorescens*, NPV, NSKE 5%) are prioritized before chemical intervention.
3. **Mandatory PPE & Safety Cautions**: Every chemical recommendation includes personal protective equipment (PPE) warnings, waiting periods (pre-harvest intervals - PHI), and safe spray window precautions.
4. **Emergency KVK Escalation**: Queries involving unconfirmed symptoms or severe outbreaks trigger an automatic referral to the nearest **Krishi Vigyan Kendra (KVK)** or agricultural extension officer.

---

## 📂 Project Directory Layout

```
sahyadri-chatbot/
├── .env                              # Environment configuration
├── package.json                      # Workspace root scripts
├── run_sahyadri.bat                  # Windows one-click dual launcher
├── Weather.xls                       # Raw Karnataka Agromet forecast dataset
│
├── backend/                          # Express + TypeScript Backend
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts                 # App entry point & middleware
│       ├── routes/
│       │   └── chat.ts               # /api/chat, /api/weather, /api/crops
│       ├── services/
│       │   ├── rag.ts                # RAG orchestrator pipeline
│       │   ├── retrieval.ts          # TF-IDF index & weighted ranking
│       │   ├── cropDetect.ts         # Intent, crop, & language parser
│       │   ├── llm.ts                # Multi-model Gemini failover ladder
│       │   ├── weather.ts            # IMD agromet bulletin & spray engine
│       │   └── citations.ts          # Citation matching & trust score
│       ├── prompts/
│       │   └── agricultural.ts       # Agronomist system prompts
│       ├── data/
│       │   ├── sources.ts            # Authority registry & metadata
│       │   ├── chemical_management.csv # Chemical database
│       │   ├── biocontrol_database.csv # Biological control database
│       │   └── ipm_database.csv      # IPM database
│       └── test/
│           ├── run_tests.ts          # 22-case automated test suite
│           └── test_user_query.ts    # Live stage & weather verification
│
├── frontend/                         # React 19 + Vite + Tailwind CSS
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── App.tsx                   # Root application component
│       ├── index.css                 # Typography & justified report styles
│       ├── components/
│       │   ├── ChatUI.tsx            # Main chat feed & navigation
│       │   ├── ChatMessage.tsx       # Sharp black justified report card
│       │   ├── ChatInput.tsx         # Multilingual input box
│       │   ├── CropSelector.tsx      # 4-crop switch ribbon
│       │   ├── FarmContextSelector.tsx # 31-district farm profile drawer
│       │   ├── WeatherInfoBox.tsx    # 5-day weather forecast modal
│       │   ├── PromptLibrary.tsx     # One-click question library
│       │   ├── SourceCard.tsx        # Institutional source card
│       │   └── SourceList.tsx        # Expandable citation drawer
│       └── services/
│           └── api.ts                # Axios client for backend API
│
└── knowledge_base/                   # Curated University & ICAR Docs
    ├── groundnut/                    # PoP UAS Dharwad, ICAR-IIGR guides
    ├── rice/                         # PoP UAS Bengaluru/Dharwad, ICAR-NRRI
    ├── maize/                        # PoP UAS Raichur, ICAR-IIMR FAW guides
    └── arecanut/                     # ICAR-CPCRI, KSNUAHS Shivamogga guides
```

---

## 📄 License & Acknowledgements

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### Acknowledgements & Data Sources:
- **ICAR**: Indian Council of Agricultural Research (ICAR-IIGR, ICAR-IIRR, ICAR-NRRI, ICAR-IIMR, ICAR-CPCRI)
- **Karnataka State Agricultural Universities**: KSNUAHS Shivamogga, UAS Dharwad, UAS Bengaluru (GKVK), UAS Raichur
- **India Meteorological Department (IMD)**: Agromet Advisory Services Division & MC Bengaluru
