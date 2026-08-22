// src/components/Footer.tsx
import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';

/* ── Animations ── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── Styled ── */

const FooterBar = styled.footer<{ $opacity: number; $solid: boolean }>`
  width: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem 1.25rem;
  font-size: 0.75rem;
  font-family: 'Inter', sans-serif;
  position: relative;
  z-index: 10;
  transition: opacity 0.5s ease, background 0.5s ease;
  opacity: ${(p) => p.$opacity};

  ${(p) =>
    p.$solid
      ? css`
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        `
      : css`
          background: transparent;
        `}
`;

const Copy = styled.span`
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
`;

const Heart = styled.span`
  color: #c0392b;
`;

const Sep = styled.span`
  color: rgba(255, 255, 255, 0.2);
`;

const FooterLink = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
  font-family: inherit;
  &:hover { color: rgba(255, 255, 255, 0.85); }
`;

const AboutLink = styled(Link)`
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  text-decoration: none;
  transition: color 0.2s;
  &:hover { color: rgba(255, 255, 255, 0.85); }
`;

/* ── Modals ── */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalBox = styled.div`
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  max-width: 560px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 2rem 1.75rem;
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.75;
  animation: ${fadeIn} 0.25s ease;

  h2 { color: #fff; font-size: 1.15rem; margin-bottom: 1.25rem; }
  h3 { color: #ffd700; font-size: 0.88rem; margin: 1.25rem 0 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; }
  p  { margin-bottom: 0.75rem; }
  a  { color: #ffd700; text-decoration: underline; }
`;

const CloseBtn = styled.button`
  float: right;
  background: none;
  border: none;
  color: #888;
  font-size: 1.4rem;
  cursor: pointer;
  line-height: 1;
  margin: -0.25rem -0.25rem 0 0;
  &:hover { color: #fff; }
`;

function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={onClose}>×</CloseBtn>
        <h2>Terms of Use</h2>
        <p>Last updated: {new Date().getFullYear()}</p>
        <h3>1. Access</h3>
        <p>This platform is a personal creative project by Srinanda Pentapati. Access is provided free of charge for personal, non-commercial reading enjoyment.</p>
        <h3>2. Content Ownership</h3>
        <p>All stories, characters, and written content on Story World are original works owned by Srinanda Pentapati. You may not copy, reproduce, distribute, or publish any content without prior written permission.</p>
        <h3>3. User Conduct</h3>
        <p>By accessing this site you agree not to misuse the platform, attempt to gain unauthorized access, or engage in any activity that disrupts the service.</p>
        <h3>4. Feedback</h3>
        <p>Feedback and ratings submitted through this platform may be used to improve the site and stories. They will not be shared publicly with your personal information.</p>
        <h3>5. Changes</h3>
        <p>These terms may be updated at any time. Continued use of the platform implies acceptance of the current terms.</p>
        <h3>6. Contact</h3>
        <p>Questions? Reach out at <a href="mailto:srinandapentapati@gmail.com">srinandapentapati@gmail.com</a>.</p>
      </ModalBox>
    </Overlay>
  );
}

function PrivacyModal({ onClose }: { onClose: () => void }) {
  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={onClose}>×</CloseBtn>
        <h2>Privacy Policy</h2>
        <p>Last updated: {new Date().getFullYear()}</p>
        <h3>What We Collect</h3>
        <p>When you sign in with Google, we store your display name, email, and profile photo via Firebase Authentication. When you submit feedback, we store your star rating and optional message, linked to the stories you selected — not to your personal identity.</p>
        <h3>How We Use It</h3>
        <p>Authentication data is used solely to identify you as a logged-in reader. Feedback data is used to display aggregate ratings on story cards and to help the author understand reader preferences.</p>
        <h3>Third Parties</h3>
        <p>This site uses Firebase (by Google) for authentication and data storage. Google's privacy policy applies to their services. No other third-party services receive your data.</p>
        <h3>Your Rights</h3>
        <p>You may request deletion of your data at any time by contacting <a href="mailto:srinandapentapati@gmail.com">srinandapentapati@gmail.com</a>.</p>
        <h3>Cookies</h3>
        <p>Firebase uses browser storage to maintain your authentication session. No advertising or tracking cookies are used.</p>
      </ModalBox>
    </Overlay>
  );
}

function ContactModal({ onClose }: { onClose: () => void }) {
  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={onClose}>×</CloseBtn>
        <h2>Contact</h2>
        <p>Have a question, suggestion, or just want to say hello?</p>
        <h3>Email</h3>
        <p><a href="mailto:srinandapentapati@gmail.com">srinandapentapati@gmail.com</a></p>
        <h3>Instagram</h3>
        <p><a href="https://www.instagram.com/srinanda_pentapati" target="_blank" rel="noopener noreferrer">@srinanda_pentapati</a></p>
        <h3>Phone</h3>
        <p>+91 73822 26128</p>
        <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>Response time is usually within 48 hours.</p>
      </ModalBox>
    </Overlay>
  );
}

/* ── Scroll-aware wrapper for chapter pages ── */

function ChapterFooter() {
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const check = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      // "at bottom" = within 60px of the very bottom
      setAtBottom(total - scrolled < 60);
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, []);

  const [modal, setModal] = useState<'terms' | 'privacy' | 'contact' | null>(null);

  return (
    <>
      <FooterBar $opacity={atBottom ? 1 : 0.15} $solid={atBottom}>
        <Copy>© {new Date().getFullYear()} Story World · Made with <Heart>♥</Heart> by Nanda</Copy>
        <Sep>·</Sep>
        <AboutLink to="/about">About</AboutLink>
        <Sep>·</Sep>
        <FooterLink onClick={() => setModal('privacy')}>Privacy</FooterLink>
        <Sep>·</Sep>
        <FooterLink onClick={() => setModal('terms')}>Terms</FooterLink>
        <Sep>·</Sep>
        <FooterLink onClick={() => setModal('contact')}>Contact</FooterLink>
      </FooterBar>
      {modal === 'terms'   && <TermsModal   onClose={() => setModal(null)} />}
      {modal === 'privacy' && <PrivacyModal onClose={() => setModal(null)} />}
      {modal === 'contact' && <ContactModal onClose={() => setModal(null)} />}
    </>
  );
}

/* ── Main export ── */

type ModalType = 'terms' | 'privacy' | 'contact' | null;

export default function Footer({ transparent }: { transparent?: boolean }) {
  const { pathname } = useLocation();
  const isChapter = /\/books\/.+\/chapter\//.test(pathname);

  // Chapter pages get scroll-aware footer
  if (transparent ?? isChapter) return <ChapterFooter />;

  const [modal, setModal] = useState<ModalType>(null);

  return (
    <>
      <FooterBar $opacity={1} $solid={true}>
        <Copy>© {new Date().getFullYear()} Story World · Made with <Heart>♥</Heart> by Nanda</Copy>
        <Sep>·</Sep>
        <AboutLink to="/about">About</AboutLink>
        <Sep>·</Sep>
        <FooterLink onClick={() => setModal('privacy')}>Privacy</FooterLink>
        <Sep>·</Sep>
        <FooterLink onClick={() => setModal('terms')}>Terms</FooterLink>
        <Sep>·</Sep>
        <FooterLink onClick={() => setModal('contact')}>Contact</FooterLink>
      </FooterBar>
      {modal === 'terms'   && <TermsModal   onClose={() => setModal(null)} />}
      {modal === 'privacy' && <PrivacyModal onClose={() => setModal(null)} />}
      {modal === 'contact' && <ContactModal onClose={() => setModal(null)} />}
    </>
  );
}
