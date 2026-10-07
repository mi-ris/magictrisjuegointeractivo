
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { MAGIC_PATH, MAGIC_ISLANDS, PICTOGRAMS } from '../services/mockData';
import { supabase } from '../services/supabaseClient';
import CloudPath from './CloudPath';
import { useSettings } from './SettingsContext';
import { playPopSound } from './AudioUtils';

interface Props {
  user: User;
  onBack: () => void;
  onPreviewCard: (index: number) => void;
}

interface AttemptRow {
  id: string;
  card_id: string;
  card_value: string;
  step: string;
  is_correct: boolean;
  wrong_choice: string | null;
  attempts_count: number;
  time_spent_ms: number | null;
  created_at: string;
}

interface LevelStat {
  cardValue: string;
  cardId: string;
  totalAttempts: number;
  correctCount: number;
  errorCount: number;
  lastPlayed: string | null;
  avgTimeMs: number | null;
  worstWrong: string | null;
}

const AdminPanel: React.FC<Props> = ({ user, onBack, onPreviewCard }) => {
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'stats' | 'levels' | 'history' | 'preview' | 'settings'>('stats');
  const { settings, updateSettings } = useSettings();

  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAttempts((data || []) as AttemptRow[]);
    } catch (err) {
      console.warn('Error cargando intentos:', err);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchAttempts(); }, [fetchAttempts]);

  const levelStats: LevelStat[] = MAGIC_PATH.map(card => {
    const cardAttempts = attempts.filter(a => a.card_id === card.id);
    const correct = cardAttempts.filter(a => a.is_correct);
    const errors = cardAttempts.filter(a => !a.is_correct);
    const times = correct.map(a => a.time_spent_ms).filter((t): t is number => t != null);
    const wrongChoices = errors.map(a => a.wrong_choice).filter((w): w is string => w != null);
    const wrongCounts: Record<string, number> = {};
    wrongChoices.forEach(w => { wrongCounts[w] = (wrongCounts[w] || 0) + 1; });
    const worstWrong = Object.entries(wrongCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const lastPlayed = cardAttempts.length > 0 ? cardAttempts[0].created_at : null;
    const avgTimeMs = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
    return {
      cardValue: card.value,
      cardId: card.id,
      totalAttempts: cardAttempts.length,
      correctCount: correct.length,
      errorCount: errors.length,
      lastPlayed,
      avgTimeMs,
      worstWrong,
    };
  });

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter(a => a.is_correct).length;
  const totalErrors = attempts.filter(a => !a.is_correct).length;
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const completedLevels = levelStats.filter(s => s.correctCount > 0).length;
  const completedWithErrorLevels = levelStats.filter(s => s.errorCount > 0).length;

  const progressPercent = Math.round((user.progressIndex / MAGIC_PATH.length) * 100);

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Nunca';
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (ms: number | null) => {
    if (ms == null) return '-';
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const StatIcon = ({ path, className }: { path: string; className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d={path} /></svg>
  );

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-10 px-3 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="bg-white/90 p-2 sm:p-3 rounded-xl border-2 border-indigo-200 hover:bg-white active:scale-90 shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-magic text-indigo-700 uppercase">Panel de Adulto</h2>
            <p className="text-[10px] sm:text-xs text-indigo-400 font-bold uppercase tracking-wider">Estadisticas de {user.nickname}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-indigo-100">
        {([
          { key: 'stats', label: 'Resumen' },
          { key: 'levels', label: 'Niveles' },
          { key: 'history', label: 'Historial' },
          { key: 'preview', label: 'Probar' },
          { key: 'settings', label: 'Ajustes' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              view === tab.key ? 'bg-indigo-500 text-white shadow-md' : 'text-indigo-400 hover:bg-indigo-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-cyan-100 bg-white/70 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-cyan-600">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-200 border-t-cyan-600" />
          Actualizando datos
        </div>
      )}

      {view === 'stats' && (
        <div className="space-y-4">
          {/* Tarjetas resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border-2 border-indigo-100 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-indigo-100 p-1.5 rounded-lg">
                  <StatIcon path="M22 11.08V12a10 10 0 1 1-5.93-9.14" className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-magic text-indigo-700">{progressPercent}%</p>
              <p className="text-[10px] font-bold text-indigo-400 uppercase">Progreso</p>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border-2 border-emerald-100 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-emerald-100 p-1.5 rounded-lg">
                  <StatIcon path="M20 6L9 17l-5-5" className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-magic text-emerald-600">{completedLevels}</p>
              <p className="text-[10px] font-bold text-emerald-400 uppercase">Niveles completados</p>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-100 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-amber-100 p-1.5 rounded-lg">
                  <StatIcon path="M12 9v2m0 4h.01M5 19h14a2 2 0 0 0 1.84-2.75L13.74 4a2 2 0 0 0-3.48 0L3.16 16.25A2 2 0 0 0 5 19z" className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-magic text-amber-600">{totalErrors}</p>
              <p className="text-[10px] font-bold text-amber-400 uppercase">Errores totales</p>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border-2 border-cyan-100 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-cyan-100 p-1.5 rounded-lg">
                  <StatIcon path="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" className="w-4 h-4 text-cyan-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-magic text-cyan-600">{accuracy}%</p>
              <p className="text-[10px] font-bold text-cyan-400 uppercase">Precision</p>
            </div>
          </div>

          {/* Detalle adicional */}
          <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border-2 border-indigo-100 shadow-md">
            <h3 className="text-sm font-magic text-indigo-700 uppercase mb-3">Resumen general</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-indigo-50">
                <span className="text-sm text-gray-600">Puntos totales</span>
                <span className="font-bold text-indigo-700">{user.score}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-indigo-50">
                <span className="text-sm text-gray-600">Racha de dias</span>
                <span className="font-bold text-indigo-700">{user.streak} dias</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-indigo-50">
                <span className="text-sm text-gray-600">Nivel actual</span>
                <span className="font-bold text-indigo-700">{user.progressIndex + 1} de {MAGIC_PATH.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-indigo-50">
                <span className="text-sm text-gray-600">Intentos totales</span>
                <span className="font-bold text-indigo-700">{totalAttempts}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-indigo-50">
                <span className="text-sm text-gray-600">Niveles con errores</span>
                <span className="font-bold text-amber-600">{completedWithErrorLevels}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Ultima sesion</span>
                <span className="font-bold text-indigo-700">{formatDate(user.lastLogin)}</span>
              </div>
            </div>
          </div>

          {/* Palabras con mas errores */}
          <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border-2 border-amber-100 shadow-md">
            <h3 className="text-sm font-magic text-amber-600 uppercase mb-3">Palabras que mas le cuestan</h3>
            {levelStats.filter(s => s.errorCount > 0).sort((a, b) => b.errorCount - a.errorCount).slice(0, 5).map(stat => {
              const pictInfo = PICTOGRAMS[stat.cardValue];
              return (
                <div key={stat.cardId} className="flex items-center gap-3 py-2 border-b border-amber-50 last:border-0">
                  {pictInfo?.imageUrl && <img src={pictInfo.imageUrl} alt="" className="w-8 h-8 rounded-lg object-contain bg-white border border-amber-200" />}
                  <div className="flex-1">
                    <span className="font-bold text-indigo-700 uppercase text-sm">{stat.cardValue}</span>
                    {stat.worstWrong && <p className="text-[10px] text-amber-500">Confunde con: {stat.worstWrong}</p>}
                  </div>
                  <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-1 rounded-lg">{stat.errorCount} errores</span>
                </div>
              );
            })}
            {levelStats.filter(s => s.errorCount > 0).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin errores registrados. ¡Excelente!</p>
            )}
          </div>
        </div>
      )}

      {view === 'levels' && (
        <div className="space-y-3">
          {MAGIC_ISLANDS.map((island, islandIdx) => {
            const islandStats = island.cardIds.map(id => {
              const cardIdx = MAGIC_PATH.findIndex(c => c.id === id);
              return { card: MAGIC_PATH[cardIdx], stat: levelStats[cardIdx] };
            });
            return (
              <div key={island.id} className="bg-white/90 backdrop-blur-md rounded-2xl border-2 border-indigo-100 shadow-md overflow-hidden">
                <div className="bg-indigo-500 px-4 py-2">
                  <h3 className="text-sm font-magic text-white uppercase tracking-wider">{island.name}</h3>
                </div>
                <div className="divide-y divide-indigo-50">
                  {islandStats.map(({ card, stat }) => {
                    const pictInfo = PICTOGRAMS[card.value];
                    const isCompleted = stat.correctCount > 0;
                    const isLocked = MAGIC_PATH.findIndex(c => c.id === card.id) >= user.progressIndex && !isCompleted;
                    return (
                      <div key={card.id} className="flex items-center gap-3 p-3">
                        <div className="relative">
                          {pictInfo?.imageUrl ? (
                            <img src={pictInfo.imageUrl} alt="" className="w-10 h-10 rounded-xl object-contain bg-white border border-indigo-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100" />
                          )}
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-indigo-700 uppercase text-sm block">{card.value}</span>
                          <div className="flex gap-2 mt-0.5">
                            {stat.correctCount > 0 && <span className="text-[10px] text-emerald-500 font-bold">{stat.correctCount} aciertos</span>}
                            {stat.errorCount > 0 && <span className="text-[10px] text-amber-500 font-bold">{stat.errorCount} errores</span>}
                            {stat.totalAttempts === 0 && <span className="text-[10px] text-gray-400">Sin jugar</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          {isCompleted ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 ml-auto"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : isLocked ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 ml-auto"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 ml-auto"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                          )}
                          <p className="text-[9px] text-gray-400 mt-0.5">{formatTime(stat.avgTimeMs)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'history' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border-2 border-indigo-100 shadow-md overflow-hidden">
          {attempts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay intentos registrados ainda.</p>
          ) : (
            <div className="divide-y divide-indigo-50 max-h-[60vh] overflow-y-auto">
              {attempts.slice(0, 100).map(a => {
                const pictInfo = PICTOGRAMS[a.card_value];
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3">
                    {pictInfo?.imageUrl ? (
                      <img src={pictInfo.imageUrl} alt="" className="w-8 h-8 rounded-lg object-contain bg-white border border-indigo-100" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-indigo-50" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-indigo-700 uppercase text-sm">{a.card_value}</span>
                      <p className="text-[10px] text-gray-400">
                        {a.step === 'identify' ? 'Identificar' : a.step === 'wordBuild' ? 'Armar palabra' : a.step === 'complete' ? 'Nivel completado' : a.step}
                        {a.wrong_choice && ` - eligio: ${a.wrong_choice}`}
                      </p>
                    </div>
                    <div className="text-right">
                      {a.is_correct ? (
                        <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">Correcto</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">Error</span>
                      )}
                      <p className="text-[9px] text-gray-400 mt-0.5">{formatDate(a.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === 'preview' && (
        <div className="space-y-3">
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3 text-center">
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Modo Vista Previa</p>
            <p className="text-[10px] text-indigo-400 mt-0.5">Todos los niveles desbloqueados. Lo que juegues aqui no afecta el progreso del niño ni sus estadisticas.</p>
          </div>
          <div className="max-w-lg mx-auto">
            <CloudPath
              isCardUnlocked={() => true}
              isCardNext={() => false}
              isCardCompleted={() => false}
              onSelectCard={onPreviewCard}
            />
          </div>
        </div>
      )}

      {view === 'settings' && (
        <div className="space-y-4 max-w-lg mx-auto">
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border-2 border-indigo-100 shadow-md space-y-5">
            <h3 className="text-sm font-magic text-indigo-700 uppercase mb-1">Configuracion de audio y voz</h3>

            {/* Sonido */}
            <div className="flex items-center justify-between py-2 border-b border-indigo-50">
              <div>
                <p className="text-sm font-bold text-indigo-700">Sonido</p>
                <p className="text-[11px] text-indigo-400">Activa o desactiva todos los sonidos</p>
              </div>
              <button
                onClick={() => { updateSettings({ soundEnabled: !settings.soundEnabled }); if (settings.soundEnabled) playPopSound(); }}
                className={`relative w-12 h-7 rounded-full transition-colors ${settings.soundEnabled ? 'bg-indigo-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Voz automatica */}
            <div className="flex items-center justify-between py-2 border-b border-indigo-50">
              <div>
                <p className="text-sm font-bold text-indigo-700">Voz automatica</p>
                <p className="text-[11px] text-indigo-400">Reproduce las instrucciones solo al entrar a cada juego</p>
              </div>
              <button
                onClick={() => updateSettings({ autoPlayVoice: !settings.autoPlayVoice })}
                className={`relative w-12 h-7 rounded-full transition-colors ${settings.autoPlayVoice ? 'bg-indigo-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.autoPlayVoice ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Velocidad de voz */}
            <div className="py-2 border-b border-indigo-50">
              <div className="mb-2">
                <p className="text-sm font-bold text-indigo-700">Velocidad de voz</p>
                <p className="text-[11px] text-indigo-400">Lenta para aprender, normal o rápida para practicar</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSettings({ speechRate: 'slow' })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold uppercase transition-all ${settings.speechRate === 'slow' ? 'bg-indigo-500 text-white shadow-md' : 'bg-indigo-50 text-indigo-400'}`}
                >
                  Lenta
                </button>
                <button
                  onClick={() => updateSettings({ speechRate: 'normal' })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold uppercase transition-all ${settings.speechRate === 'normal' ? 'bg-indigo-500 text-white shadow-md' : 'bg-indigo-50 text-indigo-400'}`}
                >
                  Normal
                </button>
                <button
                  onClick={() => updateSettings({ speechRate: 'fast' })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold uppercase transition-all ${settings.speechRate === 'fast' ? 'bg-indigo-500 text-white shadow-md' : 'bg-indigo-50 text-indigo-400'}`}
                >
                  Rápida
                </button>
              </div>
            </div>

            {/* Animaciones */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-bold text-indigo-700">Animaciones reducidas</p>
                <p className="text-[11px] text-indigo-400">Menos movimiento, ideal si el niño se distrae facilmente</p>
              </div>
              <button
                onClick={() => updateSettings({ reduceAnimations: !settings.reduceAnimations })}
                className={`relative w-12 h-7 rounded-full transition-colors ${settings.reduceAnimations ? 'bg-indigo-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.reduceAnimations ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 text-center">
            <p className="text-[11px] text-indigo-500">Los cambios se guardan automaticamente en este dispositivo.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
