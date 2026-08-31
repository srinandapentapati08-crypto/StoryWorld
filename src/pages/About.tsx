// src/pages/About.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaEnvelope, FaInstagram, FaHome } from 'react-icons/fa';
import MiniBar from '../components/MiniBar';

/* ── Animations ── */

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 40px rgba(192,57,43,0.4), 0 0 80px rgba(192,57,43,0.18), 0 24px 60px rgba(0,0,0,0.7); }
  50%       { box-shadow: 0 0 65px rgba(192,57,43,0.6), 0 0 130px rgba(192,57,43,0.28), 0 24px 60px rgba(0,0,0,0.7); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const rotateIn = keyframes`
  from { opacity: 0; transform: rotateY(-25deg) scale(0.94); }
  to   { opacity: 1; transform: rotateY(0deg)   scale(1); }
`;

/* ── Layout ── */

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #080808;
  color: #eee;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(8, 8, 8, 0.88);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s;
  font-family: inherit;
  &:hover { color: #fff; }
`;

const NavLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255,255,255,0.45);
`;

/* ── Floating circle — fixed top-LEFT, shrinks like the logo on other pages ── */

const FloatingCircle = styled.div<{ $visible: boolean; $shrunk: boolean }>`
  position: fixed;
  top: ${(p) => (p.$shrunk ? '0.75rem' : '1rem')};
  left: ${(p) => (p.$shrunk ? '0.75rem' : '1rem')};
  z-index: 300;
  width: ${(p) => (p.$shrunk ? '40px' : '56px')};
  height: ${(p) => (p.$shrunk ? '40px' : '56px')};
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 0 18px rgba(192, 57, 43, 0.6);
  border: 2px solid rgba(192, 57, 43, 0.5);
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  transition: opacity 0.35s ease, transform 0.35s ease, width 0.3s ease, height 0.3s ease, top 0.3s ease;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transform: ${(p) => (p.$visible ? 'scale(1)' : 'scale(0.5)')};
  pointer-events: ${(p) => (p.$visible ? 'all' : 'none')};

  &:hover { transform: scale(1.12); }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }
`;

/* ── Hero section ── */

const HeroSection = styled.section`
  padding: 7rem 1.5rem 3.5rem;
  text-align: center;
  animation: ${fadeUp} 0.6s ease both;
`;

const HeroEyebrow = styled.p`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #c0a060;
  margin-bottom: 0.9rem;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
`;

const HeroSub = styled.p`
  font-size: clamp(0.95rem, 2.5vw, 1.15rem);
  color: rgba(255,255,255,0.38);
  font-style: italic;
`;

const HeroDivider = styled.div`
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #c0392b, transparent);
  border-radius: 2px;
  margin: 1.5rem auto 0;
`;

/* ── Main content area ── */

const Content = styled.main`
  flex: 1;
  padding: 0 1.25rem 3rem;
  max-width: 820px;
  margin: 0 auto;
  width: 100%;

  @media (min-width: 768px) {
    padding: 0 2rem 4rem;
  }
`;

/* ── Author Card ── */

const CardWrap = styled.div`
  perspective: 1400px;
  margin-bottom: 3.5rem;
  animation: ${rotateIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
`;

const AuthorCard = styled.div`
  position: relative;
  width: 100%;
  background: linear-gradient(135deg, #1c1c1c 0%, #111 55%, #0d0d0d 100%);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  overflow: hidden;
  animation: ${glowPulse} 4s ease-in-out infinite;
  transform-style: preserve-3d;
`;

/* Shimmer sweep */
const CardShimmer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    105deg,
    transparent 35%,
    rgba(255,255,255,0.035) 50%,
    transparent 65%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 3.5s infinite linear;
`;

/* Spiderman — dedicated right column on tablet/desktop */
const SpiderCol = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
    flex-shrink: 0;
    width: 200px;
    position: relative;
    overflow: hidden;

    /* Use ::after so we can apply mask-image + mix-blend-mode together */
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url('/images/spiderman.png');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center top;
      opacity: 0.72;
      filter: saturate(1.3) brightness(1.1) contrast(1.05);
      mix-blend-mode: normal;

      /* Fade the left edge so Spidey dissolves into the card content */
      mask-image: linear-gradient(
        to right,
        transparent 0%,
        rgba(0,0,0,0.5) 25%,
        black 60%
      );
      -webkit-mask-image: linear-gradient(
        to right,
        transparent 0%,
        rgba(0,0,0,0.5) 25%,
        black 60%
      );
    }
  }

  @media (min-width: 1024px) {
    width: 240px;
  }
`;

const CardInner = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: stretch;
    min-height: 260px;
  }
`;

/* Left photo — full-width banner on mobile, column on desktop */
const PhotoCol = styled.div`
  width: 100%;
  height: 260px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    width: 240px;
    height: auto;
    min-height: 260px;
    overflow: visible;
  }

  @media (min-width: 1024px) {
    width: 280px;
  }
`;

const AuthorPhoto = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('/images/author.jpeg');
  background-size: cover;
  background-position: center 18%;

  @media (min-width: 768px) {
    /* Desktop: fade right edge into card background */
    mask-image: linear-gradient(to right, rgba(0,0,0,1) 75%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 75%, transparent 100%);
  }
`;

/* Spiderman on mobile — absolute over AuthorCard, real <img>, no masks */
const SpiderMobileOverlay = styled.div`
  display: none;

  @media (max-width: 767px) {
    display: block;
    position: absolute;
    z-index: 5;
    pointer-events: none;
    right: 0;
    bottom: -24px;
    width: clamp(110px, 32vw, 155px);

    img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: contain;
      filter: brightness(1.12) saturate(1.45)
        drop-shadow(0 0 10px rgba(192, 57, 43, 0.6))
        drop-shadow(0 0 28px rgba(192, 57, 43, 0.3));
    }
  }

  /* Below 375px: smaller but still visible */
  @media (max-width: 374px) {
    right: 0;
    bottom: -16px;
    width: clamp(72px, 24vw, 100px);
  }
`;

/* Info col — middle */
const InfoCol = styled.div`
  flex: 1;
  padding: 1.25rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    padding: 2rem 1.25rem 2rem 1rem;
  }
`;

const AuthorName = styled.h2`
  font-size: clamp(1.1rem, 4vw, 1.85rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 0.2rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: clamp(0.75rem, 2.5vw, 0.84rem);
  color: rgba(255,255,255,0.45);

  span { color: rgba(255,255,255,0.72); }
`;

const RedLine = styled.div`
  width: 36px;
  height: 2px;
  background: linear-gradient(to right, #c0392b, transparent);
  border-radius: 2px;
  margin: 0.3rem 0;
`;

const SocialRow = styled.div`
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  margin-top: 0.3rem;
`;

const SocialBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.42rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.04);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
    border-color: rgba(255,255,255,0.25);
  }
`;

/* ── Bio ── */

const BioSection = styled.section`
  max-width: 780px;
  margin: 0 auto;
  animation: ${fadeUp} 0.6s ease 0.25s both;
`;

const BioLabel = styled.p`
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255,255,255,0.22);
  text-transform: uppercase;
  letter-spacing: 1.6px;
  margin-bottom: 1.25rem;
`;

const BioText = styled.p`
  font-size: clamp(0.93rem, 2.2vw, 1.05rem);
  line-height: 1.9;
  color: rgba(255,255,255,0.6);
  margin-bottom: 1.3rem;

  &:first-of-type::first-letter {
    float: left;
    font-size: 3.2rem;
    font-family: 'Georgia', serif;
    line-height: 0.82;
    margin-right: 0.38rem;
    color: #c0392b;
    font-weight: 700;
  }
`;

const Quote = styled.blockquote`
  border-left: 3px solid #c0392b;
  padding: 0.8rem 1.25rem;
  margin: 2rem 0;
  background: rgba(192,57,43,0.06);
  border-radius: 0 10px 10px 0;
  font-style: italic;
  font-size: clamp(0.93rem, 2.2vw, 1.08rem);
  color: rgba(255,255,255,0.5);
  line-height: 1.75;
`;

/* ── Component ── */

export default function About() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 300);
      setShrunk(y > 400); // shrinks slightly after initial appearance
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <PageWrapper>
      {/* Fixed top bar */}
      <TopBar>
        <BackBtn onClick={() => navigate('/')}>
          <FaHome /> Home
        </BackBtn>
        <NavLabel>About the Author</NavLabel>
      </TopBar>

      {/* Floating circle — top-LEFT, shrinks like logo on other pages */}
      <FloatingCircle $visible={scrolled} $shrunk={shrunk} onClick={scrollToTop} title="Back to top">
        <img src="/images/author.jpeg" alt="Srinanda Pentapati" />
      </FloatingCircle>

      {/* Hero heading */}
      <HeroSection>
        <HeroEyebrow>The Mind Behind the Stories</HeroEyebrow>
        <HeroTitle>About the Author</HeroTitle>
        <HeroSub>The person behind every word, every world.</HeroSub>
        <HeroDivider />
      </HeroSection>

      <Content>
        {/* Author card */}
        <CardWrap>
          <AuthorCard>
            <CardShimmer />
            {/* Mobile Spiderman — absolute over AuthorCard, clipped by its overflow:hidden */}
            <SpiderMobileOverlay>
              <img src="/images/spiderman.png" alt="" aria-hidden="true" />
            </SpiderMobileOverlay>
            <CardInner>
              <PhotoCol>
                <AuthorPhoto />
              </PhotoCol>
              <InfoCol>
                <AuthorName>Srinanda Pentapati</AuthorName>
                <InfoRow>📍 <span>Andhra Pradesh, India</span></InfoRow>
                <InfoRow>💼 <span>Software Engineer · Storyteller · Photographer</span></InfoRow>
                <InfoRow>📞 <span>+91 73822 26128</span></InfoRow>
                <RedLine />
                <SocialRow>
                  <SocialBtn
                    href="https://www.instagram.com/srinanda_pentapati"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram /> Instagram
                  </SocialBtn>
                  <SocialBtn href="mailto:srinandapentapati@gmail.com">
                    <FaEnvelope /> Email
                  </SocialBtn>
                </SocialRow>
              </InfoCol>
              <SpiderCol />
            </CardInner>
          </AuthorCard>
        </CardWrap>

        {/* Bio */}
        <BioSection>
          <BioLabel>In His Own Words</BioLabel>

          <BioText>
            Srinanda Pentapati is a software engineer from Andhra Pradesh, India, whose imagination
            refuses to stay confined to lines of code. With a passion for storytelling that spans
            multiple genres — from the fantastical to the deeply human — he built Story World as a
            personal platform to bring those narratives to life and place them in the hands of
            readers everywhere.
          </BioText>

          <BioText>
            Every story begins with a spark — a fleeting thought, a vivid dream, a moment that
            won't let go. His writing lives in that space between the familiar and the
            extraordinary, weaving worlds that feel both invented and intimately real. Beyond
            writing, a love of photography adds another lens through which the world is observed
            and captured — one frame, one story at a time.
          </BioText>

          <Quote>
            "Imagination is not an escape from reality — it is the most honest way to understand
            it. Every story I write is a piece of a world I wish existed, and an invitation for
            you to live in it for a while."
            <br /><br />
            — Srinanda Pentapati
          </Quote>

          <BioText>
            Story World was designed, developed, and launched entirely solo — a testament to the
            belief that a single person with a vision can create something meaningful. It is more
            than a website; it is a stage for stories that deserve to be told, and a reminder that
            the greatest adventures have always begun with a single page.
          </BioText>
        </BioSection>
      </Content>
      <MiniBar />
    </PageWrapper>
  );
}
