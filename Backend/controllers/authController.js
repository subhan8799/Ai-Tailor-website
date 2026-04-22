const {ReasonPhrases, StatusCodes} = require('http-status-codes')

const User = require('../models/User')
const jwt = require('jsonwebtoken')
const admin = require('../configs/firebase-config')
const { sendPasswordResetEmail } = require('../configs/email-config')

const googleCallback = (request, response) => {
    response.redirect(`http://localhost:3000/?token=${request.authInfo}&userID=${request.user._id}`)
}

const firebaseAuth = async (req, res) => {
    const { idToken } = req.body
    if (!idToken) return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'No Firebase ID token provided' })

    try {
        console.log('Verifying Firebase token...')
        const decoded = await admin.auth().verifyIdToken(idToken)
        console.log('Firebase token verified for:', decoded.email)
        
        const { uid, email, name, picture } = decoded

        let user = await User.findOne({ $or: [{ googleId: uid }, { email }] })

        if (!user) {
            console.log('Creating new user from Firebase:', email)
            const username = email.split('@')[0] + '_' + uid.slice(0, 5)
            user = await User.create({
                username,
                name: name || username,
                email,
                googleId: uid,
                image: picture || '',
            })
        } else {
            console.log('Found existing user:', user._id)
        }

        const token = user.createJWT()
        console.log('Firebase login successful for user:', user._id)
        return res.header('Authorization', `Bearer ${token}`).status(StatusCodes.OK).json({ userID: user._id, token })
    } catch (err) {
        console.error('Firebase auth error:', err.message)
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid Firebase token', error: err.message })
    }
}

const register = async (req, res) => {
    const {username, password} = req.body

    if (!username || !password){
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Username or Password not provided!" })
    }
    
    if( await User.findOne({username: username})){
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "User already exists!" })
    }

    const imagePath = req.file ? (req.file.path?.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`) : '';

    const user = await User.create({
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        gender: req.body.gender,
        image: imagePath,
        dob: req.body.dob,
        address: req.body.address,
        phone: req.body.phone,
        isAdmin: req.body.username === 'admin'
    })
    const token = user.createJWT()

    console.log(`Registered User: ${user._id}`)
    res.header('Authorization', `Bearer ${token}`).status(StatusCodes.CREATED).json({ userID: user._id, token })
}

const login = async (req, res) => {
    const {username, password} = req.body

    // Check username & password is provided in the request
    if (!username || !password){
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Username or Password not provided!" })
    }

    const user = await User.findOne({username: username})
    console.log(user)

    // Check if user exist with provied username
    if (!user){
        return res.status(StatusCodes.NOT_FOUND).json({ msg: "No user found with provided username!" })
    }
    
    // Check if user created through google exists
    if (user.googleId){
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Account created through Google already exists" })
    }
    
    // Check password
    const validPassword = await user.comparePassword(password)
    if (!validPassword){
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Password missmatch!" })
    }
    
    const token = user.createJWT()
    
    res.header('Authorization', `Bearer ${token}`).status(StatusCodes.OK).json({ userID: user._id, token })


}

const checkLogin = async (req, res) => {
    const authToken = req.params.token
    
    try{
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET)       // It verifies token with secret and also checks if token is expired or not
        return res.status(StatusCodes.OK).json({ valid: true, decoded: decoded })
    } catch (err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ valid: false, msg: "Couldn't verify JWT Token!", error: err });
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body
    
    if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Email is required!" })
    }
    
    try {
        const user = await User.findOne({ email: email })
        
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: "No user found with this email!" })
        }
        
        // Generate reset token
        const resetToken = user.generatePasswordResetToken()
        await user.save()
        
        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`
        
        // Send email
        const emailSent = await sendPasswordResetEmail(email, resetToken, resetUrl)
        
        if (!emailSent) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                msg: "Failed to send password reset email. Please try again later." 
            })
        }
        
        console.log(`Password reset link sent to: ${email}`)
        console.log(`Reset URL: ${resetUrl}`)
        
        return res.status(StatusCodes.OK).json({ 
            msg: "Password reset link sent to your email"
        })
    } catch (err) {
        console.error('Forgot password error:', err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Error processing request", error: err.message })
    }
}

const resetPassword = async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body
    
    if (!token || !newPassword || !confirmPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Token and new password are required!" })
    }
    
    if (newPassword !== confirmPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Passwords do not match!" })
    }
    
    try {
        const user = await User.findOne({ passwordResetToken: { $exists: true } })
        
        if (!user || !user.verifyPasswordResetToken(token)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid or expired reset token!" })
        }
        
        // Update password
        user.password = newPassword
        user.passwordResetToken = null
        user.passwordResetExpiry = null
        await user.save()
        
        return res.status(StatusCodes.OK).json({ msg: "Password reset successfully!" })
    } catch (err) {
        console.error('Reset password error:', err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Error resetting password", error: err.message })
    }
}

module.exports = {
    googleCallback,
    firebaseAuth,
    register,
    login,
    checkLogin,
    forgotPassword,
    resetPassword,
    failure: (req, res) => res.send('Failed to authenticate..'),
};
