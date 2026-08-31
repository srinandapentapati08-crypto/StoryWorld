// src/pages/Privacy.tsx
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

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>
          <FaHome /> Home
        </BackBtn>
        <NavLabel>Privacy Policy</NavLabel>
      </TopBar>

      <Content>
        <PageTitle>Privacy Policy</PageTitle>
        <LastUpdated>Last updated: 2025</LastUpdated>

        <Section>
          <SectionTitle>What We Collect</SectionTitle>
          <Body>
            When you sign in with Google, we store your display name, email, and profile photo
            via Firebase Authentication. When you submit feedback, we store your star rating and
            optional message, linked to the stories you selected — not to your personal identity.
          </Body>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>How We Use It</SectionTitle>
          <Body>
            Authentication data is used solely to identify you as a logged-in reader. Feedback
            data is used to display aggregate ratings on story cards and to help the author
            understand reader preferences.
          </Body>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>Third Parties</SectionTitle>
          <Body>
            This site uses Firebase (by Google) for authentication and data storage. Google's
            privacy policy applies to their services. No other third-party services receive your
            data.
          </Body>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>Your Rights</SectionTitle>
          <Body>
            You may request deletion of your data at any time by contacting{' '}
            <a href="mailto:pensrinanda@gmail.com">pensrinanda@gmail.com</a>.
          </Body>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>Cookies</SectionTitle>
          <Body>
            Firebase uses browser storage to maintain your authentication session. No advertising
            or tracking cookies are used.
          </Body>
        </Section>
      </Content>

      <MiniBar />
    </PageWrapper>
  );
}
