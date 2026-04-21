import { apiFetch } from './api';

async function createSuit(fabric, type, length, waist, chest, arm_length, suit_screenshot){
    try {
        const token = localStorage.getItem('token')
        let formData = new FormData()
        formData.append('type', type)
        formData.append('fabric', fabric._id)
        formData.append('length', length)
        formData.append('waist', waist)
        formData.append('chest', chest)
        formData.append('arm_length', arm_length)
        if (suit_screenshot) formData.append('image', suit_screenshot)
        const res = await apiFetch('/api/v1/suit', {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`},
            body: formData
        })
        if(!res.ok) return null
        return res.json()
    } catch(err) {
        console.warn('Failed to create suit:', err.message)
        return null
    }
}

async function getAllSuit(){
    try {
        const res = await apiFetch('/api/v1/suit')
        if(!res.ok) return { suits: [] }
        return res.json()
    } catch(err) {
        console.warn('Failed to fetch suits:', err.message)
        return { suits: [] }
    }
}

const SuitAPI = { createSuit, getAllSuit };
export default SuitAPI;
