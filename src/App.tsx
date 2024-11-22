import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Chat from './components/Chat';
import Settings from './components/Settings';
import RegularUsers from './components/RegularUsers';
import ContactsPage from './pages/ContactsPage';
import GroupChatPage from './pages/GroupChatPage';
import PrivateRoute from './components/PrivateRoute';
import BottomNavigation from './components/navigation/BottomNavigation';
import OfflineAlert from './components/OfflineAlert';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useOnlinePresence } from './hooks/useOnlinePresence';
import ProfilePage from './pages/ProfilePage';
import { useEffect, useState } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './contexts/AuthContext';
import PullToRefresh from './components/PullToRefresh';
import { useSetupCheck } from './hooks/useSetupCheck';
import SetupWizard from './components/setup/SetupWizard';
import AnonymousSetup from './components/setup/AnonymousSetup';
import { useScrollBehavior } from './hooks/useScrollBehavior';
import ChatContainer from './components/chat/ChatContainer';
import { useFullscreenApp } from './hooks/useFullscreenApp';

function AuthenticatedApp() {
  const { isOnline, isFirestoreAvailable } = useNetworkStatus();
  const { currentUser } = useAuth();
  const { loading, needsSetup } = useSetupCheck();
  const location = useLocation();
  const navType = useNavigationType();
  const [direction, setDirection] = useState<'to-left' | 'to-right'>('to-left');
  const [isAnimating, setIsAnimating] = useState(false);
  useOnlinePresence();

  const handleRefresh = async () => {
    window.location.reload();
  };

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);

    const updateOnlineStatus = async (status: 'online' | 'offline') => {
      try {
        await updateDoc(userDocRef, {
          status,
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    const handleVisibilityChange = () => {
      const status = document.visibilityState === 'visible' ? 'online' : 'offline';
      updateOnlineStatus(status);
    };

    const handleOnline = () => updateOnlineStatus('online');
    const handleOffline = () => updateOnlineStatus('offline');

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeunload', () => updateOnlineStatus('offline'));

    updateOnlineStatus('online');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', () => updateOnlineStatus('offline'));
      updateOnlineStatus('offline');
    };
  }, [currentUser]);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = location.state?.from || '/chat';
    const direction = location.state?.direction || 'to-left';
    
    setIsAnimating(true);
    setDirection(direction);
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 300); // durata dell'animazione
    
    return () => clearTimeout(timer);
  }, [location]);

  const routes = [
    { path: '/chat', element: Chat },
    { path: '/contacts', element: ContactsPage },
    { path: '/group', element: GroupChatPage },
    { path: '/users', element: RegularUsers },
    { path: '/settings', element: Settings }
  ];

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen theme-bg theme-text pb-16">
        <div className="page-wrapper">
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            {routes.map(({ path, element: Element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <PrivateRoute>
                    <div className="page-transition">
                      <Element />
                    </div>
                  </PrivateRoute>
                }
              />
            ))}
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/profile/:userId" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/setup" element={<SetupWizard />} />
            <Route path="/setup/anonymous" element={<AnonymousSetup />} />
            <Route path="/chats" element={<ChatContainer direction={direction} />} />
          </Routes>
        </div>
        {!needsSetup && <BottomNavigation />}
        {(!isOnline || !isFirestoreAvailable) && <OfflineAlert />}
      </div>
    </PullToRefresh>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { loading } = useSetupCheck();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}

import { useNativeBehavior } from './hooks/useNativeBehavior';
import { useStandaloneMode } from './hooks/useStandaloneMode';
import './styles/native.css';

export default function App() {
  useNativeBehavior();
  useStandaloneMode();

  return (
    <div className="native-container">
      <div className="native-scroll">
        <AuthProvider>
          <ThemeProvider>
            <BrowserRouter>
              <AuthenticatedApp />
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </div>
    </div>
  );
}