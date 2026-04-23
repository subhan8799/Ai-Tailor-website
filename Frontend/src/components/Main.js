import { BrowserRouter as Router, Routes as Switch, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";

// Core components
import Footer from "./layout/Footer/Footer";
import Header from "./layout/Header/Header";

// Services and widgets
import UserAPI from "../services/UserAPI";
import ChatbotWidget from "./layout/ChatbotWidget/ChatbotWidget";

// Page components
import FabricCompare from "../pages/FabricCompare/FabricCompare";
import FaqPage from "../pages/FaqPage/FaqPage";
import ShoppingCart from "../pages/ShoppingCart/ShoppingCart";
import CheckoutSuccess from "../pages/CheckoutSuccess/CheckoutSuccess";
import ReadymadeSuit from "../pages/ReadymadeSuit/ReadymadeSuit";
import UserOrderList from "../pages/UserOrderList/UserOrderList";
import CartEdit from "../pages/CartEdit/CartEdit";

// Lazy loaded pages
const Home = lazy(() => import("../pages/Home/Home"));
const About = lazy(() => import("../pages/About/About"));
const Login = lazy(() => import("../pages/Auth/Login/Login"));
const Register = lazy(() => import("../pages/Auth/Register/Register"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword/ResetPassword"));
const Support = lazy(() => import("../pages/Support/Support"));
const Fabrics = lazy(() => import("../pages/Fabrics/Fabrics"));
const DesignSuit = lazy(() => import("../pages/DesignSuit/DesignSuit"));
const AdminPanel = lazy(() => import("../pages/Admin/AdminPanel/AdminPanel"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const Reviews = lazy(() => import("../pages/Reviews/Reviews"));
const AnalyticsDashboard = lazy(() => import("../pages/Admin/AnalyticsDashboard/AnalyticsDashboard"));
const StyleRecommendation = lazy(() => import("../pages/StyleRecommendation/StyleRecommendation"));
const WishlistPage = lazy(() => import("../pages/WishlistPage/WishlistPage"));
const SizeGuide = lazy(() => import("../pages/SizeGuide/SizeGuide"));

const AdminOnly = ({Component}) => {
    const [isAdmin, setIsAdmin] = useState(null)
    useEffect(() => {
        async function checkAdmin(){
            const uid = localStorage.getItem('user_id')
            const tok = localStorage.getItem('token')
            setIsAdmin(await UserAPI.isAdmin(uid, tok))
        }
        checkAdmin()
    }, [])
    if(isAdmin === null) return (
        <div style={{display:'flex',justifyContent:'center',padding:80}}>
            <div className="spinner-border" style={{color:'#c9a84c'}} role="status" />
        </div>
    )
    return isAdmin ? <Component /> : <Navigate to="/login" />
}

const LoginOnly = ({Component}) => {
    if(!localStorage.getItem('token')) return <Navigate to="/login" />
    return <Component />
}

function Main(){
    const user_id = localStorage.getItem('user_id')
    const token = localStorage.getItem('token')

    const LoadingSpinner = () => (
        <div style={{display:'flex',justifyContent:'center',padding:80}}>
            <div className="spinner-border" style={{color:'#c9a84c'}} role="status" />
        </div>
    );

    return(
        <Router>
            <div className="App">
            <Header user_id={user_id} token={token}/>
            <Suspense fallback={<LoadingSpinner />}>
            <Switch>
            {/* Admin Panel */}
            <Route path="/admin" element={<AdminOnly Component={AdminPanel} />} />
            <Route path="/admin/*" element={<AdminOnly Component={AdminPanel} />} />

            {/* Public */}
            <Route path="/" element={<Home/>} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/support" element={<Support />} />
            <Route path="/fabrics" element={<Fabrics />} />
            <Route path="/readymade-suit" element={<ReadymadeSuit />} />
            <Route path="/design" element={<DesignSuit />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/style-guide" element={<StyleRecommendation />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/compare" element={<FabricCompare />} />
            <Route path="/faq" element={<FaqPage />} />

            {/* Auth Required */}
            <Route path="/profile" element={<LoginOnly Component={Profile} />} />
            <Route path="/wishlist" element={<LoginOnly Component={WishlistPage} />} />
            <Route path="/analytics" element={<AdminOnly Component={AnalyticsDashboard} />} />
            <Route path="/add-to-cart" element={<LoginOnly Component={ShoppingCart} />} />
            <Route path="/cart-edit" element={<LoginOnly Component={CartEdit} />} />
            <Route path="/user-order-list" element={<LoginOnly Component={UserOrderList} />} />
            <Route path="/checkout-success" element={<LoginOnly Component={CheckoutSuccess} />} />
            </Switch>
            </Suspense>
            <Footer/>
            <ChatbotWidget />
            </div>
        </Router>
    );
}
export default Main;
