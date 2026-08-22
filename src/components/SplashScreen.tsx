// src/components/SplashScreen.tsx
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

/* ── Animations ── */

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1);     opacity: 1;    }
  50%       { transform: scale(1.06); opacity: 0.85; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.82); }
  to   { opacity: 1; transform: scale(1);    }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

/* ── Styled Components ── */

const Backdrop = styled.div<{ $leaving: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  animation: ${({ $leaving }) => ($leaving ? fadeOut : 'none')} 0.55s ease forwards;
  pointer-events: ${({ $leaving }) => ($leaving ? 'none' : 'all')};
`;

/* Outer ring container — gives us the spinning border */
const RingWrap = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  animation: ${fadeIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  @media (min-width: 480px) {
    width: 200px;
    height: 200px;
  }
`;

/* Spinning arc — conic-gradient trick for a clean arc */
const SpinRing = styled.div`
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    transparent 60%,
    #dc143c 80%,
    #ff2a4a 100%
  );
  animation: ${spin} 1.2s linear infinite;

  /* Mask out the centre so only a thin arc shows */
  &::after {
    content: '';
    position: absolute;
    inset: 6px;
    background: #000;
    border-radius: 50%;
  }
`;

/* The avatar circle */
const AvatarCircle = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #111;
  box-shadow:
    0 0 0 3px rgba(220, 20, 60, 0.3),
    0 0 40px rgba(220, 20, 60, 0.25);
  animation: ${pulse} 2.4s ease-in-out infinite;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 15%;
  }
`;

const AppName = styled.p`
  font-family: 'Georgia', serif;
  font-size: clamp(1rem, 4vw, 1.3rem);
  color: rgba(220, 20, 60, 0.8);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  animation: ${fadeIn} 0.6s ease 0.25s both;
`;

/* ── Component ── */

interface Props {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: Props) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Show splash for 1.8 s, then start the fade-out
    const showTimer = setTimeout(() => setLeaving(true), 1800);
    // Remove from DOM after fade-out finishes (0.55 s)
    const removeTimer = setTimeout(() => onDone(), 1800 + 550);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(removeTimer);
    };
  }, [onDone]);

  return (
    <Backdrop $leaving={leaving}>
      <RingWrap>
        <SpinRing />
        <AvatarCircle>
          <img src="/images/cartoon.png" alt="StoryWorld" />
        </AvatarCircle>
      </RingWrap>

      <AppName>Story World</AppName>
    </Backdrop>
  );
}
