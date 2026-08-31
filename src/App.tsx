// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import StoryPage from './pages/books/StoryPage';
import ChapterPage from './pages/books/ChapterPage';
import Login from './pages/Login';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
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

          <Route
            path="/privacy"
            element={
              <PageTransition>
                <Privacy />
              </PageTransition>
            }
          />

          <Route
            path="/terms"
            element={
              <PageTransition>
                <Terms />
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

      {/* Footer lives only on the Home page — rendered there directly */}
    </>
  );
}

export default App;
