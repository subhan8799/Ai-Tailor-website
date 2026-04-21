import React from "react";
import { Link } from "react-router-dom";
import './About.css';

function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="about-hero-bg"></div>
        <div className="about-hero-content">
          <span className="badge-gold">Our Story</span>
          <h1 className="about-title">Crafting <span>Excellence</span><br />Since Day One</h1>
          <p className="about-desc">
            MZ Tailor was born from a passion for bespoke tailoring and a vision to make
            luxury accessible to everyone. We combine traditional craftsmanship with
            modern technology to deliver the perfect suit — every time.
          </p>
        </div>
      </div>

      <div className="about-values">
        {[
          { icon: '✂️', title: 'Precision Craftsmanship', desc: 'Every suit is tailored to your exact measurements using time-honored techniques passed down through generations.' },
          { icon: '🌿', title: 'Premium Materials', desc: 'We source only the finest fabrics — Cotton, Linen, Velvet — from trusted suppliers around the world.' },
          { icon: '🔒', title: 'Secure & Trusted', desc: 'Your data and payments are protected with industry-leading security via Firebase Auth and Stripe.' },
          { icon: '🚀', title: 'Modern Technology', desc: 'Preview your suit in stunning 3D before ordering. Our AI even estimates your measurements from a photo.' },
        ].map((v, i) => (
          <div key={i} className="value-card">
            <div className="value-icon">{v.icon}</div>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="about-cta">
        <h2>Ready to Get Your Perfect Suit?</h2>
        <p>Join thousands of satisfied customers who trust MZ Tailor for their bespoke needs.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/design"><button className="btn-gold">✂️ Design Your Suit</button></Link>
          <Link to="/register"><button className="btn-outline-gold">Create Account</button></Link>
        </div>
      </div>
    </div>
  );
}

export default About;
