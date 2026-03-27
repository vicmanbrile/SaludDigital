import React from 'react';
import './SignCard.css';

const SignCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="sign-card">
    <div className={`icon-container ${colorClass}`}>
      <Icon size={16} className="text-white" />
    </div>
    
    <div>
      <p className="label-text">{label}</p>
      <p className="value-text">{value}</p>
    </div>
  </div>
);

export default SignCard;