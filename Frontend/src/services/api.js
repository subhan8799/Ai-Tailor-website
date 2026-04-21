const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function apiFetch(path, options = {}) {
    const headers = {
        'ngrok-skip-browser-warning': 'true',
        ...options.headers,
    };
    const res = await fetch(`${API}${path}`, { ...options, headers });
    return res;
}

export { API, apiFetch };
