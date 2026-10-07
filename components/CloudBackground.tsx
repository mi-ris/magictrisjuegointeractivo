import React from 'react';

interface Props {
  variant?: 'light' | 'dark';
}

const CloudShape = ({ className, scale = 1, opacity = 1 }: { className?: string; scale?: number; opacity?: number }) => (
  <svg
    className={`cloud-svg ${className || ''}`}
    viewBox="0 0 220 110"
    style={{ transform: `scale(${scale})`, opacity }}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id={`cloud-body-${className}`} cx="42%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="45%" stopColor="#f4faff" stopOpacity="0.98" />
        <stop offset="80%" stopColor="#dceffa" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#b6d8ee" stopOpacity="0.72" />
      </radialGradient>
      <radialGradient id={`cloud-hi-${className}`} cx="38%" cy="20%" r="38%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <filter id={`cloud-blur-${className}`}>
        <feGaussianBlur stdDeviation="0.4" />
      </filter>
    </defs>
    {/* Main body — overlapping ellipses for organic puff shape */}
    <g filter={`url(#cloud-blur-${className})`}>
      <ellipse cx="44" cy="66" rx="34" ry="28" fill={`url(#cloud-body-${className})`} />
      <ellipse cx="82" cy="50" rx="44" ry="38" fill={`url(#cloud-body-${className})`} />
      <ellipse cx="128" cy="44" rx="40" ry="34" fill={`url(#cloud-body-${className})`} />
      <ellipse cx="170" cy="58" rx="34" ry="29" fill={`url(#cloud-body-${className})`} />
      <ellipse cx="196" cy="70" rx="22" ry="20" fill={`url(#cloud-body-${className})`} />
      {/* Base flat bottom */}
      <rect x="30" y="68" width="170" height="20" rx="10" fill={`url(#cloud-body-${className})`} />
      {/* Top highlight for 3D volume */}
      <ellipse cx="78" cy="38" rx="38" ry="18" fill={`url(#cloud-hi-${className})`} />
      <ellipse cx="130" cy="32" rx="30" ry="14" fill={`url(#cloud-hi-${className})`} />
      {/* Soft underside shadow */}
      <ellipse cx="100" cy="80" rx="80" ry="12" fill="rgba(110,165,200,0.12)" />
    </g>
  </svg>
);

const CloudBackground: React.FC<Props> = ({ variant = 'light' }) => {
  return (
    <div className={`cloud-background cloud-background-${variant}`} aria-hidden="true">
      {/* Distant layer — tiny, faded */}
      <div className="cloud-layer cloud-layer-far">
        <div className="cloud-svg-wrap moving-cloud moving-cloud-five"><CloudShape className="c5" scale={0.45} opacity={0.35} /></div>
        <div className="cloud-svg-wrap moving-cloud moving-cloud-six"><CloudShape className="c6" scale={0.38} opacity={0.3} /></div>
      </div>
      {/* Mid layer */}
      <div className="cloud-layer cloud-layer-mid">
        <div className="cloud-svg-wrap moving-cloud moving-cloud-two"><CloudShape className="c2" scale={0.72} opacity={0.55} /></div>
        <div className="cloud-svg-wrap moving-cloud moving-cloud-four"><CloudShape className="c4" scale={0.5} opacity={0.48} /></div>
      </div>
      {/* Near layer — large, bold */}
      <div className="cloud-layer cloud-layer-near">
        <div className="cloud-svg-wrap moving-cloud moving-cloud-one"><CloudShape className="c1" scale={1} opacity={0.82} /></div>
        <div className="cloud-svg-wrap moving-cloud moving-cloud-three"><CloudShape className="c3" scale={1.1} opacity={0.72} /></div>
      </div>
    </div>
  );
};

export default CloudBackground;
