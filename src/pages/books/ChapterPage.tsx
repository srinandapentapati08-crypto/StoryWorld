// src/pages/books/ChapterPage.tsx

import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { loadSheet } from '../../utils/loadSheet';

/* ================= TYPES ================= */

type Chapter = {
  number: number;
  title: string;
  content: string;
  image: string;
  doc_url: string;
};

/* ================= STYLES ================= */

const ChapterWrapper = styled.div`
  background: url('/storyworld/textures/soft-paper-bg-3.jpg') repeat;
  background-size: cover;
  min-height: 100vh;
  padding: 4rem 0.75rem 1.5rem; /* 🔥 smaller for 320px */
  font-family: 'Georgia', 'Times New Roman', Times, serif;
  display: flex;
  justify-content: center;

  @media (min-width: 375px) {
    padding: 4.5rem 1rem 2rem;
  }

  @media (min-width: 768px) {
    padding: 5rem 2rem 2rem;
  }
`;


const ChapterContainer = styled.div`
  max-width: 1000px;
  background: rgba(255, 255, 255, 0.92);
  padding: 1.5rem; /* 🔥 mobile default */
  border-radius: 16px;
  width: 100%;
  color:#1a1a1a;
  @media (min-width: 375px) {
    padding: 2rem;
  }

  @media (min-width: 768px) {
    padding: 3rem;
  }
`;


const Title = styled.h1`
  font-size: clamp(1.6rem, 6vw, 2.6rem);
  text-align: center;
  color: #4a2f20;
  margin-bottom: 0.5rem;
`;

const ChapterNumber = styled.h2`
  font-size: clamp(0.9rem, 3.5vw, 1.3rem);
  text-align: center;
  color: #a67c52;
  margin-bottom: 1.5rem;
`;


const Content = styled.div<{ fontSize: number }>`
  font-size: clamp(
    ${({ fontSize }) => Math.max(fontSize - 6, 14)}px,
    4vw,
    ${({ fontSize }) => fontSize}px
  );
  line-height: 1.75;
  text-align: justify;
`;


const DropCapParagraph = styled.p`
  &:first-letter {
    float: left;
    font-size: clamp(2.2rem, 9vw, 4rem);
    line-height: 0.95;
    font-weight: bold;
    margin-right: 0.5rem;
    color: #a16b40;
  }
`;


const Paragraph = styled.p`
  margin-bottom: 0.5rem;
`;

const BackLink = styled(Link)`
  display: block;
  margin-top: 3rem;
  text-align: center;
  color: #a67c52;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const NavButtons = styled.div`
  margin-top: 2.5rem;
  display: flex;
  justify-content: space-between;
`;

const NavButton = styled(Link)`
  background-color: #fff4e1;
  padding: 0.8rem 1.4rem;
  border: 1px solid #dabd9f;
  border-radius: 8px;
  color: #6c4424;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    background-color: #ffeccc;
  }
`;

const ChapterLogo = styled(Link)<{ $shrink: boolean }>`
  position: fixed;
  top: 1rem;
  left: 0.5rem;
  z-index: 999;
  width: ${({ $shrink }) => ($shrink ? '50px' : '80px')};
  height: ${({ $shrink }) => ($shrink ? '50px' : '80px')};
  border-radius: 50%;
  padding: 0.3rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const ProgressBar = styled.div<{ progress: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: ${({ progress }) => progress}%;
  height: 5px;
  background-color: #a67c52;
  z-index: 9999;
`;

const FontControls = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  gap: 1rem;

  button {
    background-color: #fff4e1;
    border: 1px solid #dabd9f;
    border-radius: 6px;
    padding: 0.3rem 0.8rem;
    cursor: pointer;
  }
`;

/* ================= COMPONENT ================= */

export default function ChapterPage() {
  const { slug, chapterNumber } = useParams();
  const chapterNum = Number(chapterNumber);

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [shrink, setShrink] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const contentRef = useRef<HTMLDivElement>(null);

  /* -------- LOAD FROM GOOGLE SHEETS + DOCS -------- */
  useEffect(() => {
    if (!slug || !chapterNum) return;

    setLoading(true);

    loadSheet('chapters').then(async (chapters) => {
      const storyChapters = chapters
        .filter((c: any) => c.story_id === slug)
        .sort((a: any, b: any) => Number(a.number) - Number(b.number));

      setAllChapters(storyChapters);

      const found = storyChapters.find(
        (c: any) => Number(c.number) === chapterNum
      );

      if (!found) {
        setChapter(null);
        setLoading(false);
        return;
      }

      const html = await fetch(found.doc_url).then(res => res.text());
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const body = doc.querySelector('body');

      // ---- Extract paragraphs safely from Google Docs ----
      const paragraphs: string[] = [];

      body?.querySelectorAll('p').forEach(p => {
        const txt = p.innerText
          .replace(/\s+/g, ' ')
          .trim();

        if (
          txt &&
          !/Published using Google Docs/i.test(txt) &&
          !/Report abuse/i.test(txt) &&
          !/Learn more/i.test(txt)
        ) {
          paragraphs.push(txt);
        }
      });

      // Join paragraphs with DOUBLE newline (important)
      const text = paragraphs.join('\n\n');

      setChapter({
        number: Number(found.number),
        title: found.title,
        image: found.image,
        doc_url: found.doc_url,
        content: text,
      });

      setLoading(false);
    });
  }, [slug, chapterNum]);

  /* -------- SCROLL LOGIC -------- */
  useEffect(() => {
    const onScroll = () => {
      setShrink(window.scrollY > 40);

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) {
        setProgress(0);
      } else {
        setProgress((window.scrollY / docHeight) * 100);
      }
    };

    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);


  if (loading) {
    return (
      <ChapterWrapper>
        <ChapterContainer>Loading chapter…</ChapterContainer>
      </ChapterWrapper>
    );
  }

  if (!chapter) {
    return (
      <ChapterWrapper>
        <ChapterContainer>Chapter not found.</ChapterContainer>
      </ChapterWrapper>
    );
  }

  const paragraphs = chapter.content.split('\n').filter(Boolean);

  const index = allChapters.findIndex(
    c => Number(c.number) === chapterNum
  );
  const prev = allChapters[index - 1];
  const next = allChapters[index + 1];

  return (
    <>
      <ProgressBar progress={progress} />

      <ChapterLogo to={`/books/${slug}`} $shrink={shrink}>
        <img
          src={`${import.meta.env.BASE_URL}${chapter.image}`}
          alt={`Chapter ${chapterNum}`}
        />
      </ChapterLogo>

      <ChapterWrapper>
        <ChapterContainer ref={contentRef}>
          <ChapterNumber>Chapter {chapter.number}</ChapterNumber>
          <Title>{chapter.title}</Title>

          <FontControls>
            <button onClick={() => setFontSize(s => Math.max(14, s - 2))}>A−</button>
            <button onClick={() => setFontSize(s => Math.min(28, s + 2))}>A+</button>
          </FontControls>

          <Content fontSize={fontSize}>
            {paragraphs.map((para, idx) =>
              idx === 0 ? (
                <DropCapParagraph key={idx}>{para}</DropCapParagraph>
              ) : (
                <Paragraph key={idx}>{para}</Paragraph>
              )
            )}
          </Content>

          <NavButtons>
            {prev ? (
              <NavButton to={`/books/${slug}/chapter/${prev.number}`}>
                ← Previous
              </NavButton>
            ) : <div />}

            {next && (
              <NavButton to={`/books/${slug}/chapter/${next.number}`}>
                Next →
              </NavButton>
            )}
          </NavButtons>

          <BackLink to={`/books/${slug}`}>← Back to Chapters</BackLink>
        </ChapterContainer>
      </ChapterWrapper>
    </>
  );
}
