
import React from 'react';
import { MAGIC_PATH } from '../services/mockData';

interface Props {
  onBack: () => void;
}

const PrintableCards: React.FC<Props> = ({ onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const renderHighlightedWord = (word: string, syllable: string, color: string) => {
    const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedWord = normalize(word);
    const normalizedSyllable = normalize(syllable);
    const index = normalizedWord.indexOf(normalizedSyllable);

    if (index !== -1) {
      const before = word.substring(0, index);
      const target = word.substring(index, index + syllable.length);
      const after = word.substring(index + syllable.length);
      return (
        <span className="album-word-text">
          {before}<span style={{ color }} className="album-word-highlight">{target}</span>{after}
        </span>
      );
    }
    return <span className="album-word-text">{word}</span>;
  };

  return (
    <div className="album-page animate-fade-in">
      <div className="album-header print:hidden">
        <button onClick={onBack} className="album-back" type="button" aria-label="Volver">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div className="album-header-text">
          <h1>Álbum de Recortes</h1>
          <p>¡Imprime y juega fuera de línea!</p>
        </div>
        <button onClick={handlePrint} className="album-print-btn" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          IMPRIMIR
        </button>
      </div>

      <div className="print:hidden album-tips">
        <div className="album-tip-card album-tip-amber">
          <div className="album-tip-icon">✂️</div>
          <p>Recorta las tarjetas y pégalas en cartulina. ¡Ahora cada sílaba se ve mejor que nunca!</p>
        </div>
        <div className="album-tip-card album-tip-indigo">
          <h3>¿Cómo imprimir?</h3>
          <p><strong>1.</strong> Toca el botón verde "IMPRIMIR".</p>
          <p><strong>2.</strong> Activa <strong>"Gráficos de fondo"</strong> en tu impresora.</p>
          <p><strong>3.</strong> El álbum se imprimirá a todo color.</p>
        </div>
      </div>

      <div className="album-grid">
        {MAGIC_PATH.map((card) => (
          <div key={card.id} className="album-card" style={{ ['--card-bg' as any]: card.color, ['--card-highlight' as any]: card.highlightColor }}>
            <div className="album-card-inner">
              <div className="album-card-badge">
                {card.type === 'vocal' ? 'Vocal' : card.type === 'silaba' ? 'Sílaba' : 'Letra'}
              </div>
              <div className="album-card-value">{card.value}</div>
              <div className="album-card-image-wrap">
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt={card.pictogramWord} className="album-card-image" />
                ) : (
                  <div className="album-card-image-placeholder" />
                )}
              </div>
              <div className="album-card-word">
                {renderHighlightedWord(card.pictogramWord, card.value, card.highlightColor)}
              </div>
              <div className="album-card-divider" />
              <div className="album-card-footer">MagicTris · El Mundo de Gumi</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .animate-fade-in { animation: none !important; }
          @page { margin: 1cm; size: auto; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PrintableCards;
