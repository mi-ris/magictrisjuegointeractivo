import React from 'react';
import { useSettings } from './SettingsContext';

interface Props {
  variant?: 'light' | 'dark';
}

const CloudBackground: React.FC<Props> = ({ variant = 'light' }) => {
  const { settings } = useSettings();
  const opacity = variant === 'dark' ? 0.15 : 0.8;
  const clouds = [
    { size: 'text-[120px]', top: 'top-[34%]', left: 'left-[-2%]', duration: '52s', delay: '-11s' },
    { size: 'text-[92px]', top: 'top-[8%]', left: 'left-[68%]', duration: '61s', delay: '-27s' },
    { size: 'text-[82px]', top: 'bottom-[12%]', left: 'left-[48%]', duration: '57s', delay: '-39s' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {clouds.map((cloud, index) => (
        <div
          key={index}
          className={`cloud-emoji absolute ${cloud.size} ${cloud.top} ${cloud.left}`}
          style={{ opacity, animationDuration: cloud.duration, animationDelay: cloud.delay, animationPlayState: settings.reduceAnimations ? 'paused' : 'running' }}
        >
          ☁
        </div>
      ))}
    </div>
  );
};

export default CloudBackground;
