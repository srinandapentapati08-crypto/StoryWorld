// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import StoryPage from './pages/books/StoryPage';
import ChapterPage from './pages/books/ChapterPage';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.18, ease: 'easeIn'  } },
};

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const location = useLocation();

  return (
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
  );
}

export default App;
