import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import VaultHub from './pages/VaultHub';
import QuestPage from './pages/QuestPage';
import VaultRevealPage from './pages/VaultReveal';
import { QuestHydration } from './components/QuestHydration';

export default function App() {
  return (
    <BrowserRouter>
      {/* Hydrate from Supabase on app load */}
      <QuestHydration />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/hub" element={<VaultHub />} />
        <Route path="/quest/:pathId" element={<QuestPage />} />
        <Route path="/vault" element={<VaultRevealPage />} />
      </Routes>
    </BrowserRouter>
  );
}
