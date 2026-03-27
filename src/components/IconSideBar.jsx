import React from 'react';
import { Stethoscope, Search } from 'lucide-react';
import './IconSideBar.css';

const IconSidebar = ({ agenda, selectedId, onSelect, onOpenSearch }) => (
  <nav className="sidebar-nav">
    
    <button onClick={onOpenSearch} className="btn-primary-action">
      <Stethoscope size={22} />
    </button>

    <div className="nav-scroll-area">
      {agenda.map((p) => {
        const isActive = selectedId === p.id;
        
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="patient-nav-item"
          >
            <div className={`avatar-frame ${isActive ? 'avatar-active' : 'avatar-inactive'}`}>
              <img src={p.img || "https:
            </div>
            
            <span className={`time-badge ${isActive ? 'time-active' : 'time-inactive'}`}>
              {p.time}
            </span>
          </button>
        );
      })}
    </div>
    
    <button onClick={onOpenSearch} className="btn-secondary-icon">
      <Search size={20} />
    </button>
  </nav>
);

export default IconSidebar;