const mongoose = require('mongoose')

const connectDB = (url) => {
    // Check if it's a local MongoDB connection (no SSL needed)
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
        return mongoose.connect(url, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
    }

    // Atlas connection with SSL
    return mongoose.connect(url, {
        ssl: true,
        tls: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        family: 4,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
    })
}

module.exports = connectDB