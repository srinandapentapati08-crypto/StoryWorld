// src/components/BookCard.tsx
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { FaBook } from 'react-icons/fa';

function getImgSrc(raw: string) {
  if (!raw) return '';
  if (raw.startsWith('http')) return raw;
  return `${import.meta.env.BASE_URL}${raw}`;
}

interface BookCardProps {
  title: string;
  tagline: string;
  image: string;
  slug: string;
  comingSoon?: boolean;
  showIcon?: boolean;
  rating?: { average: number; count: number } | null;
}

/* ── Coming Soon badge ── */

const badgePulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 1; }
`;

const BadgeDot = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  animation: ${badgePulse} 1.8s ease-in-out infinite;
  flex-shrink: 0;
`;

const ComingSoonBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  padding: 0.25rem 0.65rem;
  font-size: 0.68rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.04em;
`;

/* ── Star rating ── */

const MiniStarsWrap = styled.div`
  display: flex;
  gap: 1px;
`;

const MiniStar = styled.span<{ $type: 'full' | 'half' | 'empty' }>`
  font-size: 0.78rem;
  line-height: 1;
  position: relative;
  display: inline-block;
  color: ${(p) => (p.$type === 'full' ? '#ffd700' : 'rgba(255,255,255,0.15)')};
  text-shadow: ${(p) => (p.$type === 'full' ? '0 0 6px rgba(255,215,0,0.4)' : 'none')};

  ${(p) =>
    p.$type === 'half' &&
    `
    &::after {
      content: '★';
      position: absolute;
      left: 0;
      top: 0;
      width: 50%;
      overflow: hidden;
      color: #ffd700;
      text-shadow: 0 0 6px rgba(255,215,0,0.4);
    }
  `}
`;

const RatingNum = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: #ffd700;
`;

const RatingCount = styled.span`
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.3);
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: auto;
`;

function MiniStars({ average }: { average: number }) {
  return (
    <MiniStarsWrap>
      {[1, 2, 3, 4, 5].map((i) => {
        const diff = average - (i - 1);
        const type = diff >= 1 ? 'full' : diff >= 0.5 ? 'half' : 'empty';
        return (
          <MiniStar key={i} $type={type}>
            ★
          </MiniStar>
        );
      })}
    </MiniStarsWrap>
  );
}

/* ── Card layout ── */

const CardWrapper = styled.div`
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  height: 100%;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 25px rgba(143, 10, 10, 0.43);
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  display: block;
  height: 100%;
`;

const Card = styled.div`
  background-color: rgba(26, 26, 26, 0.48);
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Image = styled.img`
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
`;

const Content = styled.div`
  padding: 1rem 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Title = styled.h3`
  font-size: clamp(1rem, 2vw, 1.25rem);
  margin: 0 0 0.4rem;
  color: #ffffff;
  line-height: 1.3;
`;

const Tagline = styled.p`
  font-size: clamp(0.82rem, 1.5vw, 0.95rem);
  color: #bbbbbb;
  flex-grow: 1;
  line-height: 1.5;
`;

const Meta = styled.div`
  margin-top: 0.75rem;
  min-height: 1.5rem; /* keeps card height consistent whether badge/stars/nothing */
  display: flex;
  align-items: center;
`;

const BookIconWrap = styled.div`
  margin-top: 0.4rem;
  color: #ffd700;
  font-size: 1.1rem;
`;

/* ── Component ── */

export default function BookCard({
  title,
  tagline,
  image,
  slug,
  comingSoon,
  showIcon,
  rating,
}: BookCardProps) {
  const linkPath = comingSoon ? '#' : `/books/${slug}`;

  return (
    <CardWrapper>
      <CardLink to={linkPath}>
        <Card>
          <Image
            src={getImgSrc(image)}
            alt={title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/cartoon.png';
            }}
          />
          <Content>
            <Title>{title}</Title>
            <Tagline>{tagline}</Tagline>

            <Meta>
              {comingSoon ? (
                <ComingSoonBadge>
                  <BadgeDot />
                  Coming Soon
                </ComingSoonBadge>
              ) : rating ? (
                <RatingRow>
                  <MiniStars average={rating.average} />
                  <RatingNum>{rating.average.toFixed(1)}</RatingNum>
                  <RatingCount>({rating.count})</RatingCount>
                </RatingRow>
              ) : null}
            </Meta>

            {showIcon && !comingSoon && (
              <BookIconWrap>
                <FaBook />
              </BookIconWrap>
            )}
          </Content>
        </Card>
      </CardLink>
    </CardWrapper>
  );
}
