// src/components/FeedbackSection.tsx
import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { StoryDoc } from '../utils/loadFirestore';

/* ── Animations ── */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`to { transform: rotate(360deg); }`;

const popIn = keyframes`
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1);   opacity: 1; }
`;

/* ── Styled Components ── */

const Section = styled.section`
  max-width: 1400px;
  margin: 3.5rem auto 0;
  animation: ${fadeUp} 0.5s ease 0.2s both;
`;

const SectionLabel = styled.h2`
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 1.25rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.75rem 1.5rem;

  @media (min-width: 600px) {
    padding: 2rem 2rem;
  }
`;

const Question = styled.p`
  font-size: clamp(0.95rem, 2.5vw, 1.1rem);
  color: #ddd;
  margin-bottom: 1.25rem;
  line-height: 1.5;
`;

/* Story multi-select chips */
const StoryChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Chip = styled.button<{ $selected: boolean }>`
  padding: 0.35rem 0.85rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${(p) => (p.$selected ? '#ffd700' : 'rgba(255,255,255,0.12)')};
  background: ${(p) => (p.$selected ? 'rgba(255,215,0,0.12)' : 'transparent')};
  color: ${(p) => (p.$selected ? '#ffd700' : 'rgba(255,255,255,0.5)')};
  transition: all 0.18s ease;

  &:hover {
    border-color: rgba(255, 215, 0, 0.5);
    color: #ffd700;
  }
`;

/* Star rating row */
const StarRow = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
`;

const Star = styled.button<{ $lit: boolean }>`
  font-size: clamp(1.6rem, 5vw, 2rem);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  color: ${(p) => (p.$lit ? '#ffd700' : 'rgba(255,255,255,0.15)')};
  text-shadow: ${(p) => (p.$lit ? '0 0 10px rgba(255,215,0,0.5)' : 'none')};
  transition: color 0.15s ease, transform 0.15s ease, text-shadow 0.15s ease;

  &:hover {
    transform: scale(1.2);
    color: #ffd700;
  }
`;

/* Message textarea */
const MsgTextarea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #eee;
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  padding: 0.75rem 1rem;
  resize: vertical;
  min-height: 90px;
  outline: none;
  margin-bottom: 1.25rem;
  transition: border-color 0.2s;

  &::placeholder { color: rgba(255,255,255,0.25); }
  &:focus { border-color: rgba(255, 215, 0, 0.4); }
`;

/* Submit button */
const SubmitBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.5rem;
  background: transparent;
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.55);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 215, 0, 0.1);
    border-color: #ffd700;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 215, 0, 0.25);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

/* Success state */
const SuccessBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  text-align: center;
  animation: ${popIn} 0.4s ease both;
`;

const SuccessEmoji = styled.div`
  font-size: 2.5rem;
  line-height: 1;
`;

const SuccessText = styled.p`
  font-size: 1rem;
  color: #ccc;

  strong { color: #ffd700; }
`;

const ErrorText = styled.p`
  font-size: 0.82rem;
  color: #ff6b6b;
  margin-top: 0.5rem;
`;

/* ── Component ── */

interface Props {
  stories: StoryDoc[];
  onSubmitted?: () => void;
}

export default function FeedbackSection({ stories, onSubmitted }: Props) {
  const publishedStories = stories.filter((s) => !s.comingSoon);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hovered, setHovered]         = useState(0);
  const [rating, setRating]           = useState(0);
  const [message, setMessage]         = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]               = useState(false);
  const [error, setError]             = useState('');

  const toggleStory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (selectedIds.length === 0) { setError('Please select at least one story.'); return; }

    setError('');
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'feedback'), {
        storyIds: selectedIds,
        rating,
        message: message.trim(),
        createdAt: serverTimestamp(),
      });
      setDone(true);
      onSubmitted?.();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (publishedStories.length === 0) return null;

  return (
    <Section>
      <SectionLabel>Leave a Review</SectionLabel>
      <Card>
        {done ? (
          <SuccessBox>
            <SuccessEmoji>🌟</SuccessEmoji>
            <SuccessText>
              Thank you! <strong>Your feedback means a lot.</strong>
            </SuccessText>
          </SuccessBox>
        ) : (
          <>
            <Question>Which stories did you read?</Question>
            <StoryChips>
              {publishedStories.map((s) => (
                <Chip
                  key={s.id}
                  $selected={selectedIds.includes(s.id)}
                  onClick={() => toggleStory(s.id)}
                >
                  {s.title}
                </Chip>
              ))}
            </StoryChips>

            <Question>How would you rate them?</Question>
            <StarRow>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  $lit={i <= (hovered || rating)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(i)}
                  aria-label={`${i} star${i > 1 ? 's' : ''}`}
                >
                  ★
                </Star>
              ))}
            </StarRow>

            <Question>Anything to share? <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85em' }}>(optional)</span></Question>
            <MsgTextarea
              placeholder="Tell us what you loved, what could be better…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
            />

            {error && <ErrorText>{error}</ErrorText>}

            <SubmitBtn onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Spinner /> : '✦'}
              {submitting ? 'Submitting…' : 'Submit Feedback'}
            </SubmitBtn>
          </>
        )}
      </Card>
    </Section>
  );
}
