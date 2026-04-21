import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from '../../services/api';

export default function CheckoutSuccess() {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true)

    async function createOrder(){
        try {
            const token = localStorage.getItem('token')
            const user_id = localStorage.getItem('user_id')
            const res = await apiFetch('/api/v1/order/checkout-success', {
                method: 'POST',
                headers: {'Authorization': `Bearer ${token}`, "Content-Type": "application/json"},
                body: JSON.stringify({
                    session_id: searchParams.get("session_id"),
                    user_id,
                    isGift: searchParams.get("isGift")
                })
            })
            if(res.ok) setIsLoading(false)
        } catch(err) { console.warn('Order creation failed:', err.message) }
    }

    useEffect(() => {
        if(searchParams.get("session_id")) createOrder()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div style={{textAlign:'center', padding:60}}>
            {!isLoading
                ? <h1 style={{color:'#c9a84c'}}>✅ Order Placed!</h1>
                : <div className="spinner-border m-3" style={{color:'#c9a84c'}} role="status" />
            }
        </div>
    );
}
