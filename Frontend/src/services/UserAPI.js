import { apiFetch } from './api';

async function getUser(user_id, token) {
    if(!user_id || !token) return false
    try {
        const res = await apiFetch(`/api/v1/user/${user_id}`, {
            headers: {'Authorization': `Bearer ${token}`}
        })
        if(!res.ok) return false
        const data = await res.json()
        return data.user
    } catch(err) {
        console.warn('Failed to fetch user:', err.message)
        return false
    }
}

async function isAdmin(user_id, token){
    if(!user_id || !token) return false
    const user = await getUser(user_id, token)
    return user?.isAdmin
}

const UserAPI = { getUser, isAdmin };
export default UserAPI;
