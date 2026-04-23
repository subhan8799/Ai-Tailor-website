import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import "./Header.css"
import AuthAPI from '../../../services/AuthAPI';
import UserAPI from '../../../services/UserAPI';
import GlobalSearch from '../GlobalSearch/GlobalSearch';
import NotificationBell from '../NotificationBell/NotificationBell';
import { apiFetch, API } from '../../../services/api';
import { on } from '../../../services/events';

const NAV_ITEMS = [
    { label: 'Home', to: '/' },
    { label: 'Design', to: '/design' },
    { label: 'Fabrics', to: '/fabrics' },
    { label: 'Suits', to: '/readymade-suit' },
    { label: 'Reviews', to: '/reviews' },
    { label: 'Style Guide', to: '/style-guide' },
    { label: 'Support', to: '/support' },
];

const imgUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API}${path}`;
};

const Header = (props) => {
    const [userId, setUserID] = useState(false)
    const [userInfo, setUserInfo] = useState("")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [cartCount, setCartCount] = useState(0)
    const dropdownRef = useRef(null)

    const loadCartCount = async () => {
        try {
            const uid = localStorage.getItem('user_id');
            const tok = localStorage.getItem('token');
            if (!uid || !tok) { setCartCount(0); return; }
            const cartRes = await apiFetch(`/api/v1/cart/user/${uid}`, { headers: { 'Authorization': `Bearer ${tok}` } });
            const cartData = await cartRes.json();
            setCartCount(cartData.cartItems?.length || 0);
        } catch { setCartCount(0); }
    };

    useEffect(() => {
        async function load() {
            const loggedIn = await AuthAPI.isLoggedIn()
            setUserID(loggedIn)
            if (loggedIn) {
                const res = await UserAPI.getUser(props.user_id, props.token)
                setUserInfo(res)
                loadCartCount();
            }
        }
        load()
        // Listen for cart changes (small delay to let backend commit)
        const unsub = on('cart-updated', () => setTimeout(loadCartCount, 200));
        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const handleOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
        }
        document.addEventListener('mousedown', handleOutside)
        return () => document.removeEventListener('mousedown', handleOutside)
    }, [])

    const handleLogOut = () => {
        localStorage.removeItem("user_id")
        localStorage.removeItem('token')
        window.location.href = '/login'
    }

    // LOGGED OUT
    if (!userId) {
        return (
            <header>
                <div className='logo-img'><Link to="/"><h1 className='brand-title'>MZ Tailor</h1></Link></div>
                <div className='user-actions'>
                    <Link to="/login" className="header-auth-btn login-btn">Login</Link>
                    <Link to="/register" className="header-auth-btn register-btn">Register</Link>
                </div>
            </header>
        );
    }

    // LOGGED IN
    return (
        <>
        <header>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>☰</button>
            <nav className="desktop-nav">
                {NAV_ITEMS.map(item => (<Link key={item.to} className="nav-link-item" to={item.to}>{item.label}</Link>))}
                <Link className="nav-link-item" to={userInfo?.isAdmin ? '/admin/orders' : '/user-order-list'}>Orders</Link>
            </nav>
            <div className='logo-img'><Link to="/"><h1 className='brand-title'>MZ Tailor</h1></Link></div>
            <div className='user-actions'>
                <GlobalSearch />
                {userInfo?.isAdmin && <Link to='/admin' className='header-icon-btn' title="Admin">⚙️</Link>}
                <NotificationBell />
                <Link to='/wishlist' className='header-icon-btn' title="Wishlist">💝</Link>

                {/* Cart with count badge */}
                <Link to='/add-to-cart' className='header-icon-btn' title="Cart" style={{ position: 'relative' }}>
                    🛒
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute', top: -6, right: -6,
                            background: '#e74c3c', color: '#fff', fontSize: 9, fontWeight: 700,
                            width: 18, height: 18, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>{cartCount > 9 ? '9+' : cartCount}</span>
                    )}
                </Link>

                <div className="custom-dropdown" ref={dropdownRef}>
                    <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                        {userInfo?.image ? <img className="user-avatar" src={imgUrl(userInfo.image)} alt="" /> : <i className="fa-regular fa-user"></i>}
                    </button>
                    {dropdownOpen && (
                        <div className="custom-dropdown-menu">
                            <div className="drop-user-info">
                                {userInfo?.image ? <img className="drop-avatar" src={imgUrl(userInfo.image)} alt="" /> : <div className="drop-avatar-placeholder"><i className="fa-regular fa-user"></i></div>}
                                <div><p className="drop-name">{userInfo?.username}</p><p className="drop-email">{userInfo?.email}</p></div>
                            </div>
                            <div className="drop-divider"></div>
                            <Link className='drop-item' to="/profile" onClick={() => setDropdownOpen(false)}>👤 My Profile</Link>
                            <Link className='drop-item' to={userInfo?.isAdmin ? '/admin/orders' : '/user-order-list'} onClick={() => setDropdownOpen(false)}>📦 {userInfo?.isAdmin ? 'Customer Orders' : 'My Orders'}</Link>
                            <Link className='drop-item' to="/wishlist" onClick={() => setDropdownOpen(false)}>💝 Wishlist</Link>
                            {userInfo?.isAdmin && <Link className='drop-item' to="/admin" onClick={() => setDropdownOpen(false)}>⚙️ Admin Panel</Link>}
                            {userInfo?.isAdmin && <Link className='drop-item' to="/analytics" onClick={() => setDropdownOpen(false)}>📊 Analytics</Link>}
                            <button className='drop-item drop-signout' onClick={handleLogOut}>Sign Out</button>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}
        <div className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-sidebar-header">
                <span className="mobile-brand">MZ Tailor</span>
                <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
            </div>
            {NAV_ITEMS.map(item => (<Link key={item.to} className="mobile-nav-item" to={item.to} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>))}
            <Link className="mobile-nav-item" to="/add-to-cart" onClick={() => setMobileMenuOpen(false)}>🛒 Cart ({cartCount})</Link>
            <Link className="mobile-nav-item" to={userInfo?.isAdmin ? '/admin/orders' : '/user-order-list'} onClick={() => setMobileMenuOpen(false)}>📦 {userInfo?.isAdmin ? 'Customer Orders' : 'Orders'}</Link>
            <Link className="mobile-nav-item" to="/wishlist" onClick={() => setMobileMenuOpen(false)}>💝 Wishlist</Link>
            {userInfo?.isAdmin && <Link className="mobile-nav-item" to="/admin" onClick={() => setMobileMenuOpen(false)}>⚙️ Admin</Link>}
        </div>
        </>
    );
};

export default Header;
