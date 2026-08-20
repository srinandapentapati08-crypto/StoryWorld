// src/pages/Login.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';

/* ================= STYLES ================= */

const PageWrapper = styled.div`
  min-height: 100vh;
  background-image: url('/story-world-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
`;

const Card = styled.div`
  position: relative;
  z-index: 1;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);

  @media (min-width: 480px) {
    padding: 3rem 2.5rem;
  }
`;

const LogoLink = styled.a`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  cursor: pointer;
`;

const LogoImg = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
`;

const Heading = styled.h1`
  text-align: center;
  font-size: 1.75rem;
  color: #fff;
  margin-bottom: 0.4rem;
`;

const Subheading = styled.p`
  text-align: center;
  color: #aaa;
  font-size: 0.95rem;
  margin-bottom: 2rem;
`;

const GoogleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.85rem 1.2rem;
  border-radius: 10px;
  background: #fff;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;

  &:hover {
    background: #f0f0f0;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  color: #555;
  font-size: 0.85rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-top: 1px solid #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid #333;
  background: #1a1a1a;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: #666;
  }

  &:focus {
    border-color: #ffd700;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 0.85rem;
  border-radius: 10px;
  background: #ffd700;
  color: #000;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
  margin-top: 0.25rem;

  &:hover {
    background: #ffe44d;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ToggleBtn = styled.button`
  background: none;
  border: none;
  color: #ffd700;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  margin-top: 0.5rem;
  text-align: center;
  width: 100%;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMsg = styled.p`
  color: #ff6b6b;
  font-size: 0.88rem;
  text-align: center;
  margin-top: -0.25rem;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #000;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 0.4rem;
`;

/* ================= COMPONENT ================= */

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleGoogle = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: unknown) {
      setError(getFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err: unknown) {
      setError(getFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <PageWrapper>
      <Overlay />
      <Card>
        <LogoLink onClick={() => navigate('/')}>
          <LogoImg src="/images/cartoon.png" alt="StoryWorld" />
        </LogoLink>

        <Heading>Story World</Heading>
        <Subheading>
          {mode === 'signin' ? 'Sign in to continue reading' : 'Create your account'}
        </Subheading>

        <GoogleBtn onClick={handleGoogle} disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : <FaGoogle size={18} />}
          Continue with Google
        </GoogleBtn>

        <Divider>or</Divider>

        <Form onSubmit={handleEmailSubmit}>
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={6}
          />
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <SubmitBtn type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </SubmitBtn>
        </Form>

        <ToggleBtn
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError('');
          }}
        >
          {mode === 'signin'
            ? "Don't have an account? Create one"
            : 'Already have an account? Sign in'}
        </ToggleBtn>
      </Card>
    </PageWrapper>
  );
}

function getFirebaseError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    const map: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/cancelled-popup-request': '',
      'auth/network-request-failed': 'Network error. Check your connection.',
    };
    return map[code] ?? 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
