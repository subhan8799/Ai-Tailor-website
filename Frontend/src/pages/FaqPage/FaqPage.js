import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
    { cat: 'Ordering', items: [
        { q: 'How do I design a custom suit?', a: 'Go to the Design page, select your fabric, suit type, enter measurements (or use our AI auto-measure), preview in 3D, and add to cart.' },
        { q: 'Can I modify my order after placing it?', a: 'Orders in "Pending" status can be modified. Contact our support team via live chat for assistance.' },
        { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards through Stripe\'s secure payment gateway. Your card details are never stored on our servers.' },
        { q: 'Can I gift a suit to someone?', a: 'Yes! At checkout, check "Send as a Gift". The recipient will be notified and can provide their delivery address.' },
    ]},
    { cat: 'Measurements', items: [
        { q: 'How do I get accurate measurements?', a: 'We offer 3 methods: 1) AI auto-measure from a photo/camera, 2) Smart size finder using height/weight, 3) Manual entry. Visit our Size Guide for detailed instructions.' },
        { q: 'What if my measurements are wrong?', a: 'We offer free alterations for first-time orders. Contact support within 7 days of delivery.' },
        { q: 'Do you offer in-person fittings?', a: 'Yes! Book a virtual or physical appointment through your Profile page.' },
    ]},
    { cat: 'Fabrics', items: [
        { q: 'What fabrics do you offer?', a: 'We offer Cotton (all-season), Linen (summer), and Velvet (formal) in multiple colors. Visit the Fabrics page to browse.' },
        { q: 'Can I compare fabrics?', a: 'Yes! Use our Fabric Comparison tool to compare up to 3 fabrics side by side on properties like price, breathability, and durability.' },
        { q: 'Are fabric samples available?', a: 'Contact our support team to request fabric swatches delivered to your address.' },
    ]},
    { cat: 'Delivery', items: [
        { q: 'How long does delivery take?', a: 'Custom suits: 7-14 business days. Fabric orders: 3-5 business days. You\'ll receive tracking updates at each stage.' },
        { q: 'Do you ship internationally?', a: 'Yes, we ship worldwide. Delivery times vary by location.' },
        { q: 'Can I track my order?', a: 'Yes! Visit My Orders to see real-time status: Pending → Tailoring → Shipped → Delivered.' },
    ]},
    { cat: 'Returns & Support', items: [
        { q: 'What is your return policy?', a: 'Since suits are custom-made, we don\'t offer returns. However, we provide free alterations for manufacturing defects within 14 days.' },
        { q: 'How do I contact support?', a: 'Use the AI chatbot (bottom-right), live chat on the Support page, or book a consultation through your Profile.' },
    ]},
];

function FaqPage() {
    const [openIdx, setOpenIdx] = useState({});

    const toggle = (cat, i) => {
        const key = `${cat}-${i}`;
        setOpenIdx(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '60px 20px', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <span className="badge-gold">Help Center</span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--text)', margin: '12px 0' }}>Frequently Asked <span style={{ color: 'var(--accent)' }}>Questions</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Everything you need to know about MZ Tailor</p>
            </div>

            {FAQS.map((section, si) => (
                <div key={si} style={{ marginBottom: 32 }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--accent)', marginBottom: 14 }}>{section.cat}</h2>
                    {section.items.map((faq, i) => {
                        const key = `${section.cat}-${i}`;
                        const isOpen = openIdx[key];
                        return (
                            <div key={i} style={{ marginBottom: 8, background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 8%, transparent)', borderRadius: 12, overflow: 'hidden' }}>
                                <button onClick={() => toggle(section.cat, i)} style={{
                                    width: '100%', padding: '16px 20px', background: 'transparent', border: 'none',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                                    color: isOpen ? 'var(--accent)' : 'var(--text)', fontSize: 14, fontWeight: 600, textAlign: 'left'
                                }}>
                                    {faq.q}
                                    <span style={{ fontSize: 18, transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'none', color: 'var(--accent)', flexShrink: 0, marginLeft: 12 }}>+</span>
                                </button>
                                {isOpen && (
                                    <div style={{ padding: '0 20px 16px', color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, animation: 'fadeIn 0.2s ease' }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}

            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', borderRadius: 'var(--card-radius)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', marginTop: 40 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', marginBottom: 8 }}>Still have questions?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Our team is here to help</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/support"><button className="btn-gold">💬 Live Chat</button></Link>
                    <Link to="/size-guide"><button className="btn-outline-gold">📏 Size Guide</button></Link>
                </div>
            </div>

            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }`}</style>
        </div>
    );
}

export default FaqPage;
