import { ServicePackage } from '../types';

export const INITIAL_PACKAGES: ServicePackage[] = [
  // --- Monthly Subscription Plans ---
  {
    id: 'monthly-basic',
    name: 'Basic Plan',
    badge: 'Starter',
    theme: 'green',
    price: 45,
    period: '/month',
    cycle: 'monthly',
    description: 'For most businesses that want to optimize web queries & scale',
    turnaround: 'Instant Onboarding',
    idealFor: 'Small businesses & solo founders',
    popular: false,
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Optimized hashtags & keywords', included: true },
      { text: 'Your custom analytics dashboard', included: true },
      { text: '+300 pre-built UI components', included: false },
      { text: 'Dedicated 24/7 chat support', included: false },
      { text: 'High-speed cloud storage', included: false }
    ],
    deliverables: [
      'Production Web Portal Access',
      'Dashboard & Reporting Views',
      'Monthly Security & Stack Updates'
    ],
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Node.js']
  },
  {
    id: 'monthly-standard',
    name: 'Standard Plan',
    badge: 'Most Popular',
    theme: 'blue',
    price: 60,
    period: '/month',
    cycle: 'monthly',
    description: 'For growing businesses wanting full component kits & faster turnarounds',
    turnaround: 'Instant Onboarding',
    idealFor: 'Scaling businesses & engineering teams',
    popular: true,
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Optimized hashtags & keywords', included: true },
      { text: 'Your custom analytics dashboard', included: true },
      { text: '+300 pre-built UI components', included: true },
      { text: 'Dedicated 24/7 chat support', included: false },
      { text: 'High-speed cloud storage', included: false }
    ],
    deliverables: [
      'Production Web Portal Access',
      'Full Component Library Integration',
      'Priority Performance Audits & Monitoring'
    ],
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'PostgreSQL', 'Stripe']
  },
  {
    id: 'monthly-premium',
    name: 'Premium Plan',
    badge: 'All-Inclusive',
    theme: 'amber',
    price: 86,
    period: '/month',
    cycle: 'monthly',
    description: 'Enterprise-grade speed, 300+ components, dedicated chat support & storage',
    turnaround: 'Priority Same-Day Setup',
    idealFor: 'Enterprises & high-frequency digital platforms',
    popular: false,
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Optimized hashtags & keywords', included: true },
      { text: 'Your custom analytics dashboard', included: true },
      { text: '+300 pre-built UI components', included: true },
      { text: 'Dedicated 24/7 chat support', included: true },
      { text: 'High-speed cloud storage', included: true }
    ],
    deliverables: [
      'White-Glove Architecture Guidance',
      'Unlimited Component & UI Requests',
      'Dedicated Slack / Discord Hotline',
      'Cloud Storage & Asset Hosting'
    ],
    techStack: ['React 19', 'Next/Node', 'PostgreSQL', 'Redis', 'AWS/GCP Cloud']
  },

  // --- Maintenance & Ongoing Engineering Plans ---
  {
    id: 'maintenance-basic',
    name: 'Basic Maintenance',
    badge: 'Essential Care',
    theme: 'green',
    price: 1499,
    period: '/month',
    cycle: 'maintenance',
    description: 'Continuous health monitoring, essential security patches, core library updates and bug fixes.',
    turnaround: 'Instant Onboarding',
    idealFor: 'Small businesses & startups with live web portals requiring stable uptime',
    popular: false,
    features: [
      { text: 'Continuous core framework & security updates', included: true },
      { text: 'Automated weekly database & cloud backups', included: true },
      { text: '99.9% uptime monitoring & health pings', included: true },
      { text: 'Up to 5 hours dedicated bug fixes/month', included: true },
      { text: 'SSL certificate renewal & domain checks', included: true },
      { text: 'Standard email & Discord ticketing support', included: true },
      { text: 'Custom UI/feature enhancements', included: false },
      { text: '24/7 emergency incident hotline', included: false }
    ],
    deliverables: [
      'Monthly Security & Stack Health Audit Report',
      'Automated Cloud Backup Verification Logs',
      'Dedicated Discord / Email Support Channel'
    ],
    techStack: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL / Cloud', 'Docker']
  },
  {
    id: 'maintenance-standard',
    name: 'Standard Maintenance',
    badge: 'Most Popular',
    theme: 'blue',
    price: 3499,
    period: '/month',
    cycle: 'maintenance',
    popular: true,
    description: 'Comprehensive proactive maintenance with fast-response SLA, query optimizations & active code enhancements.',
    turnaround: 'Same-Day Priority Setup',
    idealFor: 'Growing SaaS platforms, E-commerce hubs & high-traffic client portals',
    features: [
      { text: 'Everything in Basic Maintenance tier', included: true },
      { text: 'Rapid-response SLA (< 4 hours turnaround)', included: true },
      { text: 'Database query & index performance tuning', included: true },
      { text: 'Third-party API & webhook health monitoring', included: true },
      { text: 'Up to 15 hours dedicated code & feature updates', included: true },
      { text: 'Bi-weekly performance & SEO speed audits', included: true },
      { text: 'Priority WhatsApp / Slack hotline support', included: true },
      { text: 'Dedicated principal architect consultation', included: false }
    ],
    deliverables: [
      'Priority Engineering Support & Hotfix Access',
      'Bi-Weekly Deployment & Optimization Sprints',
      'Real-Time Error Logging & Alert System',
      'Dedicated WhatsApp / Slack Channel'
    ],
    techStack: ['React 19', 'Node.js / Express', 'PostgreSQL', 'Redis', 'Stripe', 'GCP / Cloud Run']
  },
  {
    id: 'maintenance-enterprise',
    name: 'Enterprise Maintenance',
    badge: '24/7 SLA',
    theme: 'amber',
    price: 6999,
    period: '/month',
    cycle: 'maintenance',
    popular: false,
    description: 'Round-the-clock incident response, zero-downtime hotfixes, disaster recovery & dedicated architect.',
    turnaround: 'Immediate Dedicated Escalation',
    idealFor: 'Enterprises, High-volume platforms, FinTech, and mission-critical applications',
    features: [
      { text: 'Everything in Standard Maintenance tier', included: true },
      { text: '24/7 emergency hotline & 30-min critical SLA', included: true },
      { text: 'High-availability multi-cloud failover checks', included: true },
      { text: 'Security penetration remediation & audit prep', included: true },
      { text: 'Up to 35 hours custom engineering & UI updates', included: true },
      { text: 'Multi-region disaster recovery & data mirroring', included: true },
      { text: 'Guaranteed 99.99% infrastructure uptime SLA', included: true },
      { text: 'Dedicated senior systems architect consultation', included: true }
    ],
    deliverables: [
      '24/7 Emergency Incident Escalation Protocol',
      'High-Availability Architecture Governance',
      'Custom Telemetry & Error Tracking Dashboard',
      'Guaranteed 99.99% Infrastructure Uptime SLA'
    ],
    techStack: ['Distributed TypeScript', 'Kubernetes', 'PostgreSQL Cluster', 'Kafka', 'Docker', 'GCP/AWS']
  }
];

export const PACKAGES_STORAGE_KEY = 'tech_base_axis_pricing_packages_v4';

export function loadSavedPackages(): ServicePackage[] {
  try {
    const raw = localStorage.getItem(PACKAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load packages from storage, using defaults:', err);
  }
  return INITIAL_PACKAGES;
}

export function savePackages(packages: ServicePackage[]): void {
  try {
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(packages));
  } catch (err) {
    console.error('Failed to save packages to storage:', err);
  }
}
