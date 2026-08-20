// src/pages/books/StoryPage.tsx
import { useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStory, getChapters } from '../../utils/loadFirestore';
import { loadSheet } from '../../utils/loadSheet';
import { useAuth } from '../../context/AuthContext';
import { FaHome } from 'react-icons/fa';

interface ChapterItem {
  id: string;
  number: number;
  title: string;
  image: string;
}

interface StoryData {
  id: string;
  title: string;
  tagline: string;
  image: string;
  genre: string;
  comingSoon: boolean;
  chapters: ChapterItem[];
}

/* ================= ANIMATIONS ================= */

const shimmer = keyframes`
  0% { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ================= STYLES ================= */

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
`;

const TopBar = styled.div<{ $scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: ${p => p.$scrolled ? 'rgba(10,10,10,0.92)' : 'transparent'};
  backdrop-filter: ${p => p.$scrolled ? 'blur(14px)' : 'none'};
  border-bottom: ${p => p.$scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none'};
  transition: background 0.3s ease, backdrop-filter 0.3s ease;
`;
const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const StoryCover = styled.div<{ $scrolled: boolean; $src?: string }>`
  width: ${p => p.$scrolled ? '32px' : '48px'};
  height: ${p => p.$scrolled ? '32px' : '48px'};
  border-radius: 50%;
  overflow: hidden;
  background: #333;
  flex-shrink: 0;
  transition: all 0.3s ease;
  background-image: ${p => p.$src ? `url(${p.$src})` : 'none'};
  background-size: cover;
  background-position: center;
  border: 2px solid rgba(255, 215, 0, 0.3);
`;

const HomeBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #ccc;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const HeaderBtn = styled.button`
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  border: 1px solid rgba(255, 215, 0, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const AdminBtn = styled(HeaderBtn)`
  background: rgba(255, 215, 0, 0.12);
  color: #ffd700;
  &:hover { background: rgba(255, 215, 0, 0.25); }
`;

const LogoutBtn = styled(HeaderBtn)`
  background: rgba(255, 255, 255, 0.07);
  color: #ccc;
  &:hover { background: rgba(255, 255, 255, 0.15); color: #fff; }
`;
const Hero = styled.div<{ $bgImage?: string; $loaded: boolean }>`
  position: relative;
  width: 100%;
  height: clamp(340px, 52vw, 540px);
  background-image: ${p => p.$bgImage ? `url(${p.$bgImage})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  opacity: ${p => p.$loaded ? 1 : 0};
  transition: opacity 0.6s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 0%, #0a0a0a 100%);
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: inherit;
    background-size: cover;
    background-position: center;
    filter: brightness(0.45);
    transform: scale(1.04);
    z-index: 0;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 0 1rem 3rem;
  animation: ${fadeUp} 0.8s ease 0.3s both;

  @media (min-width: 480px) {
    padding: 0 1.5rem 3rem;
  }

  @media (min-width: 768px) {
    padding: 0 clamp(1.25rem, 5vw, 4rem) 4rem;
  }
`;

const GenreBadge = styled.div`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border: 1px solid #ffd700;
  border-radius: 20px;
  color: #ffd700;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
`;
const HeroTitle = styled.h1`
  font-size: clamp(1.5rem, 6vw, 3.5rem);
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.5rem;
  line-height: 1.15;
  letter-spacing: -0.02em;
`;

const HeroTagline = styled.p`
  font-size: clamp(0.8rem, 2.5vw, 1.1rem);
  color: rgba(255, 255, 255, 0.7);
  max-width: 560px;
  line-height: 1.5;
`;

const ContentSection = styled.section`
  padding: 1.25rem 1rem 3rem;

  @media (min-width: 480px) {
    padding: 1.5rem 1.5rem 3rem;
  }

  @media (min-width: 768px) {
    padding: clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 5vw, 4rem);
  }
`;

const ContentWrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const SectionLabel = styled.h2`
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffd700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
`;

const ChaptersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (min-width: 500px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.1rem;
  }

  @media (max-width: 479px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
const ChapterCard = styled.div`
  background: #111;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.4s ease;
  position: relative;

  &:hover {
    border-color: #ffd700;
    transform: translateY(-4px);

    .chapter-image {
      transform: scale(1.04);
    }
  }

  .chapter-image {
    width: 100%;
    aspect-ratio: 3/4;
    object-fit: cover;
    transition: transform 0.4s ease;
    background: #222;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  .chapter-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent 0%, rgba(0,0,0,0.92) 100%);
    padding: 2rem 1rem 1rem;
    color: #fff;
  }

  .chapter-number {
    font-size: 0.75rem;
    font-weight: 600;
    color: #ffd700;
    text-transform: uppercase;
    margin-bottom: 0.3rem;
  }

  .chapter-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
    line-height: 1.3;
  }
`;
const SkeletonHero = styled.div`
  width: 100%;
  height: clamp(340px, 52vw, 540px);
  background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
`;

const SkeletonLabel = styled.div`
  width: 120px;
  height: 20px;
  background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const SkeletonCard = styled.div`
  background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  border-radius: 14px;
  aspect-ratio: 3/4;
`;

function getImgSrc(raw: string) {
  if (!raw) return '';
  if (raw.startsWith('http')) return raw;
  return `${import.meta.env.BASE_URL}${raw}`;
}

/* ================= COMPONENT ================= */

export default function StoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [book, setBook] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!slug) return;

    // Try Firestore first, fall back to Google Sheets if empty or error
    Promise.all([getStory(slug), getChapters(slug)])
      .then(([story, chapters]) => {
        if (story) {
          setBook({
            ...story,
            chapters: chapters.map((c) => ({
              id: c.id,
              number: c.number,
              title: c.title,
              image: c.image,
            })),
          });
        } else {
          return fallbackToSheets();
        }
      })
      .catch(() => fallbackToSheets())
      .finally(() => setLoading(false));

    function fallbackToSheets() {
      return Promise.all([loadSheet('stories'), loadSheet('chapters')]).then(
        ([stories, allChapters]) => {
          const s = (stories as any[]).find((r) => r.id === slug);
          if (!s) return;
          const storyChapters = (allChapters as any[])
            .filter((c) => c.story_id === slug)
            .sort((a, b) => Number(a.number) - Number(b.number))
            .map((c) => ({
              id: String(c.number),
              number: Number(c.number),
              title: c.title,
              image: c.image,
            }));
          setBook({
            id: s.id,
            title: s.title,
            tagline: s.tagline,
            image: s.image,
            genre: s.genre ?? '',
            comingSoon: s.comingSoon === 'TRUE',
            chapters: storyChapters,
          });
        }
      );
    }
  }, [slug]);
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <PageWrapper>
        <TopBar $scrolled={false}>
          <TopLeft>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#333' }} />
            <HomeBtn onClick={() => navigate('/')}>
              <FaHome /> Home
            </HomeBtn>
          </TopLeft>
        </TopBar>

        <SkeletonHero />

        <ContentSection>
          <ContentWrapper>
            <SkeletonLabel />
            <ChaptersGrid>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </ChaptersGrid>
          </ContentWrapper>
        </ContentSection>
      </PageWrapper>
    );
  }

  if (!book) {
    return (
      <PageWrapper>
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#ccc' }}>
          Story not found.
        </div>
      </PageWrapper>
    );
  }

  const coverSrc = getImgSrc(book.image);
  return (
    <PageWrapper>
      {/* Hidden image to track loading */}
      {coverSrc && (
        <img
          src={coverSrc}
          alt=""
          style={{ display: 'none' }}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/cartoon.png';
            setImageLoaded(true);
          }}
        />
      )}

      <TopBar $scrolled={isScrolled}>
        <TopLeft>
          <StoryCover $scrolled={isScrolled} $src={coverSrc || '/images/cartoon.png'} />
          <HomeBtn onClick={() => navigate('/')}>
            <FaHome /> Home
          </HomeBtn>
        </TopLeft>

        <TopRight>
          {user ? (
            <>
              {isAdmin && <AdminBtn onClick={() => navigate('/admin')}>Admin</AdminBtn>}
              <LogoutBtn onClick={() => logout()}>Sign Out</LogoutBtn>
            </>
          ) : null}
        </TopRight>
      </TopBar>

      <Hero $bgImage={coverSrc} $loaded={!coverSrc || imageLoaded}>
        <HeroContent>
          <GenreBadge>{book.genre || 'Story'}</GenreBadge>
          <HeroTitle>{book.title}</HeroTitle>
          <HeroTagline>{book.tagline}</HeroTagline>
        </HeroContent>
      </Hero>
      <ContentSection>
        <ContentWrapper>
          <SectionLabel>
            {book.chapters.length} Chapter{book.chapters.length !== 1 ? 's' : ''}
          </SectionLabel>

          {book.chapters.length === 0 ? (
            <p style={{ color: '#666', fontSize: '1rem', textAlign: 'center', padding: '3rem 0' }}>
              No chapters available for this story yet.
            </p>
          ) : (
            <ChaptersGrid>
              {book.chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  onClick={() => navigate(`/books/${slug}/chapter/${chapter.number}`)}
                >
                  <ChapterCard>
                    {chapter.image ? (
                      <img
                        className="chapter-image"
                        src={getImgSrc(chapter.image)}
                        alt={`Chapter ${chapter.number}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const placeholder = document.createElement('div');
                          placeholder.className = 'chapter-image';
                          placeholder.textContent = '📖';
                          placeholder.style.background = '#333';
                          placeholder.style.display = 'flex';
                          placeholder.style.alignItems = 'center';
                          placeholder.style.justifyContent = 'center';
                          (e.target as HTMLImageElement).parentNode?.appendChild(placeholder);
                        }}
                      />
                    ) : (
                      <div className="chapter-image">📖</div>
                    )}
                    <div className="chapter-overlay">
                      <div className="chapter-number">Chapter {chapter.number}</div>
                      <div className="chapter-title">{chapter.title}</div>
                    </div>
                  </ChapterCard>
                </motion.div>
              ))}
            </ChaptersGrid>
          )}
        </ContentWrapper>
      </ContentSection>
    </PageWrapper>
  );
}