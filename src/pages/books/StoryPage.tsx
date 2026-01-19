import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { loadSheet } from '../../utils/loadSheet'; // ✅ IMPORTANT

interface Chapter {
  number: number;
  title: string;
  image: string;
}

interface Story {
  id: string;          // 🔹 comes from sheet
  title: string;
  tagline: string;
  image: string;
  genre: string;
  comingSoon: boolean;
  chapters: Chapter[];
}

/* ================= STYLES (UNCHANGED) ================= */

const PageWrapper = styled.div`
  min-height: 100vh;
  background: url('/storyworld/story-world-bg.jpg') center/cover no-repeat fixed;
  display: flex;
  align-items: center;
  justify-content: center;
    padding: 2rem 1rem;

  @media (min-width: 768px) {
      padding: 3rem 2rem;
    }

    @media (min-width: 1200px) {
      padding: 4rem 3rem;
    }
`;

const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.75);
  width: 100%;
  padding: 2rem 1.5rem;
`;

const ContentWrapper = styled.div`
  max-width: 1100px;   /* 🔥 THIS controls desktop look */
  margin: 0 auto;
  width: 100%;
`;



const LogoContainer = styled(RouterLink)<{ $isScrolled: boolean }>`
  position: fixed;
  top: 3rem;
  left: 1rem;
  z-index: 999;
  width: ${({ $isScrolled }) => ($isScrolled ? '50px' : '80px')};
  height: ${({ $isScrolled }) => ($isScrolled ? '50px' : '80px')};
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 18px rgba(99, 32, 32, 0.67);
  padding: 0.3rem;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 0 25px rgba(135, 15, 15, 0.61);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
@media (min-width: 768px) {
    top: 2rem;
    left: 2rem;
    width: ${({ $isScrolled }) => ($isScrolled ? '50px' : '80px')};
    height: ${({ $isScrolled }) => ($isScrolled ? '50px' : '80px')};
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.75rem;
  color: #fff;
  font-weight: 700;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #ccc;
  max-width: 700px;
  margin: 0 auto 3rem;
  font-size: 1.2rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr; /* 🔥 Mobile: ONLY ONE card */
  gap: 1.2rem;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr); /* Tablet */
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr); /* Laptop */
  }

  @media (min-width: 1400px) {
    grid-template-columns: repeat(4, 1fr); /* Big screens */
  }
`;
// const ContentWrapper = styled.div`
//   max-width: 1200px;   /* 🔥 THIS IS THE KEY */
//   margin: 0 auto;
//   width: 100%;
// `;


const BackLink = styled(RouterLink)`
  display: inline-block;
  margin: 1rem 0 2rem;
  color: #ffd700;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;

  &:hover {
    color: #fff;
    text-decoration: underline;
  }
`;

const ChapterCard = styled(RouterLink)`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 1.5rem;
  color: #fff;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  text-align: center;
  transition: 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 25px rgba(138, 129, 10, 0.67);
  }

  h3 {
    color: #ffd700;
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #ccc;
    font-size: 1rem;
  }
`;

/* ================= COMPONENT ================= */

export default function StoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [book, setBook] = useState<Story | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  /* -------- Load from Google Sheets -------- */
  useEffect(() => {
    if (!slug) return;

    Promise.all([
      loadSheet('stories'),
      loadSheet('chapters'),
    ]).then(([stories, chapters]) => {
      const story = stories.find((s: any) => s.id === slug);
      if (!story) return;

      const storyChapters = chapters
        .filter((c: any) => c.story_id === slug)
        .map((c: any) => ({
          number: Number(c.number),
          title: c.title,
          image: c.image,
        }));

      setBook({
        ...story,
        chapters: storyChapters,
      });
    });
  }, [slug]);

  /* -------- Logo shrink on scroll -------- */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!book) {
    return <p style={{ color: 'white', padding: '2rem' }}>Loading...</p>;
  }

  return (
    <>
      <LogoContainer to="/" $isScrolled={isScrolled}>
        <img
          src={`${import.meta.env.BASE_URL}${book.image}`}
          alt={book.title}
        />

      </LogoContainer>

      <BackLink to="/">← Back to Stories</BackLink>

      <PageWrapper>
        <Overlay>
        <ContentWrapper>
          <Title>{book.title}</Title>
          <Subtitle>{book.tagline}</Subtitle>

          {book.chapters.length === 0 ? (
            <p style={{ color: '#ccc', textAlign: 'center', fontSize: '1.1rem' }}>
              No chapters available for this story yet.
            </p>
          ) : (
            <GridContainer>
              {book.chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.number}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <ChapterCard to={`/books/${slug}/chapter/${chapter.number}`}>
                    <img
                      src={`${import.meta.env.BASE_URL}${chapter.image}`}
                      alt={`Chapter ${chapter.number} cover`}
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                      }}
                    />
                    <h3>Chapter {chapter.number}</h3>
                    <p>{chapter.title}</p>
                  </ChapterCard>
                </motion.div>
              ))}
            </GridContainer>
          )}
      </ContentWrapper>
        </Overlay>
      </PageWrapper>
    </>
  );
}
