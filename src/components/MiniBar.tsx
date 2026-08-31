// src/components/MiniBar.tsx
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';

interface MiniBarProps {
  transparent?: boolean; // pass true only on ChapterPage (reading page)
}

/* ================= STYLED COMPONENTS ================= */

const Bar = styled.div<{ $dim: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 998;

  padding: 0.65rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  border-top: 1px solid rgba(255,255,255,${p => p.$dim ? '0.04' : '0.07'});
  background: ${p => p.$dim ? 'rgba(8,5,8,0.3)' : 'rgba(8,5,8,0.92)'};
  opacity: ${p => p.$dim ? 0.2 : 1};
  transition: opacity 0.5s ease, background 0.5s ease;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

const BarText = styled.span`
  font-size: 0.7rem;
  color: rgba(255,255,255,0.32);
  white-space: nowrap;
`;

const GoldText = styled.span`
  color: rgba(255,215,0,0.5);
`;

const RedHeart = styled.span`
  color: #c0392b;
`;

const Dot = styled.span`
  color: rgba(255,255,255,0.15);
  font-size: 0.6rem;
`;

const BarLink = styled(RouterLink)`
  font-size: 0.7rem;
  color: rgba(255,255,255,0.28);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.18s;
  &:hover { color: rgba(255,215,0,0.7); }
`;

const BarAnchor = styled.a`
  font-size: 0.7rem;
  color: rgba(255,255,255,0.28);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.18s;
  &:hover { color: rgba(255,215,0,0.7); }
`;

/* ================= COMPONENT ================= */

export default function MiniBar({ transparent = false }: MiniBarProps) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const check = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      setScrolledToBottom(scrollBottom >= pageHeight - 80);
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, [transparent]);

  // dim = transparent AND not yet scrolled to bottom
  const dim = transparent && !scrolledToBottom;

  return (
    <Bar $dim={dim}>
      <BarText>
        © 2025 <GoldText>Nanda's Story World</GoldText>. All rights reserved.
      </BarText>
      <Dot>·</Dot>
      <BarText>Made with <RedHeart>♥</RedHeart> by Nanda</BarText>
      <Dot>·</Dot>
      <BarLink to="/privacy">Privacy</BarLink>
      <Dot>·</Dot>
      <BarLink to="/terms">Terms</BarLink>
      <Dot>·</Dot>
      <BarAnchor href="mailto:pensrinanda@gmail.com">Contact</BarAnchor>
    </Bar>
  );
}
