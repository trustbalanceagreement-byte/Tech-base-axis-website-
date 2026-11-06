import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavSection, Project, ServicePackage, ClientInquiry } from './types';
import { DEFAULT_INQUIRIES, PROJECTS_DATA, SERVICE_PACKAGES } from './data/mockData';
import { 
  INITIAL_PACKAGES, 
  loadSavedPackages, 
  updatePackagesFromCloud, 
  subscribeToPublicPackages,
  recordDeletedPackageId 
} from './data/pricingData';
import { 
  loadSavedProjects,
  saveProjects, 
  subscribeToPublicProjects 
} from './data/projectData';
import { auth, onAuthStateChanged } from './lib/firebase';
import { 
  saveInquiryToCloud, 
  updateInquiryInCloud, 
  deleteInquiryFromCloud, 
  subscribeToCloudInquiries,
  fetchServerInquiries,
  getDeletedInquiryIds,
  recordDeletedInquiryId
} from './data/inquiryData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { ProjectsSection } from './components/ProjectsSection';
import { PackagesSection } from './components/PackagesSection';
import { ContactSection } from './components/ContactSection';
import { AdminSection } from './components/AdminSection';
import { PrivacyPolicySection } from './components/PrivacyPolicySection';
import { TermsSection } from './components/TermsSection';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { Footer } from './components/Footer';
import { useSectionSEO, SECTION_PATHS, sectionFromPath } from './hooks/useSectionSEO';
import { FullPageSkeleton } from './components/ui/Skeleton';

const STORAGE_KEY = 'tech_base_axis_inquiries_v1';

function AppShell() {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<NavSection>(() => {
    if (typeof window === 'undefined') return 'home';
    const fromPath = sectionFromPath(window.location.pathname);
    if (fromPath) return fromPath;
    const legacy = new URLSearchParams(window.location.search).get('section') as NavSection | null;
    return legacy && legacy in SECTION_PATHS ? legacy : 'home';
  });
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Dynamically update page title, meta description, keywords, and OpenGraph data per section
  useSectionSEO(activeSection);
  const [selectedProjectModal, setSelectedProjectModal] = useState<Project | null>(null);
  const [preselectedPackage, setPreselectedPackage] = useState<ServicePackage | null>(null);

  // Initial skeleton load for smooth hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Short, page-aware skeleton whenever the visitor switches pages
  const [isPageLoading, setIsPageLoading] = useState(false);
  const firstSectionRef = useRef(true);
  useEffect(() => {
    if (firstSectionRef.current) {
      firstSectionRef.current = false;
      return;
    }
    if (activeSection === 'admin') return;
    setIsPageLoading(true);
    const t = setTimeout(() => setIsPageLoading(false), 450);
    return () => clearTimeout(t);
  }, [activeSection]);

  // Initialize inquiries from localStorage or fallback to initial realistic inquiries
  const [inquiries, setInquiries] = useState<ClientInquiry[]>(() => {
    const deleted = getDeletedInquiryIds();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((i) => i && i.id && !deleted.has(i.id));
        }
      }
    } catch (err) {
      console.error('Failed to load stored inquiries:', err);
    }
    return DEFAULT_INQUIRIES.filter((i) => i && i.id && !deleted.has(i.id));
  });

  // Initialize service & subscription packages from cloud or localStorage
  const [packages, setPackages] = useState<ServicePackage[]>(() => {
    return loadSavedPackages();
  });

  // Initialize projects from cloud templates or cached state
  const [projects, setProjects] = useState<Project[]>(() => {
    return loadSavedProjects();
  });

  // Real-time synchronization of public projects from Cloud/Server for all live visitors
  useEffect(() => {
    const unsubscribe = subscribeToPublicProjects((liveProjects) => {
      if (Array.isArray(liveProjects)) {
        setProjects(liveProjects);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of public packages & custom pricing from Cloud/Server for all live visitors
  useEffect(() => {
    const unsubscribe = subscribeToPublicPackages((livePackages) => {
      // An empty list is valid too (admin removed every package), so it must not be ignored
      if (Array.isArray(livePackages)) {
        setPackages(livePackages);
      }
    });
    return () => unsubscribe();
  }, []);

  // NOTE: packages are written to the cloud ONLY from explicit Admin actions
  // (create / edit / delete / reset). They are intentionally NOT re-uploaded on
  // page load: doing so let any visitor's stale or default list overwrite the
  // packages the admin configured.

  // Fetch latest inquiries from server on initial load
  useEffect(() => {
    fetchServerInquiries().then((list) => {
      if (Array.isArray(list)) {
        const deleted = getDeletedInquiryIds();
        setInquiries(list.filter((i) => i && i.id && !deleted.has(i.id)));
      }
    }).catch(() => {});
  }, []);

  // Admin: load every client inquiry from the cloud, live, on any device
  const [inquirySyncError, setInquirySyncError] = useState<string | null>(null);
  const [firebaseAuthTick, setFirebaseAuthTick] = useState(0);
  // Firestore only lets a signed-in admin read inquiries, so re-subscribe whenever Firebase auth changes
  useEffect(() => {
    try {
      return onAuthStateChanged(auth, () => setFirebaseAuthTick((t) => t + 1));
    } catch (_) {
      return undefined;
    }
  }, []);
  useEffect(() => {
    if (!isAdmin) return;
    setInquirySyncError(null);
    const unsubscribe = subscribeToCloudInquiries(
      (cloudList) => {
        setInquirySyncError(null);
        const deleted = getDeletedInquiryIds();
        const cleanList = cloudList.filter((i) => i && i.id && !deleted.has(i.id));
        setInquiries(cleanList);
      },
      (message) => setInquirySyncError(message)
    );
    return () => unsubscribe();
  }, [isAdmin, firebaseAuthTick]);

  const handleRefreshInquiries = async () => {
    try {
      const list = await fetchServerInquiries();
      if (Array.isArray(list)) {
        const deleted = getDeletedInquiryIds();
        setInquiries(list.filter((i) => i && i.id && !deleted.has(i.id)));
      }
    } catch (_) {}
  };

  // Persist inquiries whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
    } catch (err) {
      console.error('Failed to persist inquiries:', err);
    }
  }, [inquiries]);

  // Strip shortcut anchor links (#home, #projects, #packages, #contact, #admin) from browser URL bar
  useEffect(() => {
    const stripAnchorLinks = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const rawHash = window.location.hash.replace('#', '');
        const baseHash = rawHash.split('/')[0] as NavSection;
        if (['home', 'projects', 'packages', 'contact', 'admin', 'privacy', 'terms'].includes(baseHash)) {
          setActiveSection(baseHash);
        }
        // Remove anchor link (#...) from URL bar so only clean domain shows
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    stripAnchorLinks();
    window.addEventListener('hashchange', stripAnchorLinks);
    const onPop = () => setActiveSection(sectionFromPath(window.location.pathname) ?? 'home');
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('hashchange', stripAnchorLinks);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  // Always keep URL clean when switching sections
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [activeSection]);

  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    // Real, crawlable URL per page (/projects, /packages, /contact ...)
    if (typeof window !== 'undefined') {
      const target = SECTION_PATHS[section] || '/';
      if (window.location.pathname !== target || window.location.search) {
        window.history.pushState(null, '', target);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPackage = (pkg: ServicePackage) => {
    setPreselectedPackage(pkg);
    handleNavigate('contact');
  };

  const handleInquirySubmitted = (newInquiry: ClientInquiry) => {
    setInquiries((prev) => [newInquiry, ...prev]);
    // Shared cloud copy so the admin panel receives it on any device
    saveInquiryToCloud(newInquiry);
  };

  const handleUpdateInquiryStatus = (id: string, status: ClientInquiry['status'], notes?: string) => {
    updateInquiryInCloud(id, notes !== undefined ? { status, notes } : { status });
    setInquiries((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status,
            notes: notes !== undefined ? notes : item.notes
          };
        }
        return item;
      })
    );
  };

  const handlePatchInquiry = (id: string, patch: Partial<ClientInquiry>) => {
    updateInquiryInCloud(id, patch);
    setInquiries((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleDeleteInquiry = (id: string) => {
    recordDeletedInquiryId(id);
    deleteInquiryFromCloud(id);
    setInquiries((prev) => prev.filter((item) => item.id !== id));
  };

  // Every admin package action is applied on top of the LATEST cloud list (never on a
  // possibly stale local copy) so old/default packages can't sneak back in.
  const applyPackageChange = (
    change: (list: ServicePackage[]) => ServicePackage[],
    deletedId?: string
  ) => {
    setPackages((prev) => change(prev)); // instant UI feedback
    updatePackagesFromCloud(change, deletedId)
      .then((saved) => setPackages(saved))
      .catch((err) => console.error('Failed to save packages:', err));
  };

  const upsertPackage = (list: ServicePackage[], pkg: ServicePackage) =>
    list.some((p) => p.id === pkg.id)
      ? list.map((p) => (p.id === pkg.id ? pkg : p))
      : [...list, pkg];

  const handleUpdatePackagePrice = (id: string, newPrice: number) => {
    applyPackageChange((list) => list.map((pkg) => (pkg.id === id ? { ...pkg, price: newPrice } : pkg)));
  };

  const handleUpdatePackage = (updatedPkg: ServicePackage) => {
    applyPackageChange((list) => upsertPackage(list, updatedPkg));
  };

  const handleResetPackagesToDefault = () => {
    applyPackageChange(() => INITIAL_PACKAGES);
  };

  const handleCreatePackage = (newPkg: ServicePackage) => {
    applyPackageChange((list) => upsertPackage(list, newPkg));
  };

  const handleDeletePackage = (id: string) => {
    recordDeletedPackageId(id);
    applyPackageChange((list) => list.filter((p) => p.id !== id), id);
  };

  // Projects CRUD operations
  const handleUpdateProject = (updatedProj: Project) => {
    setProjects((prev) => {
      const next = prev.map((proj) => (proj.id === updatedProj.id ? updatedProj : proj));
      saveProjects(next);
      return next;
    });
  };

  const handleCreateProject = (newProj: Project) => {
    setProjects((prev) => {
      const next = [newProj, ...prev];
      saveProjects(next);
      return next;
    });
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => {
      const next = prev.filter((proj) => proj.id !== id);
      saveProjects(next, id);
      return next;
    });
  };

  const handleClearAllProjects = () => {
    setProjects([]);
    saveProjects([]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col obsidian-grid selection:bg-red-600/30 selection:text-red-200">
      {/* Top Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        inquiryCount={inquiries.filter((i) => i.status === 'New').length}
      />

      {/* Main Content Area with Fluid Section Transition Animation */}
      <main className="flex-1 w-full overflow-x-clip">
        {isInitialLoading || isPageLoading ? (
          <FullPageSkeleton section={activeSection} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {activeSection === 'home' && (
                <HomeSection
                  onNavigate={handleNavigate}
                  onSelectProject={(proj) => {
                    setSelectedProjectModal(proj);
                    handleNavigate('projects');
                  }}
                  onSelectPackage={handleSelectPackage}
                  projects={projects}
                />
              )}

              {activeSection === 'projects' && (
                <ProjectsSection
                  onNavigate={handleNavigate}
                  selectedProjectModal={selectedProjectModal}
                  onOpenProjectModal={setSelectedProjectModal}
                  projects={projects}
                />
              )}

              {activeSection === 'packages' && (
                <PackagesSection
                  packages={packages}
                  onNavigate={handleNavigate}
                  onSelectPackage={handleSelectPackage}
                  onInquirySubmitted={handleInquirySubmitted}
                />
              )}

              {activeSection === 'contact' && (
                <ContactSection
                  packages={packages}
                  preselectedPackage={preselectedPackage}
                  onInquirySubmitted={handleInquirySubmitted}
                  onNavigate={handleNavigate}
                />
              )}

              {activeSection === 'admin' && (
                <AdminSection
                  inquiries={inquiries}
                  inquirySyncError={inquirySyncError}
                  onUpdateInquiryStatus={handleUpdateInquiryStatus}
                  onPatchInquiry={handlePatchInquiry}
                  onDeleteInquiry={handleDeleteInquiry}
                  onNavigate={handleNavigate}
                  onRefreshInquiries={handleRefreshInquiries}
                  packages={packages}
                  onUpdatePackagePrice={handleUpdatePackagePrice}
                  onUpdatePackage={handleUpdatePackage}
                  onResetPackagesToDefault={handleResetPackagesToDefault}
                  onCreatePackage={handleCreatePackage}
                  onDeletePackage={handleDeletePackage}
                  projects={projects}
                  onUpdateProject={handleUpdateProject}
                  onCreateProject={handleCreateProject}
                  onDeleteProject={handleDeleteProject}
                  onClearAllProjects={handleClearAllProjects}
                />
              )}

              {activeSection === 'privacy' && (
                <PrivacyPolicySection
                  onNavigate={handleNavigate}
                />
              )}

              {activeSection === 'terms' && (
                <TermsSection
                  onNavigate={handleNavigate}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Cookie & Privacy Consent Banner */}
      <CookieConsentBanner onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
