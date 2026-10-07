
import React, { useState, useEffect } from 'react';
import { User, Section } from './types';
import PreLogin from './components/PreLogin';
import Auth from './components/Auth';
import Hub from './components/Hub';
import GameBoard from './components/GameBoard';
import Profile from './components/Profile';
import Info from './components/Info';
import PrintableCards from './components/PrintableCards';
import AdminPanel from './components/AdminPanel';
import ChatBuddy from './components/ChatBuddy';
import VoiceLive from './components/VoiceLive';
import MediaGenerator from './components/MediaGenerator';
import NavBar from './components/NavBar';
import CloudBackground from './components/CloudBackground';
import { SettingsProvider } from './components/SettingsContext';
import { MAGIC_PATH, PICTOGRAMS } from './services/mockData';
import { supabase, isSupabaseReady } from './services/supabaseClient';

const CONFETTI_COLORS = ['#fbbf24', '#f59e0b', '#fb923c', '#facc15', '#fde047', '#ffffff'];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<Section | 'chat' | 'voice' | 'generator' | 'admin'>('pre-login');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [previewCardIndex, setPreviewCardIndex] = useState<number | null>(null);
  const [levelUpAnimation, setLevelUpAnimation] = useState<{ word: string; imageUrl: string } | null>(null);
  const [initializing, setInitializing] = useState(true);

  const getDaysDiff = (date1: Date, date2: Date) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((d2.getTime() - d1.getTime()) / 86400000);
  };

  const mapProfileToUser = (profile: any): User => {
    const lastLoginStr = profile.last_login || profile.lastLogin || new Date().toISOString();
    const lastDate = new Date(lastLoginStr);
    const today = new Date();
    const diff = getDaysDiff(lastDate, today);
    
    // Si ha pasado más de un día sin jugar, la racha se rompe (vuelve a 0)
    // Pero si juega hoy, la racha se mantendrá o subirá en handleGameComplete
    let currentStreak = Number(profile.streak) || 0;
    if (diff > 1) currentStreak = 0;

    return {
      id: profile.id,
      username: profile.username || 'Gumi',
      email: profile.email || '',
      nickname: profile.nickname || profile.username || 'Invitado',
      avatar: profile.avatar || '/avatar-bear.webp',
      score: Number(profile.score) || 0,
      streak: currentStreak,
      progressIndex: Number(profile.progress_index ?? profile.progressIndex ?? 0) || 0,
      lastLogin: lastLoginStr
    };
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const localData = localStorage.getItem('magic_user');
        if (localData) {
          const parsed = JSON.parse(localData);
          setUser(mapProfileToUser(parsed));
          setSection('hub');
        }

        if (isSupabaseReady()) {
          // Fix: Using cast to bypass potential type mismatches in Supabase library versions
          const { data: { session } } = await (supabase!.auth as any).getSession();
          if (session?.user) {
            const { data: profile } = await supabase!
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (profile) {
              const updatedUser = mapProfileToUser(profile);
              setUser(updatedUser);
              localStorage.setItem('magic_user', JSON.stringify(updatedUser));
            }
          }
        }
      } catch (err) {
        console.warn("Sincronización local:", err);
      } finally {
        setInitializing(false);
      }
    };
    initApp();
  }, []);

  const handleGameComplete = async (scoreGain: number) => {
    if (!user || selectedCardIndex === null) return;
    const today = new Date();
    const lastDate = new Date(user.lastLogin);
    const diff = getDaysDiff(lastDate, today);
    
    let newStreak = user.streak;
    
    if (user.streak === 0 || diff > 1) {
      newStreak = 1;
    } else if (diff === 1) {
      newStreak = user.streak + 1;
    }

    const wasNewLevel = selectedCardIndex >= user.progressIndex;
    const completedCard = MAGIC_PATH[selectedCardIndex];
    const completedPict = PICTOGRAMS[completedCard.value];

    const updatedUser: User = {
      ...user,
      score: user.score + scoreGain,
      streak: newStreak,
      progressIndex: Math.max(user.progressIndex, selectedCardIndex + 1),
      lastLogin: today.toISOString()
    };
    setUser(updatedUser);
    localStorage.setItem('magic_user', JSON.stringify(updatedUser));
    
    if (isSupabaseReady() && user.id !== 'guest') {
      await supabase!.from('profiles').update({
        score: updatedUser.score,
        streak: updatedUser.streak,
        progress_index: updatedUser.progressIndex,
        last_login: updatedUser.lastLogin
      }).eq('id', user.id);
    }
    setSelectedCardIndex(null);
    setSection('hub');

    if (wasNewLevel) {
      setLevelUpAnimation({ word: completedCard.value, imageUrl: completedPict?.imageUrl || '' });
      setTimeout(() => setLevelUpAnimation(null), 4000);
    }
  };

  if (initializing) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cyan-50">
       <div className="text-8xl animate-bounce mb-4">✨</div>
       <p className="font-magic text-cyan-600 animate-pulse text-xl uppercase">Cargando Magia...</p>
    </div>
  );

  const handleNavBarHome = () => {
    setSelectedCardIndex(null);
    setSection('hub');
  };

  const handlePreviewComplete = () => {
    setPreviewCardIndex(null);
  };

  const handlePreviewBack = () => {
    setPreviewCardIndex(null);
  };

  const showNavBar = user && section !== 'pre-login' && section !== 'login' && section !== 'register';
  const inGame = selectedCardIndex !== null || previewCardIndex !== null;
  const darkBg = section === 'info';

  const renderSection = () => {
    if (previewCardIndex !== null && user) {
        return <GameBoard user={user} card={MAGIC_PATH[previewCardIndex]} cardIndex={previewCardIndex} onComplete={handlePreviewComplete} onBack={handlePreviewBack} />;
    }
    if (selectedCardIndex !== null && user) {
        return <GameBoard user={user} card={MAGIC_PATH[selectedCardIndex]} cardIndex={selectedCardIndex} onComplete={handleGameComplete} onBack={() => setSelectedCardIndex(null)} />;
    }
    switch (section) {
      case 'pre-login': return <PreLogin onStart={() => setSection('login')} />;
      case 'login': return <Auth mode="login" onAuthSuccess={(u) => { setUser(u); setSection('hub'); }} toggleMode={() => setSection('register')} />;
      case 'register': return <Auth mode="register" onAuthSuccess={(u) => { setUser(u); setSection('hub'); }} toggleMode={() => setSection('login')} />;
      case 'hub': return user ? <Hub user={user} onSelectCard={setSelectedCardIndex} /> : null;
      case 'profile': return user ? <Profile user={user} onBack={() => setSection('hub')} onLogout={() => { setUser(null); localStorage.removeItem('magic_user'); setSection('pre-login'); }} onUpdate={(upd) => setUser({...user, ...upd})} /> : null;
      case 'info': return <Info onBack={() => setSection('hub')} />;
      case 'printable': return <PrintableCards onBack={() => setSection('hub')} />;
      case 'admin': return user ? <AdminPanel user={user} onBack={() => setSection('hub')} onPreviewCard={setPreviewCardIndex} /> : null;
      case 'chat': return <div className="pt-24 sm:pt-28 px-4 max-w-2xl mx-auto pb-10"><ChatBuddy /></div>;
      case 'voice': return <div className="pt-24 sm:pt-28 px-4 max-w-2xl mx-auto pb-10"><VoiceLive /></div>;
      case 'generator': return <div className="pt-24 sm:pt-28 px-4 max-w-2xl mx-auto pb-10"><MediaGenerator /></div>;
      default: return <PreLogin onStart={() => setSection('login')} />;
    }
  };

  return (
    <SettingsProvider>
      <div className="min-h-screen pb-10 relative">
        <CloudBackground variant={darkBg ? 'dark' : 'light'} />
        {showNavBar && user && (
          <NavBar
            user={user}
            currentSection={section}
            inGame={inGame}
            onNavigate={(s) => { setSelectedCardIndex(null); setSection(s); }}
            onHome={handleNavBarHome}
          />
        )}
        <div className="relative z-10">{renderSection()}</div>
        {levelUpAnimation && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400/70 via-orange-400/60 to-yellow-300/70" />
            {[...Array(30)].map((_, i) => {
              const cw = `${12 + Math.random() * 28}px`;
              const ch = `${12 + Math.random() * 28}px`;
              const cl = `${Math.random() * 100}%`;
              const ct = `${Math.random() * 100}%`;
              const ca = `confetti-fall ${2 + Math.random() * 2}s ease-in ${Math.random() * 1.5}s infinite`;
              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: cw,
                    height: ch,
                    left: cl,
                    top: ct,
                    backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                    animation: ca,
                  }}
                />
              );
            })}
            <div className="relative flex flex-col items-center animate-bounce-in px-6 text-center">
              <div className="flex gap-1.5 mb-4">
                {[...Array(8)].map((_, i) => (
                  <svg key={i} viewBox="0 0 24 24" fill="#fff" stroke="#f59e0b" strokeWidth="1.5" className="w-10 h-12 sm:w-12 sm:h-14 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              {levelUpAnimation.imageUrl && (
                <img src={levelUpAnimation.imageUrl} alt="" className="w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-3xl border-4 border-white bg-white shadow-2xl mb-4" />
              )}
              <h2 className="text-4xl sm:text-6xl font-magic text-white uppercase mb-2" style={{ textShadow: '0 4px 0 rgba(217,119,6,0.6)' }}>¡Nivel Desbloqueado!</h2>
              <p className="text-2xl sm:text-3xl font-magic text-white uppercase mb-4" style={{ textShadow: '0 3px 0 rgba(217,119,6,0.5)' }}>{levelUpAnimation.word}</p>
              <span className="bg-white text-amber-500 text-lg sm:text-xl font-black px-6 py-2 rounded-full shadow-lg uppercase">+100 estrellas</span>
            </div>
          </div>
        )}
      </div>
    </SettingsProvider>
  );
};

export default App;
