// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import StoryPage from './pages/books/StoryPage';
import ChapterPage from './pages/books/ChapterPage';
import Login from './pages/Login';
import About from './pages/About';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const } },
};

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
}

/* Pages that should NOT show the shared footer (they handle it themselves or it's not needed) */
const NO_FOOTER_PATHS = ['/admin', '/login', '/about'];

function AppFooter() {
  const { pathname } = useLocation();
  const hide = NO_FOOTER_PATHS.some((p) => pathname.startsWith(p));
  if (hide) return null;
  // ChapterPage gets a transparent footer that brightens on scroll
  const isChapter = /\/books\/.+\/chapter\//.test(pathname);
  return <Footer transparent={isChapter} />;
}

function App() {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />

          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />

          {/* Protected — requires login */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Home />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:slug"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <StoryPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:slug/chapter/:chapterNumber"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ChapterPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <PageTransition>
                  <AdminDashboard />
                </PageTransition>
              </AdminRoute>
            }
          />
        </Routes>
      </AnimatePresence>

      {/* Shared footer — rendered outside AnimatePresence so it doesn't flicker on transition */}
      <AppFooter />
    </>
  );
}

export default App;
