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
        console.log('Creating suit with:', { type, fabric: fabric._id, length, waist, chest, arm_length, hasImage: !!suit_screenshot })
        let res = await apiFetch('/api/v1/suit', {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`},
            body: formData
        })
        console.log('Suit API response status:', res.status)
        const text = await res.text()
        console.log('Suit API response body:', text)
        try {
            const data = JSON.parse(text)
            if (!res.ok) return null
            return data
        } catch {
            console.error('Failed to parse response:', text)
            return null
        }
    } catch(err) {
        console.error('Suit creation exception:', err)
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
