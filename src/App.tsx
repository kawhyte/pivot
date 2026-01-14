import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import VaultHub from './pages/VaultHub';
import QuestPage from './pages/QuestPage';
import VaultRevealPage from './pages/VaultReveal';
import { QuestHydration } from './components/QuestHydration';
import { TesterBadge } from './components/TesterBadge';

export default function App() {
  return (
    <BrowserRouter>
      {/* Hydrate from Supabase on app load */}
      <QuestHydration />

      {/* Global tester badge - appears on all pages when isTester is true */}
      <TesterBadge />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/hub" element={<VaultHub />} />
        <Route path="/quest/:pathId" element={<QuestPage />} />
        <Route path="/vault" element={<VaultRevealPage />} />
      </Routes>
    </BrowserRouter>
  );
}
