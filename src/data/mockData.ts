import { Project, ServicePackage, ClientInquiry, ArchitectureSkill } from '../types';

export const FOUNDER_INFO = {
  name: "Bikram Ghosh",
  role: "Principal Full-Stack Architect & Founder",
  agency: "Tech Base Axis",
  email: "techbaseaxis@gmail.com",
  whatsapp: "+91 94772 01106",
  whatsappRaw: "919477201106",
  instagramUrl: "https://www.instagram.com/bik.ram737?stkn=NjJ5NmhneXhlc3Vx",
  facebookUrl: "https://www.facebook.com/share/14k5nbF6FpS/",
  linkedinUrl: "https://www.linkedin.com/in/tech-base-axis-b19b30411",
  location: "Global & Hybrid Remote",
  availability: "Available for Q3/Q4 2026 Architecture Engagements",
  tagline: "Engineering Obsidian-Grade Web Applications & Scalable Cloud Ecosystems",
  bio: "Senior technical engineer and system architect with over 6 years of expertise building resilient distributed systems, enterprise SaaS solutions, AI-integrated workflows, and responsive high-performance web applications under the Tech Base Axis banner."
};

export const PROJECTS_DATA: Project[] = [
  {
    id: "omniflow-os",
    title: "OmniFlow Cloud OS",
    subtitle: "Distributed Multi-Tenant Workflow & Pipeline Orchestrator",
    category: "Cloud & Infra",
    description: "Enterprise-grade orchestration engine handling concurrent task graphs, asynchronous job queues, and dynamic node dispatch with zero-latency telemetry.",
    fullOverview: "OmniFlow Cloud OS was built to address large-scale data synchronization across heterogeneous cloud environments. Featuring an event-driven microservices architecture with Kafka-backed messaging, Redis cluster caching, and automated failover mechanics.",
    architectureHighlights: [
      "Sub-20ms distributed consensus using Raft-based state machine replication",
      "Dynamic worker pool auto-scaling based on real-time queue depth and CPU pressure",
      "Comprehensive telemetry dashboard with live WebSocket stream visualization",
      "End-to-end tenant isolation with cryptographically verified multi-tenancy"
    ],
    techStack: ["TypeScript", "Node.js", "React 19", "PostgreSQL", "Kafka", "Docker", "GCP"],
    metrics: [
      { label: "Daily Transactions", value: "4.2M+" },
      { label: "P99 Dispatch Latency", value: "<18ms" },
      { label: "Uptime SLA", value: "99.99%" }
    ],
    featured: true,
    year: "2026",
    status: "Production",
    demoUrl: "https://omniflow.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/omniflow-cloud-os"
  },
  {
    id: "aether-neural-copilot",
    title: "Aether AI Neural Copilot",
    subtitle: "Server-Side Enterprise Intelligence & Document Reasoning Engine",
    category: "AI & Intelligence",
    description: "Multi-modal contextual reasoning engine utilizing state-of-the-art LLMs, hybrid vector search, and structured schema extraction for institutional clients.",
    fullOverview: "Aether AI integrates enterprise knowledge bases with advanced generative AI. It constructs high-dimensional vector embeddings with HNSW indexing, executing retrieval-augmented generation with strict role-based data boundaries.",
    architectureHighlights: [
      "Hybrid dense-sparse retrieval combining vector similarity with BM25 keyword matching",
      "Streaming SSE (Server-Sent Events) pipeline delivering token generation under 120ms first-token latency",
      "Auditable reasoning trace logs with strict hallucination-prevention validation fences",
      "Client-side zero-knowledge caching keeping sensitive corporate queries fully ephemeral"
    ],
    techStack: ["Python FastAPI", "React 19", "Gemini API", "Pinecone", "Tailwind CSS", "Redis"],
    metrics: [
      { label: "Document Ingestion", value: "250k+ Docs" },
      { label: "Reasoning Accuracy", value: "98.4%" },
      { label: "First Token Time", value: "115ms" }
    ],
    featured: true,
    year: "2026",
    status: "Production",
    demoUrl: "https://aether.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/aether-neural-copilot"
  },
  {
    id: "nexuspay-core",
    title: "NexusPay Core Engine",
    subtitle: "High-Throughput Global Financial Routing & Double-Entry Ledger",
    category: "Fintech & Web3",
    description: "Fintech ledger and payment switch with immutable transactional integrity, automated multi-currency reconciliation, and PCI-DSS compliant vaulting.",
    fullOverview: "Designed for international cross-border settlements, NexusPay Core implements an immutable double-entry bookkeeping ledger guaranteeing strict ACID compliance and idempotent payment processing.",
    architectureHighlights: [
      "Strict double-entry ledger database schema preventing phantom ledger drift",
      "Smart payment routing engine optimizing gateway fee margins by up to 14.2%",
      "Automated webhook retry backoff with dead-letter queue inspection tools",
      "Zero-trust API gateway with mutual TLS and cryptographic signature verification"
    ],
    techStack: ["Node.js", "Express", "TypeScript", "PostgreSQL", "Tailwind CSS", "Docker"],
    metrics: [
      { label: "Processed Volume", value: "₹38M+" },
      { label: "Settlement Success", value: "99.98%" },
      { label: "Reconciliation", value: "Real-time" }
    ],
    featured: true,
    year: "2025",
    status: "Enterprise Client",
    demoUrl: "https://nexuspay.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/nexuspay-core"
  },
  {
    id: "zenith-logistics-matrix",
    title: "Zenith Logistics Matrix",
    subtitle: "Real-Time Fleet Telemetry & Automated Route Optimization Hub",
    category: "Full-Stack SaaS",
    description: "Fleet tracking ecosystem processing continuous GPS beacons, dynamic geo-fencing triggers, and multi-stop algorithmic delivery route computation.",
    fullOverview: "Zenith Logistics Matrix serves courier fleets by calculating optimal TSP (Traveling Salesperson) routing in real-time, factoring in live traffic density, driver shift hours, and vehicle payload limits.",
    architectureHighlights: [
      "High-frequency WebSocket channels handling up to 15,000 concurrent GPS vehicle pings",
      "Spatial queries powered by PostGIS geo-indexes for millisecond geofence breaches",
      "Adaptive offline-first mobile companion app with bi-directional sync upon reconnect",
      "Interactive map visualizer utilizing vector tiling and heat-map clustering"
    ],
    techStack: ["React 19", "Node.js", "PostGIS", "WebSockets", "MapLibre", "Tailwind CSS"],
    metrics: [
      { label: "Active Fleets", value: "1,200+" },
      { label: "Fuel Cost Saved", value: "22%" },
      { label: "Telemetry Latency", value: "<45ms" }
    ],
    featured: false,
    year: "2025",
    status: "Active Deployment",
    demoUrl: "https://zenith.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/zenith-logistics"
  },
  {
    id: "axis-obsidian-ds",
    title: "Axis Obsidian Design System",
    subtitle: "High-Performance Dark-Themed UI System for Data-Dense Platforms",
    category: "Full-Stack SaaS",
    description: "Accessible, zero-runtime overhead component library engineered specifically for fintech dashboards, developer tools, and operational telemetry displays.",
    fullOverview: "A meticulous component ecosystem prioritizing optical hierarchy, mathematically calibrated border radii, high-contrast dark neutrals, and keyboard-first accessibility.",
    architectureHighlights: [
      "WAI-ARIA compliance with full keyboard navigation and screen reader live regions",
      "Micro-animations powered by hardware-accelerated transforms and motion spring physics",
      "Design tokens calibrated for true deep obsidian contrast (#090a0f to #1e293b)",
      "Zero bundle-size inflation with tree-shakable modular component exports"
    ],
    techStack: ["React 19", "TypeScript", "Tailwind CSS v4", "Motion", "Radix Primitives"],
    metrics: [
      { label: "Component Count", value: "65+" },
      { label: "Lighthouse Score", value: "100/100" },
      { label: "Bundle Size", value: "8.4 kB" }
    ],
    featured: true,
    year: "2026",
    status: "Production",
    demoUrl: "https://obsidian.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/axis-obsidian"
  },
  {
    id: "cryptopulse-terminal",
    title: "CryptoPulse Terminal",
    subtitle: "Low-Latency Market Analytics & Algorithmic Order Flow Visualizer",
    category: "Fintech & Web3",
    description: "Financial terminal charting multi-exchange order books, live depth charts, liquidation heatmaps, and custom algorithmic trend signals.",
    fullOverview: "CryptoPulse was designed for pro traders needing milliseconds-ahead market clarity. Built with custom WebGL canvas charts that render 60 FPS order book depth without browser thread lock.",
    architectureHighlights: [
      "Dual WebSocket multiplexer coalescing Binance, Coinbase, and Bybit order books",
      "OffscreenCanvas rendering engine capable of displaying 500,000 tick updates per minute",
      "Local browser memory buffer with instant client-side technical indicator calculations",
      "Audible audio alerts and push notifications for user-configured volatility thresholds"
    ],
    techStack: ["TypeScript", "React 19", "HTML5 Canvas", "Tailwind CSS", "WebSockets"],
    metrics: [
      { label: "Tick Processing", value: "50k/sec" },
      { label: "Frame Rate", value: "Solid 60 FPS" },
      { label: "Memory Footprint", value: "<40 MB" }
    ],
    featured: false,
    year: "2025",
    status: "Production",
    demoUrl: "https://cryptopulse.techbaseaxis.io",
    githubUrl: "https://github.com/techbaseaxis/cryptopulse-terminal"
  }
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  // --- Monthly Maintenance Packages ---
  {
    id: 'monthly-basic',
    name: 'Basic Maintenance',
    badge: 'Starter Care',
    theme: 'green',
    price: 1499,
    period: '/month',
    cycle: 'monthly',
    description: 'Essential monitoring, security patches & routine bug fixes to keep your website and systems healthy',
    turnaround: 'Instant Onboarding',
    idealFor: 'Small businesses, portfolio sites & landing pages',
    popular: false,
    features: [
      { text: '24/7 Uptime & Server Health Monitoring', included: true },
      { text: 'Core Security Patches & Dependency Updates', included: true },
      { text: 'Automated Weekly Cloud Backups', included: true },
      { text: '5 Minor UI & Content Tweaks per month', included: true },
      { text: 'Email & Ticket Technical Support', included: true },
      { text: 'Guaranteed 1-Hour SLA Emergency Hotline', included: false },
      { text: 'Direct WhatsApp Hotline with Bikram Ghosh', included: false }
    ],
    deliverables: [
      'Monthly Health & Security Audit Report',
      'Automated Disaster Recovery Backup Vault',
      'Zero-Downtime Package & Dependency Updates'
    ],
    techStack: ['Cloud Health', 'SSL / Security', 'Node.js', 'React 19', 'Automated Backups']
  },
  {
    id: 'monthly-standard',
    name: 'Standard Maintenance',
    badge: 'Most Popular',
    theme: 'blue',
    price: 2999,
    period: '/month',
    cycle: 'monthly',
    description: 'Comprehensive technical upkeep, priority bug resolution & continuous performance tuning for growing apps',
    turnaround: 'Instant Onboarding',
    idealFor: 'Growing businesses, active web platforms & SaaS apps',
    popular: true,
    features: [
      { text: '24/7 Uptime & Server Health Monitoring', included: true },
      { text: 'Core Security Patches & Dependency Updates', included: true },
      { text: 'Automated Daily Cloud Backups & Instant Restore', included: true },
      { text: '15 Minor UI, Bug & Feature Updates per month', included: true },
      { text: 'Priority Bug Resolution (< 6h Response Time)', included: true },
      { text: 'Database Indexing & Query Performance Tuning', included: true },
      { text: 'Dedicated WhatsApp & Chat Support Hotline', included: true }
    ],
    deliverables: [
      'Bi-Weekly Performance & Health Reports',
      'Direct WhatsApp / Slack Technical Hotline',
      'Proactive Vulnerability Scanning & Staging QA',
      'Continuous Database & Cache Optimization'
    ],
    techStack: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'AWS/GCP Cloud']
  },
  {
    id: 'monthly-premium',
    name: 'Premium Maintenance',
    badge: 'Enterprise SLA',
    theme: 'amber',
    price: 5999,
    period: '/month',
    cycle: 'monthly',
    description: 'Enterprise-grade 24/7 SLA maintenance, fractional CTO advisory & zero-day security incident defense',
    turnaround: 'Priority Same-Day Setup',
    idealFor: 'Mission-critical systems, e-commerce & high-traffic platforms',
    popular: false,
    features: [
      { text: '24/7 Uptime & Server Health Monitoring', included: true },
      { text: 'Core Security Patches & Dependency Updates', included: true },
      { text: 'Automated Daily Cloud Backups & Instant Restore', included: true },
      { text: 'Unlimited Minor Bug Fixes & Code Tweaks', included: true },
      { text: 'Guaranteed 1-Hour Urgent SLA Response', included: true },
      { text: 'Direct Hotline & Video Calls with Bikram Ghosh', included: true },
      { text: 'Zero-Day Security Vulnerability Defense', included: true }
    ],
    deliverables: [
      'Dedicated On-Call Senior Systems Architect',
      'Weekly Technical Architecture Review',
      '99.99% Uptime SLA Guarantee & Failover Drills',
      'Comprehensive Cloud Infrastructure Cost Optimization'
    ],
    techStack: ['Enterprise Cloud', 'Kubernetes', 'PostgreSQL HA', 'Redis', 'GCP/AWS', 'Kafka']
  },
  {
    id: "sprint-mvp",
    name: "Rapid MVP Axis",
    badge: "14-Day Delivery",
    price: 1999,
    description: "Turn your core concept into a market-ready, production-deployed web application with auth, database, and pristine UI in just 2 weeks.",
    turnaround: "10 - 14 Business Days",
    idealFor: "Founders, Startups validating market fit, Hackathon projects transitioning to real users",
    features: [
      "Full modern React 19 + Tailwind v4 responsive application",
      "Production Node.js / Express backend with scalable REST API",
      "Database schema design (PostgreSQL / Firestore) with automated migrations",
      "User authentication (Google OAuth, Magic Links, or Email/Password)",
      "Essential dashboard and client workflows",
      "Automated CI/CD deployment on Cloud Run or Vercel",
      "14 days post-launch bug warranty & handoff documentation"
    ],
    deliverables: [
      "100% Full Source Code Ownership & Git Repo",
      "Live Production URL with SSL & Custom Domain Setup",
      "Interactive Architecture & API Documentation",
      "Deployment Scripts & Environment Configuration"
    ],
    techStack: ["React 19", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL / Cloud"]
  },
  {
    id: "growth-architecture",
    name: "Full-Stack Growth Architecture",
    badge: "Most Popular",
    price: 3999,
    popular: true,
    description: "A complete, high-performance web platform with advanced workflows, payment integration, AI capabilities, and scalable cloud infrastructure.",
    turnaround: "3 - 4 Weeks",
    idealFor: "Funded startups, Scaling SaaS products, Businesses replacing legacy portals",
    features: [
      "Everything in Rapid MVP Axis tier",
      "Advanced multi-tenant architecture & Role-Based Access Control (RBAC)",
      "Payment processing integration (Stripe, billing subscriptions & invoices)",
      "AI / LLM features (Gemini reasoning, automated summaries, smart search)",
      "Interactive analytics & operational data charts",
      "Automated transactional email workflows & webhook handling",
      "Comprehensive unit & end-to-end testing coverage",
      "30 days dedicated post-launch support & performance tuning"
    ],
    deliverables: [
      "Complete Production-Grade Repository with CI/CD Pipelines",
      "Stripe Integration & Live Billing Portal",
      "AI Service Layer with Safe API Proxying",
      "Comprehensive Operational Manual & Video Architecture Walkthrough"
    ],
    techStack: ["React 19", "TypeScript", "FastAPI / Node", "PostgreSQL", "Gemini AI", "Stripe", "Redis"]
  },
  {
    id: "enterprise-overhaul",
    name: "Enterprise Scale & Modernization",
    badge: "Maximum Resilience",
    price: 7499,
    description: "Full-scale custom engineering for high-traffic, mission-critical systems requiring strict security audits, microservices, and zero-downtime migrations.",
    turnaround: "6 - 8 Weeks",
    idealFor: "Enterprises, High-volume platforms, FinTech, Logistics, and High-compliance agencies",
    features: [
      "Everything in Full-Stack Growth Architecture tier",
      "Distributed microservices or clean modular monolith architecture",
      "High-throughput caching & message queue implementation (Redis, Kafka)",
      "Database read-replica clustering and sub-50ms query optimization",
      "SOC2 / GDPR compliance readiness & penetration-test remediation",
      "Custom internal admin dashboard with telemetry logs and audit trails",
      "Comprehensive disaster recovery & automated backup configuration",
      "60 days priority 24/7 technical support & SLA guarantee"
    ],
    deliverables: [
      "Enterprise Multi-Service Repository with Infrastructure as Code (IaC)",
      "High-Availability Cloud Architecture Blueprint",
      "Security Hardening Report & Pen-Test Checklist",
      "Dedicated Technical Onboarding & Training Session"
    ],
    techStack: ["Distributed TypeScript/Go", "Kubernetes", "Kafka", "PostgreSQL", "Docker", "GCP/AWS"]
  },
  {
    id: "retainer-cto",
    name: "Fractional CTO & Lead Partner",
    badge: "Monthly Retainer",
    price: 4500,
    period: "month",
    description: "Senior technical leadership, architecture oversight, sprint execution, and priority engineering for companies needing elite technical steering without executive hiring overhead.",
    turnaround: "Ongoing Sprint Cycles",
    idealFor: "Companies seeking a technical co-founder / Lead Architect on demand",
    features: [
      "Weekly strategic architecture review & sprint planning sessions",
      "Direct code commits, PR reviews, and complex feature development",
      "Cloud infrastructure cost optimization (average 30-50% savings)",
      "Hiring guidance, technical candidate interviews, and team mentoring",
      "Direct Slack / WhatsApp channel with Bikram Ghosh",
      "Emergency incident response & zero-day patch handling",
      "Flexible roadmap adjustments with zero long-term lock-in"
    ],
    deliverables: [
      "Weekly Architecture Audit Reports",
      "Direct Codebase Contributions & Refactoring",
      "Cloud Infrastructure Cost-Reduction Plan",
      "Priority Access & Technical Advisory Board Seat"
    ],
    techStack: ["Full Ecosystem", "System Design", "Cloud Optimization", "Engineering Leadership"]
  }
];

export const SKILL_CATEGORIES: ArchitectureSkill[] = [
  {
    category: "Frontend & Interface Engineering",
    iconName: "Layout",
    skills: [
      { name: "React 19 & Next.js", level: "Expert", description: "Server components, Actions, Concurrent mode, state optimization" },
      { name: "TypeScript Core", level: "Expert", description: "Strict type safety, generics, compiler flags, zero-any policy" },
      { name: "Tailwind CSS v4 & Motion", level: "Expert", description: "Ultra-clean micro-interactions, hardware-accelerated animations" },
      { name: "Responsive Architecture", level: "Expert", description: "Fluid mobile-to-ultrawide density scaling, zero visual shift" }
    ]
  },
  {
    category: "Backend, APIs & Cloud",
    iconName: "Server",
    skills: [
      { name: "Node.js & Express / TS", level: "Expert", description: "High-concurrency event loops, stream processing, middleware security" },
      { name: "Python & FastAPI", level: "Advanced", description: "Asynchronous REST endpoints, scientific computing, AI pipelines" },
      { name: "PostgreSQL & NoSQL", level: "Expert", description: "Complex indexing, connection pooling, transactional ACID compliance" },
      { name: "Docker & Cloud Run / AWS", level: "Advanced", description: "Containerized deployments, auto-scaling, reverse proxy routing" }
    ]
  },
  {
    category: "AI, Data & Real-Time",
    iconName: "Cpu",
    skills: [
      { name: "Gemini API & LLM Pipelines", level: "Expert", description: "Context caching, structured JSON extraction, streaming reasoning" },
      { name: "Real-Time WebSockets", level: "Advanced", description: "Bidirectional state sync, low-latency telemetry, reconnection logic" },
      { name: "Redis Caching & Pub/Sub", level: "Expert", description: "In-memory session state, rate limiters, distributed locks" },
      { name: "API Security & OAuth", level: "Expert", description: "JWT rotation, rate limiting, CORS headers, zero-trust sanitization" }
    ]
  }
];

export const DEFAULT_INQUIRIES: ClientInquiry[] = [
  {
    id: "inq-101",
    clientName: "David Sterling",
    email: "david@sterlingventures.io",
    company: "Sterling Ventures",
    projectType: "Full-Stack SaaS",
    budgetRange: "₹10,000 - ₹25,000",
    timeline: "1 Month",
    details: "Looking to build a proprietary venture dealflow and LP analytics dashboard with real-time portfolio tracking and AI summarization of investor memorandums.",
    selectedPackage: "Full-Stack Growth Architecture",
    createdAt: "2026-09-15T14:30:00Z",
    status: "Proposal Sent",
    priority: "High",
    notes: "Client reviewed the Growth Architecture package. Scheduled a follow-up call to review wireframes."
  },
  {
    id: "inq-102",
    clientName: "Elena Rostova",
    email: "elena@vanguardhealth.ai",
    company: "Vanguard Health AI",
    projectType: "AI & Intelligence",
    budgetRange: "₹25,000+",
    timeline: "2-3 Months",
    details: "Need a HIPAA-compliant medical research assistant utilizing private LLM embeddings to parse clinical trials and synthesize pharmacological contraindications.",
    selectedPackage: "Enterprise Scale & Modernization",
    createdAt: "2026-09-14T09:15:00Z",
    status: "Reviewing",
    priority: "Critical",
    notes: "Requires NDA and dedicated BAA infrastructure planning."
  },
  {
    id: "inq-103",
    clientName: "Marcus Chen",
    email: "marcus@velocitylabs.co",
    company: "Velocity Labs",
    projectType: "Rapid MVP",
    budgetRange: "₹3,000 - ₹10,000",
    timeline: "Urgent (< 2 weeks)",
    details: "Need a high-velocity functional MVP for our B2B compliance checker to demo at an upcoming investor summit in Singapore.",
    selectedPackage: "Rapid MVP Axis",
    createdAt: "2026-09-16T08:45:00Z",
    status: "New",
    priority: "High",
    notes: "Just received. High urgency for 14-day delivery sprint."
  }
];

export const TESTIMONIALS = [
  {
    quote: "Bikram engineered our core data pipeline in record time. His attention to system architecture, zero-latency rendering, and backend security is unmatched. Tech Base Axis transformed our tech stack.",
    client: "Sarah Jenkins",
    role: "VP of Product, CloudScale Global",
    project: "OmniFlow Cloud OS Integration"
  },
  {
    quote: "Working with Bikram on the NexusPay ledger was effortless. He has a rare blend of deep low-level engineering mastery and modern obsidian-grade interface design. Production deployment went live without a single hitch.",
    client: "Alexander Vance",
    role: "Co-Founder & CTO, Nexus FinTech",
    project: "NexusPay Core Engine"
  },
  {
    quote: "The Full-Stack Growth Architecture package exceeded our expectations. In 3 weeks, we went from raw requirements to an enterprise-ready platform that secured our pre-seed round. Truly best in class.",
    client: "Tanya Morales",
    role: "Founder, Aether Labs",
    project: "Aether AI Copilot"
  }
];

export const EDUCATION_DATA = [
  {
    institution: "Techno India Institute of Technology",
    degree: "B.Tech in Computer Science & Engineering",
    period: "2017 - 2021",
    location: "Kolkata, WB",
    honors: "First Class Distinction",
    description: "Rigorous specialization in distributed systems, memory optimization, low-level data structures, and computer networking protocols."
  },
  {
    institution: "Advanced Cloud & Systems Academy",
    degree: "Cloud Architecture & Scalable Systems Specialization",
    period: "2021 - 2023",
    location: "Global Remote",
    honors: "Honor Graduate",
    description: "Mastery of enterprise container orchestration, microservices patterns, Kafka event pipelines, and high-concurrency database indexing."
  },
  {
    institution: "Tech Base Axis Systems Lab",
    degree: "Principal Architect & Lead Engineering Director",
    period: "2023 - 2026",
    location: "Kolkata & Global",
    honors: "45+ Production Systems",
    description: "Architecting bespoke enterprise platforms, high-throughput financial ledgers, and generative AI reasoning engines for startups and growth enterprises."
  }
];

