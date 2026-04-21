import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand-title">MZ Tailor</div>
          <p className="footer-brand-desc">
            Bespoke suits crafted to your exact measurements. Experience luxury tailoring from the comfort of your home.
          </p>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/design">Design a Suit</Link></li>
            <li><Link to="/fabrics">Fabrics</Link></li>
            <li><Link to="/readymade-suit">Ready-Made</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/user-order-list">My Orders</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><Link to="/support">Live Chat</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link to="/size-guide">Size Guide</Link></li>
            <li><Link to="/compare">Compare Fabrics</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 MZ Tailor Ltd. All rights reserved.</p>
        <p>University Project · Spring 2026</p>
      </div>
    </footer>
  );
}

export default Footer;
