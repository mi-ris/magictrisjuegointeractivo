
import React, { useState } from 'react';
import { User } from '../types';
import { playPopSound, speakText } from './AudioUtils';

interface Props {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onUpdate: (u: Partial<User>) => void;
}

const AVATARS = [
  { id: '/avatar-bear.webp', name: 'Oso' },
  { id: '/avatar-penguin.webp', name: 'Pingüino' },
  { id: '/avatar-butterfly.webp', name: 'Mariposa' },
  { id: '/avatar-robot.webp', name: 'Robot' },
  { id: '/avatar-star.webp', name: 'Estrella' },
  { id: '/avatar-chick.webp', name: 'Pollito' },
  { id: '/avatar-lion.webp', name: 'León' },
  { id: '/avatar-bunny.webp', name: 'Conejo' },
  { id: '/avatar-alien.webp', name: 'Alien' },
  { id: '/avatar-cat.webp', name: 'Gato' },
];

const Profile: React.FC<Props> = ({ user, onBack, onLogout, onUpdate }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [tempNickname, setTempNickname] = useState(user.nickname);
  const [selectedAvatar, setSelectedAvatar] = useState(
    user.avatar.startsWith('/') ? user.avatar : AVATARS[0].id
  );

  const handleBack = () => {
    playPopSound();
    onBack();
  };

  const handleAvatarSelect = (avatarPath: string) => {
    playPopSound();
    setSelectedAvatar(avatarPath);
    onUpdate({ avatar: avatarPath });
  };

  const handleLogoutClick = () => {
    playPopSound();
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    playPopSound();
    onLogout();
  };

  const handleLogoutCancel = () => {
    playPopSound();
    setShowLogoutConfirm(false);
  };

  const handleNicknameBlur = () => {
    if (tempNickname.trim() !== user.nickname) {
      onUpdate({ nickname: tempNickname.trim() });
    }
  };

  const handlePreviewVoice = () => {
    speakText(`¡Hola! Me llamo ${tempNickname || 'amigo'} y me encanta aprender con MagicTris.`).catch(() => {});
  };

  return (
    <div className="p-4 pt-24 sm:pt-28 max-w-4xl mx-auto space-y-4 pb-12 relative animate-fade-in">
      <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-white ring-4 ring-indigo-100/30">

        {/* Header with avatar */}
        <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 p-6 flex flex-row items-center justify-center gap-6">
          <div className="relative">
            <div className="bg-white w-24 h-24 rounded-full border-[6px] border-white shadow-xl flex items-center justify-center overflow-hidden">
              <img src={selectedAvatar} alt={user.nickname} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 p-2 rounded-full border-2 border-white shadow-lg animate-pulse text-xs">✨</div>
          </div>
          <h2 className="text-3xl text-white font-magic drop-shadow-lg uppercase tracking-tight">¡Hola {user.nickname}!</h2>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-white/50">

          {/* Nickname and email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-magic text-indigo-500 uppercase tracking-widest ml-4">Nombre Real</label>
              <div className="w-full bg-gray-50 px-6 py-3 rounded-full border-2 border-gray-100 text-lg font-bold text-gray-500 shadow-inner italic">
                {user.username}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-magic text-indigo-500 uppercase tracking-widest ml-4">Correo Amigo</label>
              <div className="w-full bg-gray-50 px-6 py-3 rounded-full border-2 border-gray-100 text-base font-bold text-gray-400 shadow-inner overflow-hidden text-ellipsis">
                {user.email}
              </div>
            </div>
          </div>

          {/* Nickname input */}
          <div className="space-y-1">
            <label className="text-[10px] font-magic text-indigo-500 uppercase tracking-widest ml-4">Apodo Mágico (Toca para cambiar)</label>
            <input
              type="text"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              onBlur={handleNicknameBlur}
              className="w-full bg-indigo-50 px-6 py-4 rounded-full border-2 border-indigo-200 text-2xl font-magic text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-md placeholder-indigo-200"
              placeholder="Escribe tu apodo..."
              spellCheck="false"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-100/50 p-4 rounded-[2rem] text-center border-2 border-amber-200 shadow-sm">
              <p className="text-4xl mb-1">⭐</p>
              <p className="text-3xl font-magic text-amber-700">{user.score}</p>
              <p className="text-[10px] uppercase font-magic text-amber-600 tracking-widest">Estrellas</p>
            </div>
            <div className="bg-cyan-100/50 p-4 rounded-[2rem] text-center border-2 border-cyan-200 shadow-sm">
              <p className="text-4xl mb-1">🔥</p>
              <p className="text-3xl font-magic text-cyan-700">{user.streak}</p>
              <p className="text-[10px] uppercase font-magic text-cyan-600 tracking-widest">Racha</p>
            </div>
          </div>

          {/* Avatar picker */}
          <div className="bg-indigo-50/50 p-5 rounded-[2.5rem] border-2 border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-magic text-indigo-700 uppercase tracking-tighter">Elige tu avatar</h3>
              <button
                onClick={handlePreviewVoice}
                className="bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-indigo-600 transition-colors active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                Probar voz
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleAvatarSelect(av.id)}
                  className={`rounded-2xl transition-all border-4 overflow-hidden ${
                    selectedAvatar === av.id
                      ? 'border-indigo-500 scale-110 shadow-lg bg-white'
                      : 'border-transparent hover:bg-white hover:border-indigo-200 bg-white/40'
                  }`}
                  title={av.name}
                >
                  <img src={av.id} alt={av.name} className="w-full aspect-square object-cover" />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full bg-red-50 text-red-500 py-4 rounded-full text-xl font-magic border-2 border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 uppercase tracking-tighter"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-indigo-950/50 backdrop-blur-lg animate-fade-in">
          <div className="bg-white/95 backdrop-blur-2xl border-[10px] border-indigo-400 p-8 rounded-[4rem] shadow-2xl w-full max-w-md flex flex-col items-center text-center">
            <img src={selectedAvatar} alt="" className="w-20 h-20 mb-2 object-contain floating-gumi" />
            <h3 className="text-3xl font-magic text-indigo-800 mb-2 leading-tight uppercase">¿Quieres salir?</h3>
            <p className="text-lg font-bold text-gray-500 mb-6">¡Gumi y las letras te esperarán!</p>

            <div className="w-full space-y-3">
              <button
                onClick={handleLogoutConfirm}
                className="btn-magic-pop w-full bg-red-500 text-white py-4 rounded-[2rem] text-2xl font-magic shadow-xl border-b-6 border-red-700 active:translate-y-1 uppercase tracking-widest"
              >
                CONFIRMAR
              </button>

              <button
                onClick={handleLogoutCancel}
                className="w-full bg-indigo-100 text-indigo-600 py-4 rounded-[2rem] text-xl font-magic border-2 border-indigo-200 hover:bg-indigo-200 transition-all active:scale-95 uppercase tracking-widest"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
