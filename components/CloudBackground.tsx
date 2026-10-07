import React from 'react';

interface Props {
  variant?: 'light' | 'dark';
}

const CloudBackground: React.FC<Props> = ({ variant = 'light' }) => {
  return (
    <div className={`cloud-background cloud-background-${variant}`} aria-hidden="true">
      <div className="moving-cloud moving-cloud-one"><span /><span /><span /></div>
      <div className="moving-cloud moving-cloud-two"><span /><span /><span /></div>
      <div className="moving-cloud moving-cloud-three"><span /><span /><span /></div>
      <div className="moving-cloud moving-cloud-four"><span /><span /><span /></div>
    </div>
  );
};

export default CloudBackground;
