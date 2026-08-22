// src/components/AdminRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 215, 0, 0.2);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();
  const adminUid = import.meta.env.VITE_ADMIN_UID;

  if (loading) {
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.uid !== adminUid) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
