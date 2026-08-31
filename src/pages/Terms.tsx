// src/pages/Terms.tsx
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome } from 'react-icons/fa';
import MiniBar from '../components/MiniBar';

/* ================= STYLES ================= */

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #080808;
  color: #eee;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(8,8,8,0.92);
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
  color: rgba(255,255,255,0.35);
`;

const Content = styled.main`
  flex: 1;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;

  @media (min-width: 768px) {
    padding: 4rem 2rem 5rem;
  }
`;

const PageTitle = styled.h1`
  font-size: clamp(1.6rem, 5vw, 2.4rem);
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const LastUpdated = styled.p`
  font-size: 0.78rem;
  color: rgba(255,255,255,0.28);
  margin-bottom: 2.5rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,215,0,0.6);
  margin-bottom: 0.75rem;
`;

const Body = styled.p`
  font-size: 0.92rem;
  line-height: 1.85;
  color: rgba(255,255,255,0.52);

  a {
    color: rgba(255,215,0,0.7);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255,255,255,0.06);
  margin: 2rem 0;
`;

/* ================= COMPONENT ================= */

export default function Terms() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>
          <FaHome /> Home
        </BackBtn>
        <NavLabel>Terms of Use</NavLabel>
      </TopBar>

      <Content>
        <PageTitle>Terms of Use</PageTitle>
        <LastUpdated>Last updated: 2025</LastUpdated>

        <Section>
          <SectionTitle>1. Access</SectionTitle>
          <Body>
            This platform is a personal creative project by Srinanda Pentapati. Access is provided
            free of charge for personal, non-commercial reading enjoyment.
          </Body>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>2. Content Ownership</SectionTitle>
          <Body>
            All stories, characters, and written content on Story World are original works owned
            by Srinanda Pentapati. You may not copy, reproduce, distribute, or publish any content
            without prior written permission.
          </Body>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>3. User Conduct</SectionTitle>
          <Body>
            By accessing this site you agree not to misuse the platform, attempt to gain
            unauthorized access, or engage in any activity that disrupts the service.
          </Body>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>4. Feedback</SectionTitle>
          <Body>
            Feedback and ratings submitted through this platform may be used to improve the site
            and stories. They will not be shared publicly with your personal information.
          </Body>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>5. Changes</SectionTitle>
          <Body>
            These terms may be updated at any time. Continued use of the platform implies
            acceptance of the current terms.
          </Body>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>6. Contact</SectionTitle>
          <Body>
            Questions? Reach out at{' '}
            <a href="mailto:pensrinanda@gmail.com">pensrinanda@gmail.com</a>.
          </Body>
        </Section>
      </Content>

      <MiniBar />
    </PageWrapper>
  );
}
