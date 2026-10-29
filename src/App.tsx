import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavSection, Project, ServicePackage, ClientInquiry } from './types';
import { DEFAULT_INQUIRIES, PROJECTS_DATA, SERVICE_PACKAGES } from './data/mockData';
import { 
  INITIAL_PACKAGES, 
  loadSavedPackages, 
  savePackages, 
  subscribeToPublicPackages,
  recordDeletedPackageId 
} from './data/pricingData';
import { 
  loadSavedProjects,
  saveProjects, 
  subscribeToPublicProjects 
} from './data/projectData';
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
import { useSectionSEO } from './hooks/useSectionSEO';
import { FullPageSkeleton } from './components/ui/Skeleton';

const STORAGE_KEY = 'tech_base_axis_inquiries_v1';

function AppShell() {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Dynamically update page title, meta description, keywords, and OpenGraph data per section
  useSectionSEO(activeSection);
  const [selectedProjectModal, setSelectedProjectModal] = useState<Project | null>(null);
  const [preselectedPackage, setPreselectedPackage] = useState<ServicePackage | null>(null);

  // Initial skeleton load for smooth hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Initialize inquiries from localStorage or fallback to initial realistic inquiries
  const [inquiries, setInquiries] = useState<ClientInquiry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load stored inquiries:', err);
    }
    return DEFAULT_INQUIRIES;
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
      if (Array.isArray(livePackages) && livePackages.length > 0) {
        setPackages(livePackages);
      }
    });
    return () => unsubscribe();
  }, []);

  // Ensure any existing custom packages configured on admin's device are synced to Cloud on startup
  useEffect(() => {
    try {
      const saved = loadSavedPackages();
      if (Array.isArray(saved) && saved.length > 0) {
        savePackages(saved);
      }
    } catch (_) {}
  }, []);

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
    return () => window.removeEventListener('hashchange', stripAnchorLinks);
  }, []);

  // Always keep URL clean when switching sections
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [activeSection]);

  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    // Ensure clean URL without any anchor links (#home, #projects, #packages, #contact, #admin)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPackage = (pkg: ServicePackage) => {
    setPreselectedPackage(pkg);
    handleNavigate('contact');
  };

  const handleInquirySubmitted = (newInquiry: ClientInquiry) => {
    setInquiries((prev) => [newInquiry, ...prev]);
  };

  const handleUpdateInquiryStatus = (id: string, status: ClientInquiry['status'], notes?: string) => {
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

  const handleDeleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdatePackagePrice = (id: string, newPrice: number) => {
    setPackages((prev) => {
      const updated = prev.map((pkg) => (pkg.id === id ? { ...pkg, price: newPrice } : pkg));
      savePackages(updated);
      return updated;
    });
  };

  const handleUpdatePackage = (updatedPkg: ServicePackage) => {
    setPackages((prev) => {
      const updated = prev.map((pkg) => (pkg.id === updatedPkg.id ? updatedPkg : pkg));
      savePackages(updated);
      return updated;
    });
  };

  const handleResetPackagesToDefault = () => {
    setPackages(INITIAL_PACKAGES);
    savePackages(INITIAL_PACKAGES);
  };

  const handleCreatePackage = (newPkg: ServicePackage) => {
    setPackages((prev) => {
      const updated = [...prev, newPkg];
      savePackages(updated);
      return updated;
    });
  };

  const handleDeletePackage = (id: string) => {
    recordDeletedPackageId(id);
    setPackages((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePackages(updated, id);
      return updated;
    });
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
        {isInitialLoading ? (
          <FullPageSkeleton />
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
                  onUpdateInquiryStatus={handleUpdateInquiryStatus}
                  onDeleteInquiry={handleDeleteInquiry}
                  onNavigate={handleNavigate}
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
