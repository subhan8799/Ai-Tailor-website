import { BrowserRouter as Router, Routes as Switch, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home/Home";
import About from "../pages/About/About";
import Footer from "./layout/Footer/Footer";
import Header from "./layout/Header/Header";
import Login from "../pages/Auth/Login/Login";
import Register from "../pages/Auth/Register/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword/ResetPassword";
import Support from "../pages/Support/Support";
import Fabrics from "../pages/Fabrics/Fabrics";
import DesignSuit from "../pages/DesignSuit/DesignSuit";
import AdminPanel from "../pages/Admin/AdminPanel/AdminPanel";
import Profile from "../pages/Profile/Profile";
import Reviews from "../pages/Reviews/Reviews";
import AnalyticsDashboard from "../pages/Admin/AnalyticsDashboard/AnalyticsDashboard";
import StyleRecommendation from "../pages/StyleRecommendation/StyleRecommendation";
import WishlistPage from "../pages/WishlistPage/WishlistPage";
import SizeGuide from "../pages/SizeGuide/SizeGuide";
import FabricCompare from "../pages/FabricCompare/FabricCompare";
import FaqPage from "../pages/FaqPage/FaqPage";

import UserAPI from "../services/UserAPI";
import ChatbotWidget from "./layout/ChatbotWidget/ChatbotWidget";
import { useEffect, useState } from "react";
import ShoppingCart from "../pages/ShoppingCart/ShoppingCart";
import CheckoutSuccess from "../pages/CheckoutSuccess/CheckoutSuccess"
import ReadymadeSuit from "../pages/ReadymadeSuit/ReadymadeSuit";
import UserOrderList from "../pages/UserOrderList/UserOrderList";
import CartEdit from "../pages/CartEdit/CartEdit";

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

    return(
        <Router>
            <div className="App">
            <Header user_id={user_id} token={token}/>
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
            <Footer/>
            <ChatbotWidget />
            </div>
        </Router>
    );
}
export default Main;
