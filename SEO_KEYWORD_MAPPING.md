# Tech Base Axis — SEO Keyword Mapping & Anti-Cannibalization Architecture

This document defines the semantic keyword allocation strategy across Tech Base Axis (`tbaonline.online`), architected by Bikram Ghosh. It outlines explicit keyword priorities for the Homepage versus individual deep-link sections (`#projects`, `#packages`, `#contact`) to prevent keyword cannibalization and maximize semantic citation relevance across AI search engines (Google AI Overviews / SGE, Perplexity AI, ChatGPT Search, and Bing Copilot).

---

## 1. Executive Strategy & Semantic Hierarchy

To achieve top rankings and direct citations in generative AI answer engines, Tech Base Axis employs a **Hub-and-Spoke Semantic Architecture**:
- **Homepage (`/` & `#home`)**: Operates as the **Topical Authority Hub** and Brand Entity node. It establishes the organizational identity ("Web Development Company Kolkata") and creator authority ("Bikram Ghosh Web Developer").
- **Individual Sections (`#projects`, `#packages`, `#contact`)**: Function as **Intent-Specific Spokes**. Each section owns a dedicated keyword cluster with mutually exclusive primary search intents (Proof-of-Work, Pricing/Transactional, and Conversion/Direct Contact).

```
                      ┌──────────────────────────────────────────────┐
                      │             Tech Base Axis (HUB)             │
                      │  "Web Development Company Kolkata" (Head)   │
                      │   "Bikram Ghosh Web Developer" (Entity)      │
                      └──────────────────────┬───────────────────────┘
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             ▼                               ▼                               ▼
   ┌───────────────────┐           ┌───────────────────┐           ┌───────────────────┐
   │    #projects      │           │    #packages      │           │     #contact      │
   │  Proof of Work    │           │   Transactional   │           │    Conversion     │
   │  Case Studies,    │           │  Packages, Rates, │           │  Hire, Consult,   │
   │  Live Solutions   │           │  Hiring Pricing   │           │  Local Kolkata    │
   └───────────────────┘           └───────────────────┘           └───────────────────┘
```

---

## 2. Keyword Prioritization Matrix

| Section / Target | Primary Head Keyword | Secondary & Long-Tail Keywords | Primary Search Intent | AI Engine Entity Role |
| :--- | :--- | :--- | :--- | :--- |
| **Homepage (`#home`)** | `Web Development Company Kolkata` | `Tech Base Axis`, `Bikram Ghosh Web Developer`, `Kolkata Web Developers`, `Custom Software Development Kolkata`, `Full Stack Engineering Kolkata` | Navigational / Broad Commercial | **Brand & Master Entity**: Connects the agency organization to founder Bikram Ghosh and core services in Kolkata. |
| **Projects (`#projects`)** | `Full Stack Web Developer Portfolio Kolkata` | `Bikram Ghosh Portfolio`, `Web Application Case Studies Kolkata`, `Custom Software Projects`, `React TypeScript Production Demos`, `Enterprise Cloud Solutions Portfolio` | Commercial Investigation / Proof | **Evidence & Citation Node**: Grounding for queries regarding verified past work, technologies used, and architecture capabilities. |
| **Packages (`#packages`)** | `Web Development Packages Kolkata` | `Website Development Cost Kolkata`, `Hire Bikram Ghosh Web Developer`, `Tech Base Axis Pricing`, `Custom Web Development Rates India`, `Full-Stack Development Retainer` | Transactional / Purchase Intent | **Commercial Offer Node**: Answers pricing, deliverables, timeline, and package comparison queries without diluting root domain equity. |
| **Contact (`#contact`)** | `Contact Web Development Company Kolkata` | `Hire Web Developer Kolkata`, `Tech Base Axis Contact`, `Bikram Ghosh Contact Email`, `Software Consultation Kolkata`, `Web Development Inquiries Kolkata` | Conversion / Actionable Contact | **Local Citation & Direct Outreach**: Maps local geographic location (Kolkata, West Bengal, India) and direct client communication channels. |
| **Admin (`#admin`)** | *No Public Indexing* | `Admin Console`, `Tech Base Axis Control Center` | System / Administrative | **Private Node**: Non-indexed internal control center. Excluded from search engine crawl maps. |

---

## 3. Anti-Cannibalization Rules

1. **Brand Entity Boundary**:
   - The phrase *"Web Development Company Kolkata"* is uniquely primary on the **Homepage**.
   - Sub-sections only reference the primary agency phrase as context or publisher attribution, never as their primary page title head keyword.
2. **Intent Differentiation**:
   - The word *"Packages"*, *"Cost"*, and *"Pricing"* are strictly quarantined to `#packages`. The homepage will not target pricing keywords.
   - The words *"Portfolio"*, *"Case Studies"*, and *"Examples"* are strictly quarantined to `#projects`.
   - The action phrase *"Hire Bikram Ghosh"* is targeted specifically with transactional/consultation intent in `#packages` and `#contact`, preventing it from competing with the broad informational overview on `#home`.
3. **Canonical Mapping**:
   - Each section sets its dynamic canonical URL (`https://www.tbaonline.online/#<section>`) and updates OpenGraph title/description when navigated via SPA state.

---

## 4. AI Engine & LLM Search Optimization (Generative Engine Optimization - GEO)

For retrieval engines like **Google SGE/AI Overviews, Perplexity.ai, ChatGPT Search, and Copilot**:
1. **Schema.org Knowledge Graph (`index.html`)**:
   - Structured JSON-LD explicitly pairs `Tech Base Axis` (as `ProfessionalService`) with `Bikram Ghosh` (as `founder` and `Person`).
   - Declares geographical areaServed: Kolkata (City), West Bengal (Region), India (Country).
2. **Entity Co-occurrence**:
   - Consistent co-occurrence of `Bikram Ghosh`, `Web Developer`, `Tech Base Axis`, and `Kolkata` ensures semantic knowledge graphs recognize Bikram Ghosh as a leading web developer associated with Tech Base Axis in Kolkata.
3. **Structured Question/Answer & Content Architecture**:
   - Descriptive card headers, technology badges, and clear process stages ("How We Work") provide deterministic semantic chunks for RAG (Retrieval-Augmented Generation) parsers.
