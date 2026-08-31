// src/components/Footer.tsx
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';

interface FooterProps {
  stories: { id: string; title: string; comingSoon: boolean }[];
}

/* ================= STYLED COMPONENTS ================= */

const FooterWrap = styled.footer`
  background: linear-gradient(to bottom, transparent 0%, rgba(8,5,8,0.98) 100%);
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 3.5rem clamp(1.5rem, 6vw, 5rem) 0.75rem;
  margin-top: 4rem;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 1fr 1fr 1fr;
  gap: 2.5rem;
  margin-bottom: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    margin-bottom: 0.75rem;
  }
`;

const BrandCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  @media (max-width: 768px) {
    grid-column: 1 / -1;
  }
`;

const FooterLogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FooterLogo = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid rgba(255,215,0,0.25);
  box-shadow: 0 0 16px rgba(143,3,3,0.3);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BrandName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
`;

const BrandTagline = styled.div`
  font-size: 0.72rem;
  color: rgba(255,215,0,0.55);
  letter-spacing: 0.05em;
`;

const BrandDesc = styled.p`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.35);
  line-height: 1.65;
  max-width: 280px;
`;

const EmailBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.5);
  font-size: 0.76rem;
  text-decoration: none;
  width: fit-content;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(255,215,0,0.35);
    color: #ffd700;
    background: rgba(255,215,0,0.06);
  }
`;

const ColTitle = styled.h4`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-bottom: 1rem;
`;

const ColLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const ColLink = styled(RouterLink)`
  font-size: 0.82rem;
  color: rgba(255,255,255,0.42);
  text-decoration: none;
  transition: color 0.18s;
  &:hover { color: #ffd700; }
`;

const ColAnchor = styled.a`
  font-size: 0.82rem;
  color: rgba(255,255,255,0.42);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.18s;
  &:hover { color: #ffd700; }
`;

const ColMuted = styled.span`
  font-size: 0.82rem;
  color: rgba(255,255,255,0.2);
  font-style: italic;
`;

const FooterDivider = styled.div`
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent);
  margin: 0 0 0.75rem 0;
`;

const BottomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
`;

const Copyright = styled.p`
  font-size: 0.74rem;
  color: rgba(255,255,255,0.4);
  span { color: rgba(255,215,0,0.6); }
`;

const MadeWith = styled.p`
  font-size: 0.73rem;
  color: rgba(255,255,255,0.35);
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const Heart = styled.span`color: #c0392b;`;

const LegalLinks = styled.div`
  display: flex;
  gap: 1.25rem;
`;

const LegalLink = styled(RouterLink)`
  font-size: 0.72rem;
  color: rgba(255,255,255,0.35);
  text-decoration: none;
  transition: color 0.18s;
  &:hover { color: rgba(255,255,255,0.7); }
`;

const LegalAnchor = styled.a`
  font-size: 0.72rem;
  color: rgba(255,255,255,0.35);
  text-decoration: none;
  transition: color 0.18s;
  &:hover { color: rgba(255,255,255,0.7); }
`;

/* ================= COMPONENT ================= */

export default function Footer({ stories }: FooterProps) {
  return (
    <FooterWrap>
      <FooterGrid>

        {/* Brand */}
        <BrandCol>
          <FooterLogoRow>
            <FooterLogo>
              <img src={`${import.meta.env.BASE_URL}images/cartoon.png`} alt="logo" />
            </FooterLogo>
            <div>
              <BrandName>Nanda's Story World</BrandName>
              <BrandTagline>Every story matters</BrandTagline>
            </div>
          </FooterLogoRow>
          <BrandDesc>
            A personal space for stories that linger — thrillers, fantasies,
            and worlds beyond imagination. Written with heart, shared with love.
          </BrandDesc>
          <EmailBtn href="mailto:pensrinanda@gmail.com">
            ✉ Email
          </EmailBtn>
        </BrandCol>

        {/* Stories */}
        <div>
          <ColTitle>Stories</ColTitle>
          <ColLinks>
            {stories
              .filter((s) => !s.comingSoon)
              .map((s) => (
                <ColLink key={s.id} to={`/books/${s.id}`}>
                  {s.title}
                </ColLink>
              ))}
            {stories.some((s) => s.comingSoon) && (
              <ColMuted>More coming…</ColMuted>
            )}
          </ColLinks>
        </div>

        {/* Navigate */}
        <div>
          <ColTitle>Navigate</ColTitle>
          <ColLinks>
            <ColLink to="/">Home</ColLink>
            <ColAnchor href="#feedback">Leave Feedback</ColAnchor>
            <ColLink to="/about">About the Author</ColLink>
          </ColLinks>
        </div>

        {/* About */}
        <div>
          <ColTitle>About</ColTitle>
          <ColLinks>
            <ColLink to="/about">About the Author</ColLink>
            <ColLink to="/privacy">Privacy Policy</ColLink>
            <ColLink to="/terms">Terms of Use</ColLink>
            <ColAnchor href="mailto:pensrinanda@gmail.com">Contact</ColAnchor>
          </ColLinks>
        </div>

      </FooterGrid>

      <FooterDivider />

      <BottomBar>
        <Copyright>
          © 2025 <span>Nanda's Story World</span>. All rights reserved.
        </Copyright>
        <MadeWith>
          Made with <Heart>♥</Heart> by Nanda
        </MadeWith>
        <LegalLinks>
          <LegalLink to="/privacy">Privacy</LegalLink>
          <LegalLink to="/terms">Terms</LegalLink>
          <LegalAnchor href="mailto:pensrinanda@gmail.com">Contact</LegalAnchor>
        </LegalLinks>
      </BottomBar>
    </FooterWrap>
  );
}
