import React, { useEffect, useState } from "react";
import "./Fabrics.css";
import FabricAPI from "../../services/FabricAPI";
import CartAPI from "../../services/CartAPI";
import * as ProductTypes from "../../constants/ProductTypes";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from '../../components/ui/Toast/Toast';

function Fabrics() {
    const [fabrics, setFabrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeFilter, setActiveFilter] = useState("All");
    const [addingToCart, setAddingToCart] = useState(false);
    const [quickAdding, setQuickAdding] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 12;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();

    const filters = ["All", "Cotton", "Velvet", "Linen", "Silk", "Wool"];

    useEffect(() => {
        async function getFabrics() {
            let result = await FabricAPI.getAllFabrics();
            setFabrics(result || []);
            setLoading(false);
        }
        getFabrics();
        const q = searchParams.get('search');
        if (q) setSearchQuery(q);
    }, [searchParams]);

    const filtered = fabrics.filter(f => {
        const matchFilter = activeFilter === "All" || f.name?.toLowerCase().includes(activeFilter.toLowerCase());
        const matchSearch = !searchQuery || f.name?.toLowerCase().includes(searchQuery.toLowerCase()) || f.color?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchFilter && matchSearch;
    });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const openCard = (fabric) => {
        setSelected(fabric);
        setQuantity(1);
    };

    const closeCard = () => setSelected(null);

    const handleCart = async () => {
        if (!localStorage.getItem('token')) { toast('Please login first', 'warning'); navigate('/login'); return; }
        setAddingToCart(true);
        const res = await CartAPI.addToCart(ProductTypes.FABRIC, selected._id, quantity);
        setAddingToCart(false);
        if (res) { toast(`${selected.name} (${quantity}m) added to cart!`, 'success'); navigate("/add-to-cart"); }
        else toast('Failed to add to cart', 'error');
    };

    const quickAddToCart = async (e, fabric) => {
        e.stopPropagation();
        if (!localStorage.getItem('token')) { toast('Please login first', 'warning'); navigate('/login'); return; }
        setQuickAdding(fabric._id);
        const res = await CartAPI.addToCart(ProductTypes.FABRIC, fabric._id, 1);
        setQuickAdding(null);
        if (res) toast(`${fabric.name} (1m) added to cart! 🛒`, 'success');
        else toast('Failed to add to cart', 'error');
    };

    return (
        <div className="fabrics-page">
            {/* Header */}
            <div className="fabrics-header">
                <span className="badge-gold">Our Collection</span>
                <h1 className="fabrics-title">Premium <span>Fabrics</span></h1>
                <p className="fabrics-subtitle">Handpicked materials for your perfect bespoke suit</p>
            </div>

            {/* Filters */}
            <div className="fabrics-filters">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, width: '100%', maxWidth: 400, margin: '0 auto 16px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or color..."
                        style={{ flex: 1, background: 'color-mix(in srgb, var(--accent, #c9a84c) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--accent, #c9a84c) 15%, transparent)', borderRadius: 20, padding: '8px 16px', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                    {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>}
                </div>
                {filters.map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="fabrics-loading">
                    <div className="spinner-border" style={{ color: '#c9a84c', width: 48, height: 48 }} role="status" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="fabrics-empty">No fabrics found.</div>
            ) : (
                <>
                <div className="fabrics-grid">
                    {paginated.map((fabric, i) => (
                        <div key={i} className="fabric-card" onClick={() => openCard(fabric)}>
                            <div className="fabric-card-img">
                                <img src={fabric.image || '/default_fabric.jpg'} alt={fabric.name} />
                                <div className="fabric-card-overlay">
                                    <span>View Details</span>
                                </div>
                            </div>
                            <div className="fabric-card-body">
                                <div className="fabric-card-top">
                                    <h3>{fabric.name}</h3>
                                    <span className="fabric-badge">{fabric.name}</span>
                                </div>
                                <div className="fabric-card-color">
                                    <span className="color-dot" style={{ background: fabric.color?.toLowerCase() === 'navy blue' ? '#1a237e' : fabric.color?.toLowerCase() }}></span>
                                    {fabric.color}
                                </div>
                                <div className="fabric-card-footer">
                                    <span className="fabric-price">£{fabric.price}<small>/m</small></span>
                                    <button onClick={(e) => quickAddToCart(e, fabric)} disabled={quickAdding === fabric._id}
                                        style={{ background: 'linear-gradient(135deg, var(--accent, #c9a84c), color-mix(in srgb, var(--accent, #c9a84c) 70%, black))', border: 'none', borderRadius: 8, padding: '6px 14px', color: 'var(--bg, #0d0d0d)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                        {quickAdding === fabric._id ? '...' : '🛒 Add'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {filtered.length > perPage && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '20px 0' }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className={`filter-btn ${page === 1 ? '' : 'active'}`} style={{ padding: '6px 14px' }}>← Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                            <button key={p} onClick={() => setPage(p)} className={`filter-btn ${p === page ? 'active' : ''}`} style={{ minWidth: 36 }}>{p}</button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className={`filter-btn ${page === totalPages ? '' : 'active'}`} style={{ padding: '6px 14px' }}>Next →</button>
                    </div>
                )}
                </>
            )}

            {/* Detail Modal */}
            {selected && (
                <div className="fabric-modal-overlay" onClick={closeCard}>
                    <div className="fabric-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeCard}>✕</button>
                        <div className="modal-content">
                            <div className="modal-img">
                                <img src={selected.image || '/default_fabric.jpg'} alt={selected.name} />
                            </div>
                            <div className="modal-info">
                                <span className="badge-gold">{selected.name}</span>
                                <h2>{selected.name} Fabric</h2>
                                <div className="modal-divider"></div>

                                <div className="modal-detail-row">
                                    <span>Color</span>
                                    <span>{selected.color}</span>
                                </div>
                                <div className="modal-detail-row">
                                    <span>Stock</span>
                                    <span>{selected.stock}m available</span>
                                </div>
                                <div className="modal-detail-row">
                                    <span>Price per meter</span>
                                    <span className="modal-price">£{selected.price}</span>
                                </div>

                                <div className="modal-quantity">
                                    <span>Quantity (meters)</span>
                                    <div className="qty-controls">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                                        <span>{quantity}m</span>
                                        <button onClick={() => setQuantity(q => q + 1)}>+</button>
                                    </div>
                                </div>

                                <div className="modal-total">
                                    Total: <strong>£{selected.price * quantity}</strong>
                                </div>

                                <button className="btn-add-cart" onClick={handleCart} disabled={addingToCart}>
                                    {addingToCart
                                        ? <span><i className="fa-solid fa-spinner fa-spin"></i> Adding...</span>
                                        : '🛒 Add to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Fabrics;
