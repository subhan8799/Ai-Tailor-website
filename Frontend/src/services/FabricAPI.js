import { apiFetch } from './api';

async function getAllFabrics() {
    try {
        const res = await apiFetch('/api/v1/fabric')
        if(!res.ok) return []
        const data = await res.json()
        return data.fabrics || []
    } catch(err) {
        console.warn('Failed to fetch fabrics:', err.message)
        return []
    }
}

const FabricAPI = { getAllFabrics };
export default FabricAPI;
