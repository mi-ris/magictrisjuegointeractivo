
import React from 'react';
import { MAGIC_PATH, MAGIC_ISLANDS, MAGIC_LEVELS, PICTOGRAMS } from '../services/mockData';
import { useSettings } from './SettingsContext';

interface Props {
  isCardUnlocked: (cardIndex: number) => boolean;
  isCardNext: (cardIndex: number) => boolean;
  isCardCompleted: (cardIndex: number) => boolean;
  onSelectCard: (index: number) => void;
}

const IslandIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const icons: Record<string, React.ReactElement> = {
    sun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    family: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M14 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"/></svg>,
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    paw: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.32 4.46 16.5a3.5 3.5 0 0 1 1.18-6.6"/></svg>,
    tree: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2L7 9h3v4h4V9h3z M10 13v8 M14 13v8"/></svg>,
    gift: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  };
  return icons[name] || icons.sun;
};

const ZIGZAG = [
  { x: '15%', y: 0 },
  { x: '62%', y: 0 },
  { x: '20%', y: 0 },
  { x: '65%', y: 0 },
  { x: '35%', y: 0 },
  { x: '58%', y: 0 },
];

const CloudPath: React.FC<Props> = ({ isCardUnlocked, isCardNext, isCardCompleted, onSelectCard }) => {
  const { settings } = useSettings();
  const reduceAnim = settings.reduceAnimations;

  const cardIdToIndex = React.useMemo(() => {
    const map: Record<string, number> = {};
    MAGIC_PATH.forEach((card, idx) => { map[card.id] = idx; });
    return map;
  }, []);

  const totalLevelNumber = (islandIdx: number, cardIdx: number) => {
    let count = 0;
    for (let i = 0; i < islandIdx; i++) count += MAGIC_LEVELS[i].items.length;
    return count + cardIdx + 1;
  };

  return (
    <div className="relative mt-2">
      {MAGIC_ISLANDS.map((island, islandIdx) => {
        const islandCards = island.cardIds.map(id => MAGIC_PATH[cardIdToIndex[id]]);
        const firstCardIdx = cardIdToIndex[island.cardIds[0]];

        return (
          <div key={island.id} className="relative mb-2">
            <div className="flex items-center gap-2 mb-2 px-2">
              <IslandIcon name={island.islandIcon} className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              <h3 className="text-xs sm:text-sm font-magic uppercase tracking-wider text-indigo-700">
                {island.name}
              </h3>
            </div>

            <div className="relative" style={{ minHeight: `${islandCards.length * 78}px` }}>
              {islandCards.map((card, cardIdx) => {
                const globalIdx = cardIdToIndex[card.id];
                const unlocked = isCardUnlocked(globalIdx);
                const isNext = isCardNext(globalIdx);
                const completed = isCardCompleted(globalIdx);
                const levelNum = totalLevelNumber(islandIdx, cardIdx);
                const pos = ZIGZAG[cardIdx % ZIGZAG.length];
                const pictInfo = PICTOGRAMS[card.value];

                return (
                  <div
                    key={card.id}
                    className="absolute transition-all duration-300"
                    style={{ left: pos.x, top: `${cardIdx * 76}px`, width: '90px' }}
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <div className="bg-indigo-500 text-white text-[10px] font-magic w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white">
                        {levelNum}
                      </div>
                    </div>

                    <button
                      disabled={!unlocked}
                      onClick={() => unlocked && onSelectCard(globalIdx)}
                      className={`relative w-[90px] h-[68px] flex flex-col items-center justify-center transition-all duration-300 group ${
                        unlocked ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-not-allowed'
                      }`}
                    >
                      <div className={`absolute inset-0 rounded-[2rem] rounded-tr-md transition-all ${
                        unlocked
                          ? isNext
                            ? `bg-white shadow-[0_0_20px_rgba(99,102,241,0.5)] ${!reduceAnim ? 'animate-pulse' : ''} ring-3 ring-amber-300 scale-110`
                            : completed
                              ? 'bg-white shadow-lg ring-2 ring-emerald-300'
                              : 'bg-white/95 shadow-lg'
                          : 'bg-white/40 shadow-sm'
                      }`}>
                        <div className={`absolute -top-2 left-3 w-6 h-6 rounded-full ${unlocked ? 'bg-white' : 'bg-white/40'}`} />
                        <div className={`absolute -top-1 right-4 w-5 h-5 rounded-full ${unlocked ? 'bg-white' : 'bg-white/40'}`} />
                        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full ${unlocked ? 'bg-white' : 'bg-white/40'}`} />
                      </div>

                      <div className="relative z-10 flex flex-col items-center justify-center h-full pb-1">
                        {unlocked ? (
                          <>
                            {pictInfo?.imageUrl && (
                              <img
                                src={pictInfo.imageUrl}
                                alt={card.pictogramWord}
                                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                                loading="lazy"
                              />
                            )}
                            <span className="text-[9px] font-magic text-indigo-700 uppercase leading-none mt-0.5">
                              {card.value.length > 5 ? card.value.slice(0, 4) + '…' : card.value}
                            </span>
                          </>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        )}
                      </div>

                      {completed && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-400 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-md z-20">
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}

                      {isNext && (
                        <div className={`absolute -bottom-1 -right-1 bg-amber-400 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-md z-20 ${!reduceAnim ? 'animate-bounce' : ''}`}>
                          <svg viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Nube final */}
      <div className="flex justify-center mt-2 mb-4">
        <div className="relative">
          <div className="absolute -top-2 left-3 w-6 h-6 rounded-full bg-white/80" />
          <div className="absolute -top-1 right-4 w-5 h-5 rounded-full bg-white/80" />
          <div className="bg-white/80 rounded-[2rem] rounded-tr-md px-6 py-4 shadow-md flex flex-col items-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            <span className="text-[10px] font-magic text-indigo-500 uppercase">¡Meta!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudPath;
