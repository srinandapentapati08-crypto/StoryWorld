// src/pages/books/ChapterPage.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getChapters, getChapter, getStory, type ChapterDoc } from '../../utils/loadFirestore';
import { loadSheet } from '../../utils/loadSheet';
import MiniBar from '../../components/MiniBar';

/* ================= STYLES ================= */

const AmbientBg = styled.div<{ $img?: string }>`
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: ${p => p.$img ? `url(${p.$img})` : 'none'};
  background-size: cover;
  background-position: center;
  filter: blur(40px) brightness(0.12) saturate(0.6);
  transform: scale(1.08);
`;

const ChapterWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  font-family: 'Georgia', 'Times New Roman', Times, serif;
  
  background-color: #1a1208;
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(139, 90, 43, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(80, 60, 30, 0.1) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");

  display: flex;
  justify-content: center;
  padding: 4rem 0.75rem 3rem;

  @media (min-width: 480px) {
    padding: 4.5rem 1rem 3rem;
  }

  @media (min-width: 768px) {
    padding: 5rem 2rem 3rem;
  }
`;

const ChapterContainer = styled.div`
  position: relative;
  z-index: 1;
  max-width: 780px;
  width: 100%;
  background: rgba(255, 252, 242, 0.97);
  padding: 2rem 1.25rem;
  border-radius: 16px;
  color: #1a1a1a;
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.06),
    0 8px 40px rgba(0,0,0,0.5),
    0 0 80px rgba(139,90,43,0.15);

  @media (min-width: 480px) {
    padding: 2.5rem 2rem;
  }

  @media (min-width: 768px) {
    padding: 3.5rem 3rem;
  }
`;

const Title = styled.h1`
  font-size: clamp(1.3rem, 5vw, 2.4rem);
  text-align: center;
  color: #4a2f20;
  margin-bottom: 0.5rem;
  line-height: 1.25;
`;

const ChapterNumber = styled.h2`
  font-size: clamp(0.82rem, 3vw, 1.2rem);
  text-align: center;
  color: #a67c52;
  margin-bottom: 1.5rem;
  letter-spacing: 0.03em;
`;

const Content = styled.div<{ fontSize: number }>`
  font-size: clamp(
    ${({ fontSize }) => Math.max(fontSize - 4, 14)}px,
    3.5vw,
    ${({ fontSize }) => fontSize}px
  );
  line-height: 1.8;
  text-align: left;
  hyphens: auto;

  @media (min-width: 600px) {
    text-align: justify;
  }
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

  &:hover { text-decoration: underline; }
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

  &:hover { background-color: #ffeccc; }
`;

const ChapterLogo = styled(Link)<{
  $shrink: boolean;
  $opacity: number;
  $blur: number;
  $hidden: boolean;
}>`
  position: fixed;
  top: 1rem;
  left: 0.5rem;
  z-index: 999;
  width: ${({ $shrink }) => ($shrink ? '50px' : '80px')};
  height: ${({ $shrink }) => ($shrink ? '50px' : '80px')};
  border-radius: 50%;
  padding: 0.3rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 18px rgba(99, 32, 32, 0.6);
  opacity: ${({ $opacity }) => $opacity};
  filter: blur(${({ $blur }) => $blur}px);
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
  transition:
    opacity 0.3s ease,
    filter 0.3s ease,
    width 0.3s ease,
    height 0.3s ease;

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
  transition: width 0.1s linear;
`;

const FontControls = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  gap: 0.75rem;

  button {
    background-color: #fff4e1;
    border: 1px solid #dabd9f;
    border-radius: 8px;
    padding: 0.55rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    color: #6c4424;
    min-width: 44px;
    min-height: 44px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #ffeccc;
    }

    &:active {
      background-color: #ffd899;
    }
  }
`;

function getImgSrc(raw: string) {
  if (!raw) return '';
  if (raw.startsWith('http')) return raw;
  return `${import.meta.env.BASE_URL}${raw}`;
}

/* ================= COMPONENT ================= */

export default function ChapterPage() {
  const { slug, chapterNumber } = useParams();
  const chapterNum = Number(chapterNumber);

  const [chapter, setChapter] = useState<ChapterDoc | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [shrink, setShrink] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const [storyCover, setStoryCover] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [logoBlur, setLogoBlur] = useState(0);
  const [hideLogo, setHideLogo] = useState(false);

  /* -------- LOAD STORY COVER FOR AMBIENT BG -------- */
  useEffect(() => {
    if (!slug) return;
    getStory(slug)
      .then((story) => {
        if (story?.image) setStoryCover(getImgSrc(story.image));
      })
      .catch(() => {/* ignore — ambient bg is decorative */});
  }, [slug]);

  /* -------- LOAD FROM FIRESTORE (with Google Sheets fallback) -------- */
  useEffect(() => {
    if (!slug || !chapterNum) return;
    setLoading(true);

    // Try to get this specific chapter and all chapters for navigation
    Promise.all([
      getChapter(slug, chapterNum),
      getChapters(slug)
    ])
      .then(async ([chapter, allChapters]) => {
        if (chapter && allChapters.length > 0) {
          // Check if chapter has doc_url and needs content fetching
          let finalChapter = chapter;
          if (chapter.doc_url && !chapter.content) {
            try {
              const html = await fetch(chapter.doc_url).then((r) => r.text());
              const docDom = new DOMParser().parseFromString(html, 'text/html');
              const paragraphs: string[] = [];
              docDom.querySelectorAll('p').forEach((p) => {
                const txt = p.innerText.replace(/\s+/g, ' ').trim();
                if (
                  txt &&
                  !/Published using Google Docs/i.test(txt) &&
                  !/Report abuse/i.test(txt) &&
                  !/Learn more/i.test(txt)
                ) {
                  paragraphs.push(txt);
                }
              });
              finalChapter = { ...chapter, content: paragraphs.join('\n\n') };
            } catch {
              // Keep original chapter if doc fetch fails
            }
          }
          setChapter(finalChapter);
          setAllChapters(allChapters);
          setLoading(false);
        } else {
          return fallbackToSheets();
        }
      })
      .catch(() => fallbackToSheets());

    async function fallbackToSheets() {
      // Same Google Sheets fallback logic as before...
      const sheetChapters = await loadSheet('chapters');
      const storyChapters = (sheetChapters as any[])
        .filter((c) => c.story_id === slug)
        .sort((a, b) => Number(a.number) - Number(b.number));

      const firestoreLike: ChapterDoc[] = storyChapters.map((c) => ({
        id: String(c.number),
        story_id: slug!,
        number: Number(c.number),
        title: c.title,
        image: c.image ?? '',
        content: '',
        doc_url: c.doc_url,
      }));

      setAllChapters(firestoreLike);

      const found = storyChapters.find((c) => Number(c.number) === chapterNum);
      if (!found) {
        setChapter(null);
        setLoading(false);
        return;
      }

      // Fetch content from Google Doc URL
      let content = '';
      if (found.doc_url) {
        try {
          const html = await fetch(found.doc_url).then((r) => r.text());
          const docDom = new DOMParser().parseFromString(html, 'text/html');
          const paragraphs: string[] = [];
          docDom.querySelectorAll('p').forEach((p) => {
            const txt = p.innerText.replace(/\s+/g, ' ').trim();
            if (
              txt &&
              !/Published using Google Docs/i.test(txt) &&
              !/Report abuse/i.test(txt) &&
              !/Learn more/i.test(txt)
            ) {
              paragraphs.push(txt);
            }
          });
          content = paragraphs.join('\n\n');
        } catch {
          content = found.content ?? '';
        }
      } else {
        content = found.content ?? '';
      }

      setChapter({
        id: String(found.number),
        story_id: slug!,
        number: Number(found.number),
        title: found.title,
        image: found.image ?? '',
        content,
        doc_url: found.doc_url,
      });
      setLoading(false);
    }
  }, [slug, chapterNum]);

  /* -------- SCROLL LOGIC -------- */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const width = window.innerWidth;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (y / docHeight) * 100 : 0);

      const firstPara = document.querySelector('p');
      const paraTop = firstPara
        ? firstPara.getBoundingClientRect().top + window.scrollY
        : 200;

      if (width < 768) {
        setShrink(false);
        if (y > paraTop - 60) { setHideLogo(true); return; }
        setHideLogo(false);
        const fade = Math.min(y / 160, 1);
        setLogoOpacity(1 - fade * 0.5);
        setLogoBlur(fade * 3);
      } else if (width < 1024) {
        setHideLogo(false);
        setShrink(y > 40);
        setLogoOpacity(1);
        setLogoBlur(0);
      } else {
        setHideLogo(false);
        setShrink(y > 40);
        setLogoOpacity(1);
        setLogoBlur(0);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <>
        {storyCover && <AmbientBg $img={storyCover} />}
        <ChapterWrapper>
          <ChapterContainer>Loading chapter…</ChapterContainer>
        </ChapterWrapper>
      </>
    );
  }

  if (!chapter) {
    return (
      <>
        {storyCover && <AmbientBg $img={storyCover} />}
        <ChapterWrapper>
          <ChapterContainer>Chapter not found.</ChapterContainer>
        </ChapterWrapper>
      </>
    );
  }

  const paragraphs = chapter.content.split('\n').filter(Boolean);
  const index = allChapters.findIndex((c) => c.number === chapterNum);
  const prev = allChapters[index - 1];
  const next = allChapters[index + 1];

  return (
    <>
      <ProgressBar progress={progress} />

      {storyCover && <AmbientBg $img={storyCover} />}

      <ChapterLogo
        to={`/books/${slug}`}
        $shrink={shrink}
        $opacity={logoOpacity}
        $blur={logoBlur}
        $hidden={hideLogo}
      >
        <img 
          src={getImgSrc(chapter.image)} 
          alt="Story logo"
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/cartoon.png'; }}
        />
      </ChapterLogo>

      <ChapterWrapper>
        <ChapterContainer ref={contentRef}>
          <ChapterNumber>Chapter {chapter.number}</ChapterNumber>
          <Title>{chapter.title}</Title>

          <FontControls>
            <button onClick={() => setFontSize((s) => Math.max(14, s - 2))}>A−</button>
            <button onClick={() => setFontSize((s) => Math.min(28, s + 2))}>A+</button>
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
            ) : (
              <div />
            )}
            {next && (
              <NavButton to={`/books/${slug}/chapter/${next.number}`}>
                Next →
              </NavButton>
            )}
          </NavButtons>

          <BackLink to={`/books/${slug}`}>← Back to Chapters</BackLink>
        </ChapterContainer>
      </ChapterWrapper>
      <MiniBar transparent />
    </>
  );
}
