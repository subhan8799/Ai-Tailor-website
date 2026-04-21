import React, { useState, useEffect } from "react";
import "./MenuBar.css";
import { Link } from "react-router-dom";

const menuItems = [
  { icon: '🏠', label: 'Home', to: '/', auth: false },
  { icon: '✂️', label: 'Design a Suit', to: '/design', auth: false },
  { icon: '🧵', label: 'Fabrics', to: '/fabrics', auth: false },
  { icon: '👔', label: 'Ready-Made Suits', to: '/readymade-suit', auth: false },
  { icon: '🛍️', label: 'Shopping Bag', to: '/add-to-cart', auth: true, fallback: '/login' },
  { icon: '📦', label: 'My Orders', to: '/user-order-list', auth: true, fallback: '/login' },
  { icon: '💬', label: 'Support', to: '/support', auth: false },
  { icon: 'ℹ️', label: 'About Us', to: '/about', auth: false },
];

const MenuBar = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    setUserId(localStorage.getItem('user_id') || '');
    const handleOutside = (e) => {
      const menu = document.getElementById('menu');
      const btn = document.querySelector('.menu-btn');
      if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
        setMenuVisible(false);
      }
    };
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, []);

  return (
    <div className="menu-bar">
      <div className="menu-btn" onClick={() => setMenuVisible(!menuVisible)}>☰</div>

      <div id="menu" className={menuVisible ? 'visible' : ''}>
        <div className="menu-header">
          <span className="brand-name">MZ Tailor</span>
          <button className="menu-close-btn" onClick={() => setMenuVisible(false)}>✕</button>
        </div>

        {menuItems.map((item, i) => (
          <div key={i} className="menu-group">
            <div className="menu-item">
              <Link to={item.auth && !userId ? item.fallback : item.to} onClick={() => setMenuVisible(false)}>
                <span className="menu-item-icon">{item.icon}</span>
                <span className="menubar-text">{item.label}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBar;
