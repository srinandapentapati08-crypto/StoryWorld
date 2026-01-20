import styled from "styled-components";
import BookCard from "../components/BookCard";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { loadSheet } from "../utils/loadSheet";

/* ================= TYPES ================= */

type Story = {
  id: string;
  title: string;
  tagline: string;
  image: string;
  genre?: string;
  comingSoon?: string; // from Sheets, it's "TRUE"/"FALSE"
};


/* ================= STYLES ================= */

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const LogoContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "$isshrunk",
})<{ $isshrunk: boolean }>`
  position: fixed;
  top: 3rem;
  left: 1rem;
  z-index: 999;
  width: ${(p) => (p.$isshrunk ? "55px" : "100px")};
  height: ${(p) => (p.$isshrunk ? "55px" : "100px")};
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 20px rgba(143, 3, 3, 0.41);
  padding: 0.4rem;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
&:hover {
    transform: scale(1.20);
  }
position: fixed;
  z-index: 999;
  left: 1rem;
  top: 1rem;

  width: ${(p) => (p.$isshrunk ? "44px" : "64px")};
  height: ${(p) => (p.$isshrunk ? "44px" : "64px")};

  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 20px rgba(143, 3, 3, 0.41);
  padding: 0.3rem;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  cursor: pointer;

`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background-image: url('story-world-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
`;

const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.72);
  min-height: 100vh;
  padding: 4rem 2rem;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 3rem;
  color: #fff;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #ccc;
  max-width: 700px;
  margin: 0 auto 3rem;
  font-size: 1.25rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
`;

/* ================= COMPONENT ================= */

export default function Home() {
  const [$isshrunk, setIsShrunk] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const onScroll = () => setIsShrunk(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* LOAD STORIES FROM GOOGLE SHEETS */
  useEffect(() => {
    loadSheet("stories").then((rows) => {
      console.log("Stories from sheet:", rows);
      setStories(rows as Story[]);
    });
  }, []);

  return (
    <>
      <LogoContainer $isshrunk={$isshrunk}>
        <img src={`${import.meta.env.BASE_URL}images/cartoon.png`} />
      </LogoContainer>

      <PageWrapper>
        <Overlay>
          <TitleRow>
            <Title style={{ fontSize: $isshrunk ? "2rem" : "3rem" }}>
              Welcome to Nanda’s Story World
            </Title>
          </TitleRow>

          <Subtitle>
            Discover immersive tales that transport you beyond imagination.
          </Subtitle>

          <GridContainer>
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BookCard
                  slug={story.id}        // ✅ THIS IS THE FIX
                  title={story.title}
                  tagline={story.tagline}
                  image={story.image}
                  comingSoon={story.comingSoon === 'TRUE'}
                  showIcon
                />
              </motion.div>
            ))}

          </GridContainer>
        </Overlay>
      </PageWrapper>
    </>
  );
}
