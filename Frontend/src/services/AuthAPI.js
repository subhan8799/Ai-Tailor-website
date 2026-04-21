function parseJwt(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(json);
    } catch { return null; }
}

async function isLoggedIn(){
    const token = localStorage.getItem("token")
    if(!token) return false
    const decoded = parseJwt(token)
    if(!decoded) return false
    if(decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        localStorage.removeItem('token')
        localStorage.removeItem('user_id')
        return false
    }
    return true
}

const AuthAPI = { isLoggedIn };
export default AuthAPI;
