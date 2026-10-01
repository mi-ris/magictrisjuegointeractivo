
import React, { useState } from 'react';
import { User } from '../types';
import { supabase, isSupabaseReady } from '../services/supabaseClient';
import { playPopSound } from './AudioUtils';

interface Props {
  mode: 'login' | 'register';
  onAuthSuccess: (u: User) => void;
  toggleMode: () => void;
}

const Auth: React.FC<Props> = ({ mode, onAuthSuccess, toggleMode }) => {
  const [formData, setFormData] = useState({ name: '', email: '', pass: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestEntry = () => {
    playPopSound();
    onAuthSuccess({
      id: 'guest',
      username: 'Invitado',
      email: '',
      nickname: 'Amigo Mágico',
      avatar: '/avatar-bear.webp',
      score: 0,
      streak: 1,
      lastLogin: new Date().toISOString(),
      progressIndex: 0
    });
  };

  const handleToggle = () => {
    playPopSound();
    toggleMode();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playPopSound();

    if (!isSupabaseReady()) {
      setError("Error de conexión. Recarga la página e intenta de nuevo.");
      return;
    }

    if (!formData.email || !formData.pass) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (formData.pass !== formData.confirm) throw new Error('Las contraseñas no coinciden.');
        if (formData.pass.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');

        const { data: authData, error: authError } = await (supabase!.auth as any).signUp({
          email: formData.email,
          password: formData.pass,
          options: { data: { display_name: formData.name || 'Gumi Amigo' } }
        });

        if (authError) {
          if (authError.message.includes("Database error saving new user")) {
            throw new Error("Error de base de datos. Verifica el SQL Trigger en Supabase.");
          }
          throw authError;
        }

        if (authData.user) {
          if (!authData.session) {
            setError("¡Cuenta creada! Revisa tu email para confirmar.");
            setLoading(false);
            return;
          }

          await new Promise(r => setTimeout(r, 1000));

          const { data: profile, error: pError } = await supabase!
            .from('profiles').select('*').eq('id', authData.user.id).single();

          if (pError || !profile) {
            const newProfile = {
              id: authData.user.id,
              username: formData.name || formData.email.split('@')[0],
              email: formData.email,
              nickname: formData.name || 'Gumi Amigo',
              avatar: '/avatar-bear.webp',
              score: 0, streak: 0, progress_index: 0,
              last_login: new Date().toISOString()
            };
            await supabase!.from('profiles').insert(newProfile);
            onAuthSuccess({ id: newProfile.id, username: newProfile.username, email: newProfile.email, nickname: newProfile.nickname, avatar: newProfile.avatar, score: 0, streak: 0, progressIndex: 0, lastLogin: newProfile.last_login });
          } else {
            onAuthSuccess({ id: profile.id, username: profile.username || 'Gumi', email: profile.email || '', nickname: profile.nickname || 'Amigo', avatar: profile.avatar || '/avatar-bear.webp', score: Number(profile.score) || 0, streak: Number(profile.streak) || 0, progressIndex: Number(profile.progress_index) || 0, lastLogin: profile.last_login || new Date().toISOString() });
          }
        }
      } else {
        const { data: authData, error: authError } = await (supabase!.auth as any).signInWithPassword({
          email: formData.email, password: formData.pass,
        });

        if (authError) throw authError;

        if (authData.user) {
          const { data: profile, error: pError } = await supabase!
            .from('profiles').select('*').eq('id', authData.user.id).single();

          if (pError || !profile) throw new Error("Perfil no encontrado.");

          onAuthSuccess({ id: profile.id, username: profile.username, email: profile.email, nickname: profile.nickname, avatar: profile.avatar, score: Number(profile.score) || 0, streak: Number(profile.streak) || 0, progressIndex: Number(profile.progress_index) || 0, lastLogin: profile.last_login || new Date().toISOString() });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión mágica.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-5 py-3.5 rounded-2xl border-2 border-indigo-100 text-gray-800 font-bold focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 outline-none placeholder-indigo-300 bg-white/90 transition-all shadow-sm text-base";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      {/* Card */}
      <div className="bg-white/85 backdrop-blur-2xl rounded-[3rem] shadow-2xl w-full max-w-md border-[6px] border-white overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 px-8 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-white/30 blur-xl rounded-full" />
            <img src="/Logo_gumi_.jpg" alt="Gumi" className="relative w-24 h-24 object-contain floating-gumi drop-shadow-xl" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-magic text-white uppercase tracking-tight drop-shadow-md">
            {mode === 'login' ? '¡Hola de nuevo!' : '¡Hola nuevo amigo!'}
          </h2>
          <p className="text-white/80 text-sm font-bold mt-1">
            {mode === 'login' ? 'Entra a tu mundo mágico' : 'Únete a la aventura mágica'}
          </p>
        </div>

        {/* Form */}
        <div className="px-7 py-6 space-y-3">
          {mode === 'register' && (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 text-lg">👤</span>
              <input className={inputClass + ' pl-11'} placeholder="¿Cómo te llamas?" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 text-lg">✉️</span>
            <input className={inputClass + ' pl-11'} placeholder="Correo electrónico" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 text-lg">🔒</span>
            <input className={inputClass + ' pl-11'} placeholder="Contraseña" type="password" value={formData.pass} onChange={e => setFormData({...formData, pass: e.target.value})} />
          </div>
          {mode === 'register' && (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 text-lg">🔒</span>
              <input className={inputClass + ' pl-11'} placeholder="Repite tu contraseña" type="password" value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} />
            </div>
          )}

          {error && (
            <div className="bg-red-50 px-4 py-3 rounded-2xl border-2 border-red-200">
              <p className="text-red-600 text-xs font-black text-center uppercase leading-tight">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-magic text-xl shadow-xl hover:bg-indigo-700 active:translate-y-1 transition-all border-b-4 border-indigo-800 disabled:opacity-60 uppercase tracking-wide mt-1"
          >
            {loading ? 'CARGANDO...' : mode === 'login' ? 'ENTRAR' : 'REGISTRARSE'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-indigo-100" />
            <span className="text-xs text-indigo-300 font-bold uppercase tracking-widest">o</span>
            <div className="flex-1 h-px bg-indigo-100" />
          </div>

          {/* Modo invitado */}
          <button
            onClick={handleGuestEntry}
            className="w-full bg-cyan-50 text-cyan-700 border-2 border-cyan-200 py-3.5 rounded-2xl font-magic text-lg hover:bg-cyan-100 transition-all active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
          >
            <span>🌟</span> Modo Invitado
          </button>

          {/* Toggle */}
          <button onClick={handleToggle} className="w-full text-indigo-400 text-sm font-bold uppercase tracking-widest py-1 hover:text-indigo-600 transition-colors">
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
