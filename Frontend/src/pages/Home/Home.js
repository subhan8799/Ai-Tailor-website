import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import pic1 from "../../assets/photos/fabrics.png";
import pic2 from "../../assets/photos/dresses.png";
import cus1 from "../../assets/photos/custom1.jpg";
import "./Home.css";
import RecentlyViewed from "../../components/ui/RecentlyViewed/RecentlyViewed";

function Home() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userID = searchParams.get('userID');
    if (token && userID) {
      localStorage.setItem('user_id', userID);
      localStorage.setItem('token', token);
      window.location.href = window.location.origin + window.location.pathname;
    }
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="hero-text">
            <span className="badge-gold">✦ Bespoke Tailoring</span>
            <h1 className="hero-title">
              Your Perfect Suit,<br />
              <span className="gold">Crafted for You</span>
            </h1>
            <p className="hero-desc">
              Experience the art of bespoke tailoring from the comfort of your home.
              Choose from 150+ premium fabrics, enter your measurements, and preview
              your custom suit in stunning 3D before ordering.
            </p>
            <div className="hero-actions">
              <Link to="/design">
                <button className="btn-gold">✂️ Design Your Suit</button>
              </Link>
              <Link to="/fabrics">
                <button className="btn-outline-gold">Explore Fabrics</button>
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">150+</span>
                <span className="stat-label">Fabrics</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">3D</span>
                <span className="stat-label">Preview</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Custom Fit</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">7-14</span>
                <span className="stat-label">Day Delivery</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-img-frame">
              <img src={cus1} alt="Custom Suit" />
              <div className="hero-img-badge">
                <div className="badge-title">🎨 Live 3D Preview</div>
                <div className="badge-sub">See your suit before ordering</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="home-services">
        <div className="section-header">
          <span className="badge-gold">What We Offer</span>
          <h2 className="section-title" style={{marginTop: 12}}>The <span>MZ Tailor</span> Experience</h2>
          <div className="gold-divider"></div>
        </div>
        <div className="services-grid">
          <Link to="/design" className="service-card">
            <div className="service-icon">✂️</div>
            <h3>Design Your Suit</h3>
            <p>Choose fabric, style, and enter your measurements. Preview in real-time 3D before placing your order.</p>
          </Link>
          <Link to="/fabrics" className="service-card">
            <div className="service-icon">🧵</div>
            <h3>Premium Fabrics</h3>
            <p>Browse our curated collection of Cotton, Linen, Velvet and more. Buy fabric only or use it for your suit.</p>
          </Link>
          <Link to="/readymade-suit" className="service-card">
            <div className="service-icon">👔</div>
            <h3>Ready-Made Suits</h3>
            <p>Explore our collection of pre-designed suits available for immediate order and fast delivery.</p>
          </Link>
          <Link to="/support" className="service-card">
            <div className="service-icon">💬</div>
            <h3>Live Support</h3>
            <p>Chat directly with our tailoring experts for advice on fabrics, measurements, and styling.</p>
          </Link>
        </div>
      </section>

      {/* Explore Section */}
      <section className="home-explore">
        <div className="section-header">
          <span className="badge-gold">Collections</span>
          <h2 className="section-title" style={{marginTop: 12}}>Explore Our <span>Collections</span></h2>
          <div className="gold-divider"></div>
        </div>
        <div className="explore-grid">
          <Link to="/fabrics" className="explore-card">
            <img src={pic1} alt="Fabrics" />
            <div className="explore-overlay">
              <h3>Premium Fabrics</h3>
              <p>Cotton, Linen, Velvet & more in stunning colors</p>
              <span className="explore-btn">Explore Fabrics →</span>
            </div>
          </Link>
          <Link to="/readymade-suit" className="explore-card">
            <img src={pic2} alt="Suits" />
            <div className="explore-overlay">
              <h3>Bespoke Suits</h3>
              <p>Single breast, double breast, tuxedo & more</p>
              <span className="explore-btn">Explore Suits →</span>
            </div>
          </Link>
        </div>
      </section>
      {/* Recently Viewed */}
      <RecentlyViewed />
    </div>
  );
}

export default Home;
