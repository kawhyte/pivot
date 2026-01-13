import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import VaultHub from './pages/VaultHub';
import QuestPage from './pages/QuestPage';
import VaultRevealPage from './pages/VaultReveal';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/hub" element={<VaultHub />} />
        <Route path="/quest/:pathId" element={<QuestPage />} />
        <Route path="/vault" element={<VaultRevealPage />} />
      </Routes>
    </BrowserRouter>
  );
}
