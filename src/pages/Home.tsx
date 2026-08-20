// src/pages/Home.tsx
import styled, { keyframes } from 'styled-components';
import BookCard from '../components/BookCard';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStories, type StoryDoc } from '../utils/loadFirestore';
import { loadSheet } from '../utils/loadSheet';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaSignInAlt, FaUserShield } from 'react-icons/fa';

/* ================= ANIMATIONS ================= */

const shimmer = keyframes`
  0% { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`;

/* ================= STYLES ================= */

const LogoContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== '$isshrunk',
})<{ $isshrunk: boolean }>`
  position: fixed;
  z-index: 999;
  left: 0.75rem;
  top: 0.75rem;
  width: ${(p) => (p.$isshrunk ? '36px' : '44px')};
  height: ${(p) => (p.$isshrunk ? '36px' : '44px')};
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 20px rgba(143, 3, 3, 0.41);
  padding: 0.3rem;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  &:hover {
    transform: scale(1.2);
  }

  @media (min-width: 480px) {
    left: 1rem;
    top: 1rem;
    width: ${(p) => (p.$isshrunk ? '44px' : '64px')};
    height: ${(p) => (p.$isshrunk ? '44px' : '64px')};
  }
`;

const HeaderActions = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const UserAvatar = styled.div<{ $src?: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  background: #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.7rem;
  color: #000;
  cursor: default;
  border: 2px solid rgba(255, 215, 0, 0.4);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (min-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 0.82rem;
  }
`;

const HeaderBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 0.82rem;
  font-weight: 600;
  border: 1px solid rgba(255, 215, 0, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  @media (min-width: 400px) {
    border-radius: 8px;
    width: auto;
    height: auto;
    padding: 0.45rem 0.85rem;
  }

  .btn-label {
    display: none;
    @media (min-width: 400px) {
      display: inline;
    }
  }
`;

const SignInBtn = styled(HeaderBtn)`
  background: #ffd700;
  color: #000;

  &:hover {
    background: #ffe44d;
  }
`;

const LogoutBtn = styled(HeaderBtn)`
  background: rgba(255, 255, 255, 0.07);
  color: #ccc;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }
`;

const AdminBtn = styled(HeaderBtn)`
  background: rgba(255, 215, 0, 0.12);
  color: #ffd700;

  &:hover {
    background: rgba(255, 215, 0, 0.25);
  }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background-image: url('/story-world-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
`;

const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.72);
  min-height: 100vh;
  padding: 5rem 1.25rem 4rem;

  @media (min-width: 480px) {
    padding: 5.5rem 2rem 4rem;
  }

  @media (min-width: 768px) {
    padding: 6rem 2.5rem 5rem;
  }

  @media (min-width: 1024px) {
    padding: 6rem 3rem 5rem;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  text-align: center;
  font-size: clamp(1.6rem, 8vw, 3rem);
  line-height: 1.2;
  color: #fff;
  padding: 0 0.5rem;
  word-break: break-word;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #ccc;
  max-width: 600px;
  margin: 0 auto 2rem;
  font-size: clamp(0.85rem, 3.5vw, 1.25rem);
  line-height: 1.6;
  padding: 0 1rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.75rem;
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
`;

const SkeletonCard = styled.div`
  background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  border-radius: 12px;
  height: 380px;
`;

/* ================= COMPONENT ================= */

export default function Home() {
  const [$isshrunk, setIsShrunk] = useState(false);
  const [stories, setStories] = useState<StoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setIsShrunk(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    getStories()
      .then((rows) => {
        if (rows.length > 0) {
          setStories(rows);
        } else {
          // Firestore empty or no data — fall back to Google Sheets
          return loadSheet('stories').then((sheetRows) => {
            setStories(
              (sheetRows as any[]).map((r) => ({
                id: r.id,
                title: r.title,
                tagline: r.tagline,
                image: r.image,
                genre: r.genre ?? '',
                comingSoon: r.comingSoon === 'TRUE' || r.comingSoon === true,
              }))
            );
          });
        }
      })
      .catch(() => {
        // Firestore error (e.g. permission denied before rules deploy) — fall back
        loadSheet('stories').then((sheetRows) => {
          setStories(
            (sheetRows as any[]).map((r) => ({
              id: r.id,
              title: r.title,
              tagline: r.tagline,
              image: r.image,
              genre: r.genre ?? '',
              comingSoon: r.comingSoon === 'TRUE' || r.comingSoon === true,
            }))
          );
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <>
      <LogoContainer $isshrunk={$isshrunk}>
        <img src="/images/cartoon.png" alt="StoryWorld" />
      </LogoContainer>

      <HeaderActions>
        {user ? (
          <>
            {isAdmin && (
              <AdminBtn onClick={() => navigate('/admin')}>
                <FaUserShield />
                <span className="btn-label">Admin</span>
              </AdminBtn>
            )}
            <UserAvatar>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName ?? 'User'} referrerPolicy="no-referrer" />
              ) : (
                initials
              )}
            </UserAvatar>
            <LogoutBtn onClick={() => logout()} title="Sign Out" aria-label="Sign Out">
              <FaSignOutAlt />
              <span className="btn-label">Sign Out</span>
            </LogoutBtn>
          </>
        ) : (
          <SignInBtn onClick={() => navigate('/login')} title="Sign In" aria-label="Sign In">
            <FaSignInAlt />
            <span className="btn-label">Sign In</span>
          </SignInBtn>
        )}
      </HeaderActions>

      <PageWrapper>
        <Overlay>
          <TitleRow>
            <Title>Welcome to Nanda's Story World</Title>
          </TitleRow>

          <Subtitle>
            Discover immersive tales that transport you beyond imagination.
          </Subtitle>

          <GridContainer>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <BookCard
                    slug={story.id}
                    title={story.title}
                    tagline={story.tagline}
                    image={story.image}
                    comingSoon={story.comingSoon}
                    showIcon
                  />
                </motion.div>
              ))
            )}
          </GridContainer>
        </Overlay>
      </PageWrapper>
    </>
  );
}
