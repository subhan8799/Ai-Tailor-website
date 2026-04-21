import { apiFetch } from './api';
import { emit } from './events';

async function addToCart(productType, product, fabricLength = null) {
    try {
        const token = localStorage.getItem('token');
        const res = await apiFetch('/api/v1/cart', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ product_type: productType, product_id: product, fabric_length: fabricLength })
        });
        if (!res.ok) return null;
        const data = await res.json();
        emit('cart-updated');
        return data;
    } catch (err) {
        console.warn('Failed to add to cart:', err.message);
        return null;
    }
}

async function deleteFromCart(id) {
    try {
        const token = localStorage.getItem('token');
        const res = await apiFetch(`/api/v1/cart/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return null;
        const data = await res.json();
        emit('cart-updated');
        return data;
    } catch (err) {
        console.warn('Failed to delete from cart:', err.message);
        return null;
    }
}

const CartAPI = { addToCart, deleteFromCart };
export default CartAPI;
