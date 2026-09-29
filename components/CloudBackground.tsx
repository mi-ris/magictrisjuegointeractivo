
import React from 'react';

interface Props {
  variant?: 'light' | 'dark';
}

const CloudBackground: React.FC<Props> = ({ variant = 'light' }) => {
  const opacity = variant === 'dark' ? '0.15' : '0.8';
  const clouds = [
    { size: 'text-[120px]', top: 'top-10', duration: '45s', left: '-10%' },
    { size: 'text-[180px]', top: 'top-60', duration: '70s', left: '-25%' },
    { size: 'text-[140px]', top: 'top-20', duration: '55s', left: '80%' },
    { size: 'text-[100px]', top: 'bottom-20', duration: '50s', left: '-15%' },
    { size: 'text-[80px]', top: 'top-40', duration: '60s', left: '30%' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {clouds.map((c, i) => (
        <div
          key={i}
          className={`cloud-emoji absolute ${c.size} ${c.top}`}
          style={{ animationDuration: c.duration, left: c.left, opacity }}
        >
          {i % 2 === 0 ? '☁️' : '✨'}
        </div>
      ))}
    </div>
  );
};

export default CloudBackground;
