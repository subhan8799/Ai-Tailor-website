require('dotenv').config();
require('express-async-errors');
const cors = require('cors')
const http = require('http')
const socketio = require('socket.io')
const compression = require('compression')

const express = require('express');
const app = express();

// Performance optimizations
app.use(compression()); // Enable gzip compression
app.use((req, res, next) => {
    // Set cache headers for static files
    if (req.path.startsWith('/uploads')) {
        res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
    }
    next();
});

const allowedOrigins = [
    "https://tailor-maven-app.vercel.app",
    "https://tailor-maven-app.vercel.app/",
    "http://localhost:3000",
    "http://localhost:3000/",
    "http://localhost:3002",
    "http://localhost:3002/",
    ];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            console.log('origin', origin)
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/UserRouter')
const fabricRoutes = require('./routes/FabricRouter')
const suitRoutes = require('./routes/SuitRouter')
const chatRoutes = require('./routes/ChatRouter')
const cartRoutes = require('./routes/CartRoutes')
const orderRoutes = require('./routes/OrderRoutes')
const adminRoutes = require('./routes/AdminRouter')
const proRoutes = require('./routes/ProRoutes')
const extraRoutes = require('./routes/ExtraRoutes')

const passportMiddleware = require('./configs/passport-config')

const chatController = require('./controllers/ChatController')

const connectDB = require('./db/connect')

const port = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cors({origin: '*'}))
const uploadsPath = require('path').resolve(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath))

app.use(passportMiddleware.sessionMiddleware);
app.use(passportMiddleware.passportInitialize);
app.use(passportMiddleware.passportSession);

app.use('/api/v1/user', userRoutes)
app.use('/api/v1/fabric', fabricRoutes)
app.use('/api/v1/suit', suitRoutes)
app.use('/api/v1/cart', cartRoutes)
app.use('/api/v1/order', orderRoutes)
app.use('/api/v1/conversation', chatRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/pro', proRoutes)
app.use('/api/v1/extra', extraRoutes)
app.use('/auth', authRoutes);

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        var server

        if(process.env.SERVER_ENV === "production"){
            server = http.createServer(app)
        } else {

            server = app.listen(port, console.log(`Server running in Development\nhttp://localhost:${process.env.PORT}`))
        }


        // Socket.io Server
        const io = socketio(server, {
            cors: {
            //   origin: allowedOrigins,
              origin: '*',
            }
        })

        io.on("connection", (socket) => {
            console.log(`New Socket.io Connection: ${socket.id}`)

            chatController.eventHandler(io, socket)

        })
    } catch (error) {
        console.log(error)
    }
}

start()

module.exports = app