# 🎨 Tailor Maven - Bespoke Suit Customization Platform

<div align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-blue" alt="MERN Stack">
  <img src="https://img.shields.io/badge/React-18.2.0-blue" alt="React">
  <img src="https://img.shields.io/badge/Node.js-18.0+-green" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-orange" alt="MongoDB Atlas">
  <img src="https://img.shields.io/badge/Stripe-Payments-635bff" alt="Stripe">
  <img src="https://img.shields.io/badge/License-Apache%202.0-green" alt="Apache License 2.0">
  <img src="https://img.shields.io/badge/Status-Production--Ready-success" alt="Status">
</div>

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [🏗️ Project Structure](#%EF%B8%8F-project-structure)
- [🚀 Installation & Setup](#-installation--setup)
- [⚙️ Environment Configuration](#%EF%B8%8F-environment-configuration)
- [🎮 Usage](#-usage)
- [📡 API Documentation](#-api-documentation)
- [🔐 Authentication](#-authentication)
- [💳 Payment Integration](#-payment-integration)
- [📱 Responsive Design](#-responsive-design)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👥 Support](#-support)

## 🎯 Overview

**Tailor Maven** is a cutting-edge, full-stack web application that revolutionizes the bespoke tailoring industry. Our platform empowers users to design, customize, and order personalized suits from the comfort of their homes. With an intuitive 3D visualization system, extensive fabric library, and seamless payment integration, we bridge the gap between traditional tailoring craftsmanship and modern digital convenience.

### 🎨 What Makes Us Different

- **3D Suit Visualization**: Real-time 3D rendering of custom designs
- **150+ Premium Fabrics**: Curated collection of high-quality materials
- **AI-Powered Recommendations**: Smart style suggestions based on preferences
- **Real-time Collaboration**: Connect with professional tailors
- **Secure Payments**: Stripe integration with multiple payment methods
- **Global Shipping**: Worldwide delivery with tracking

## ✨ Features

### 👤 User Features
- 🔐 **Dual Authentication**: Username/Password + Google OAuth 2.0
- 👗 **Custom Suit Design**: Interactive 3D suit builder
- 📏 **Body Measurements**: Precise measurement tools with guides
- 🛒 **Smart Shopping Cart**: Persistent cart with customization options
- 💝 **Gift Orders**: Send personalized suits as gifts
- 📦 **Order Tracking**: Real-time delivery updates
- ⭐ **Review System**: Rate and review fabrics and tailors
- 💬 **Live Chat**: Real-time support with AI chatbot

### 👨‍💼 Admin Features
- 📊 **Dashboard Analytics**: Comprehensive business insights
- 📈 **Order Management**: Complete order lifecycle management
- 🏪 **Inventory Control**: Fabric and product stock management
- 👥 **User Management**: Customer account administration
- 📊 **Sales Reports**: Detailed financial and performance reports
- 🎨 **Content Management**: Update fabrics, styles, and pricing

### 🛡️ Security & Performance
- 🔒 **JWT Authentication**: Secure token-based authentication
- 🛡️ **Data Encryption**: End-to-end encryption for sensitive data
- 🚀 **Optimized Performance**: Lazy loading, caching, and compression
- 📱 **Mobile Responsive**: Seamless experience across all devices

## 🛠️ Tech Stack

### 🎨 Frontend
```json
{
  "React": "18.2.0",
  "React Router": "6.8.0",
  "React Three Fiber": "8.13.0",
  "Bootstrap": "5.2.3",
  "Axios": "1.3.4",
  "Firebase": "9.17.0",
  "Stripe.js": "1.52.0"
}
```

### ⚙️ Backend
```json
{
  "Node.js": "18.0+",
  "Express.js": "4.18.2",
  "MongoDB": "6.0+",
  "Mongoose": "7.0.0",
  "Passport.js": "0.6.0",
  "Socket.io": "4.7.0",
  "JWT": "9.0.0",
  "Stripe": "11.0.0"
}
```

### 🗄️ Database & Services
- **MongoDB Atlas**: Cloud-hosted NoSQL database
- **Cloudinary**: Media file hosting and optimization
- **Stripe**: Payment processing
- **Google OAuth 2.0**: Social authentication
- **Socket.io**: Real-time communication

## 🏗️ Project Structure

```
Ai-Tailor-website/
├── 📁 Backend/                          # Node.js/Express Server
│   ├── 📄 index.js                      # Main server file
│   ├── 📄 package.json                  # Backend dependencies
│   ├── 📄 vercel.json                   # Deployment configuration
│   ├── 📁 configs/                      # Configuration files
│   │   ├── 📄 email-config.js          # Email service setup
│   │   ├── 📄 firebase-config.js       # Firebase configuration
│   │   ├── 📄 passport-config.js       # OAuth authentication
│   │   ├── 📄 stripe-config.js         # Payment configuration
│   │   └── 📄 upload-config.js         # File upload settings
│   ├── 📁 controllers/                  # Business logic
│   │   ├── 📄 authController.js        # Authentication logic
│   │   ├── 📄 CartController.js        # Shopping cart management
│   │   ├── 📄 ChatController.js        # Chat functionality
│   │   ├── 📄 FabricController.js      # Fabric management
│   │   ├── 📄 OrderController.js       # Order processing
│   │   └── 📄 SuitController.js        # Suit customization
│   ├── 📁 db/                          # Database configuration
│   │   └── 📄 connect.js               # MongoDB connection
│   ├── 📁 middleware/                   # Custom middleware
│   │   └── 📄 authMiddleware.js        # Authentication middleware
│   ├── 📁 models/                      # Database schemas
│   │   ├── 📄 User.js                  # User model
│   │   ├── 📄 Fabric.js                # Fabric model
│   │   ├── 📄 Suit.js                  # Suit model
│   │   ├── 📄 Order.js                 # Order model
│   │   └── 📄 Cart.js                  # Shopping cart model
│   ├── 📁 routes/                      # API routes
│   │   ├── 📄 authRoutes.js            # Authentication endpoints
│   │   ├── 📄 FabricRouter.js          # Fabric API routes
│   │   ├── 📄 OrderRoutes.js           # Order API routes
│   │   └── 📄 UserRouter.js            # User API routes
│   ├── 📁 constants/                   # Application constants
│   │   ├── 📄 FabricTypes.js           # Fabric type definitions
│   │   ├── 📄 GenderTypes.js           # Gender type constants
│   │   ├── 📄 OrderStatus.js           # Order status enums
│   │   └── 📄 SuitTypes.js             # Suit type definitions
│   └── 📁 uploads/                     # File upload directory
│
├── 📁 Frontend/                         # React Application
│   ├── 📄 package.json                  # Frontend dependencies
│   ├── 📁 public/                       # Static assets
│   │   ├── 📄 index.html               # Main HTML template
│   │   ├── 📄 manifest.json            # PWA configuration
│   │   └── 📄 robots.txt               # SEO configuration
│   ├── 📁 src/                         # Source code
│   │   ├── 📄 App.js                   # Main React component
│   │   ├── 📄 index.js                 # React entry point
│   │   ├── 📄 firebase.js              # Firebase configuration
│   │   ├── 📁 components/              # Reusable components
│   │   │   ├── 📁 layout/              # Layout components
│   │   │   │   ├── 📁 Header/          # Navigation header
│   │   │   │   ├── 📁 Footer/          # Site footer
│   │   │   │   └── 📁 ChatbotWidget/   # AI chatbot
│   │   │   └── 📁 ui/                  # UI components
│   │   ├── 📁 pages/                   # Page components
│   │   │   ├── 📁 Auth/                # Authentication pages
│   │   │   │   ├── 📁 Login/           # Login page
│   │   │   │   └── 📁 Register/        # Registration page
│   │   │   ├── 📁 DesignSuit/          # Suit design interface
│   │   │   ├── 📁 Fabrics/             # Fabric selection
│   │   │   ├── 📁 ShoppingCart/        # Cart management
│   │   │   └── 📁 Profile/             # User profile
│   │   ├── 📁 services/                # API services
│   │   │   ├── 📄 AuthAPI.js           # Authentication service
│   │   │   ├── 📄 FabricAPI.js         # Fabric API calls
│   │   │   ├── 📄 SuitAPI.js           # Suit API calls
│   │   │   └── 📄 apiCache.js          # API response caching
│   │   ├── 📁 constants/               # Frontend constants
│   │   ├── 📁 styles/                  # Styling
│   │   │   └── 📄 constants.js         # Style constants
│   │   └── 📁 utils/                   # Utility functions
│   │       └── 📄 helpers.js           # Helper functions
│   └── 📁 build/                       # Production build
│
├── 📄 README.md                         # Project documentation
├── 📄 OPTIMIZATION_GUIDE.md            # Performance guide
├── 📄 PROJECT_STRUCTURE.md             # Structure documentation
├── 📄 LICENSE                          # License information
└── 📄 .gitignore                       # Git ignore rules
```

## 🚀 Installation & Setup

### 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18.0 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Atlas** account - [Sign up here](https://www.mongodb.com/atlas)
- **Git** - [Download here](https://git-scm.com/)

### 🔧 Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tailor-maven.git
   cd tailor-maven
   ```

2. **Navigate to backend directory:**
   ```bash
   cd Backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Configure environment variables:**
   ```bash
   # Edit .env with your configuration (see Environment Configuration section)
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```

   **Expected output:**
   ```
   ✅ Connected to MongoDB
   ✅ Server running on port 5000
   ```

### 🎨 Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd ../Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Edit .env with your configuration (see Environment Configuration section)
   ```

4. **Start the frontend development server:**
   ```bash
   npm start
   ```

   **Expected output:**
   ```
   Compiled successfully!
   You can now view tailor-maven in the browser.
   Local: http://localhost:3000
   ```

### 🧪 Testing the Setup

1. **Open your browser and visit:** `http://localhost:3000`
2. **Backend API should be available at:** `http://localhost:5000`
3. **Test authentication by trying to sign up or log in**

## ⚙️ Environment Configuration

### Backend Environment Variables (.env)

Create a `.env` file in the `Backend/` directory with the following variables:

```env
# Server Configuration
PORT=5000
SERVER_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tailormaven?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_LIFETIME=1d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Firebase (for mobile auth)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"

# Cloudinary (Media File Hosting)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# SMTP Settings (Alternative)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
```

### Frontend Environment Variables (.env)

Create a `.env` file in the `Frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 🎮 Usage

### 👤 For Users

1. **Sign Up/Login:**
   - Visit the website and click "Sign In"
   - Choose between email/password or Google authentication
   - Complete your profile with measurements

2. **Design Your Suit:**
   - Browse our fabric collection (150+ options)
   - Use the 3D suit builder to customize your design
   - Take accurate body measurements
   - Save designs for later

3. **Place Orders:**
   - Add custom suits to cart
   - Choose delivery options
   - Complete secure payment via Stripe
   - Track orders in real-time

4. **Manage Account:**
   - Update profile and measurements
   - View order history
   - Leave reviews and ratings

### 👨‍💼 For Administrators

1. **Access Admin Dashboard:**
   - Use admin credentials to log in
   - Navigate to `/admin` route

2. **Manage Inventory:**
   - Add/remove fabrics and materials
   - Update pricing and availability
   - Monitor stock levels

3. **Order Management:**
   - View all customer orders
   - Update order status and tracking
   - Handle customer inquiries

4. **Analytics:**
   - View sales reports and metrics
   - Monitor user engagement
   - Generate business insights

## 📡 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |
| GET | `/auth/google` | Google OAuth initiation |
| GET | `/auth/google/callback` | Google OAuth callback |
| POST | `/auth/firebase` | Firebase authentication |
| GET | `/auth/checkLogin/:token` | Verify JWT token |

### 👤 User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/user/profile` | Get user profile |
| PUT | `/api/v1/user/profile` | Update user profile |
| GET | `/api/v1/user/orders` | Get user orders |

### 🛒 Shopping & Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cart` | Get shopping cart |
| POST | `/api/v1/cart` | Add item to cart |
| PUT | `/api/v1/cart/:id` | Update cart item |
| DELETE | `/api/v1/cart/:id` | Remove cart item |
| POST | `/api/v1/order` | Create new order |
| GET | `/api/v1/order/:id` | Get order details |

### 🎨 Fabrics & Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/fabric` | Get all fabrics |
| GET | `/api/v1/fabric/:id` | Get fabric details |
| POST | `/api/v1/fabric` | Add new fabric (Admin) |
| PUT | `/api/v1/fabric/:id` | Update fabric (Admin) |

### 💬 Real-time Features

- **WebSocket Connection:** `ws://localhost:5000`
- **Chat Events:** `send_message`, `receive_message`
- **Order Updates:** `order_status_update`

## 🔐 Authentication

### JWT Token Usage

Include the JWT token in the Authorization header for protected routes:

```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Google OAuth Flow

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. After approval, redirected back with authorization code
4. Backend exchanges code for user information
5. JWT token generated and user logged in

## 💳 Payment Integration

### Stripe Payment Flow

1. **Frontend:** Collect payment information using Stripe Elements
2. **Frontend:** Create payment intent via backend API
3. **Backend:** Process payment with Stripe API
4. **Frontend:** Confirm payment completion
5. **Backend:** Update order status and send confirmation

### Supported Payment Methods

- 💳 Credit/Debit Cards (Visa, Mastercard, American Express)
- 🏦 Bank Transfers
- 📱 Digital Wallets (Apple Pay, Google Pay)
- 💰 Buy Now, Pay Later options

## 📱 Responsive Design

Tailor Maven is fully responsive and optimized for:

- 💻 **Desktop:** 1200px and above
- 📱 **Tablet:** 768px to 1199px
- 📱 **Mobile:** 320px to 767px

### Key Responsive Features

- **Mobile-first approach** with progressive enhancement
- **Touch-friendly interfaces** for mobile users
- **Optimized 3D viewer** for different screen sizes
- **Adaptive navigation** and layouts

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 📝 Contribution Guidelines

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes and test thoroughly**
4. **Commit your changes:** `git commit -m 'Add amazing feature'`
5. **Push to the branch:** `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### 🐛 Bug Reports & Feature Requests

- Use [GitHub Issues](https://github.com/your-username/tailor-maven/issues) to report bugs
- Provide detailed steps to reproduce the issue
- Include screenshots and browser information
- Suggest improvements with clear use cases

### 📋 Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/tailor-maven.git

# Install dependencies for both frontend and backend
cd Backend && npm install
cd ../Frontend && npm install

# Set up environment variables
# Configure Backend/.env and Frontend/.env with your values (see Environment Configuration section)

# Start development servers
npm run dev  # Runs both frontend and backend concurrently
```

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

```
Apache License 2.0

Copyright 2024 Mohammad Al Rafi

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
```

## 👥 Support

### 📧 Contact Information

- **Email:** support@tailormaven.com
- **Website:** https://tailormaven.com
- **Documentation:** https://docs.tailormaven.com

### 🆘 Getting Help

- **📖 Documentation:** Comprehensive guides and API references
- **💬 Live Chat:** Available on our website during business hours
- **🎫 Support Tickets:** Submit detailed requests through our portal
- **📱 Social Media:** Follow us for updates and tips

### 🌟 Community

- **GitHub Discussions:** Join conversations with other developers
- **Discord Server:** Real-time chat with the community
- **Newsletter:** Subscribe for updates and exclusive content

---

<div align="center">
  <p><strong>Made with ❤️ by the Tailor Maven Team</strong></p>
  <p>
    <a href="#overview">Overview</a> •
    <a href="#features">Features</a> •
    <a href="#installation--setup">Installation</a> •
    <a href="#api-documentation">API Docs</a> •
    <a href="#contributing">Contributing</a>
  </p>
  <p>⭐ Star us on GitHub • 📧 Contact us • 🌐 Visit our website</p>
</div>

- ### Visualization of Suit:

    - After designing the suit, users should be able to see a 2D/3D model of the suit they designed
    - The visual model should alter according to the provided body measurements which will help users understand the fitting

- ### Gifting a Suit:

    - Users should have the option to design a suit and then gift it to another user.
    - After sending the gift, the receiver should receive a notification on their Tailor Maven profile and an email should also be sent. After the user accepts the gift, an order should automatically be placed under the name and information of the receiver.
    - In case of declining the gift, the sender should be notified. Also, a receiver should be able to block certain emails about getting gift notifications and email in case of spam.
    - If the receiver does not have an account on Tailor Maven, they should be able to create one and the gift should automatically be added to their account


- ### Ordering Process:

    - After designing the suit, users should have the option to order that suit
    - Users should first go through a payment process which will comprise of paying the required amount through an online payment gateway system
    - After the payment is confirmed, an order should be placed for the user containing the payment transaction information and delivery details taken from the user profile

- ### Order Tracking:

    - The admin should be able to update the order status through the admin dashboard accordingly.
    - Users should be able to visit their orders page and see the update of whether the suit is tailored, packaged, delivered etc.
    - After each update, the user should receive an email updating them with the current order status

- ### Connecting with Admin:

    - Users should have the option to send instant messages to the admin about any query regarding the website, product, delivery information, etc.
    - In the admin dashboard, an admin should be able to reply to those messages
    - Admin should have the ability to ban users from messaging in case of any spam
    - Any history of the messages should be auto deleted after a certain period of time

# Feasibility Analysis

- **Technical Feasibility:** All the technical requirements are technically feasible. The platform prioritizes user data privacy through secure authentication obtained via Google’s OAuth2.0 authorization system and offers a reliable payment gateway for seamless online transactions via Stripe. Scalability has been a key consideration, allowing efficient database management through MongoDB Atlas, ensuring the storage and retrieval of user design preferences and order details. A realistic 2D/3D preview of their designed suits can be obtained by a powerful frontend framework Three.js. In summary, the technically feasible website provides a cutting-edge solution for personalized suit design and ordering, combining advanced design features with secure and scalable architecture.

- **Operational Feasibility:** TailorMaven's operational feasibility appears strong. It aligns with current trends in the bespoke(custom-made) tailoring industry, offering personalized suit design and seamless online ordering. The website's intuitive interface and clear instructions should facilitate user adoption, enhancing the overall user experience. With efficient workflows for fabric selection, measurement input, and order management, TailorMaven ensures smooth day-to-day operations and timely delivery of bespoke suits to customers.

- **Economical Feasibility:** TailorMaven demonstrates strong economic feasibility, with revenue generated through suit sales, fabric-only purchases, and gifting options. Costs include development, maintenance, and operational expenses such as fabric sourcing and tailoring. However, benefits come from sales revenue and potential partnerships with fashion influencers or wedding planners. By offering competitive pricing and maximizing profit margins through efficient operations, TailorMaven aims to achieve profitability and sustained growth in the bespoke tailoring market.

- **Schedule Feasibility:** Considering our team's expertise and experience, building TailorMaven is feasible, although our familiarity with certain technical stacks may require additional time for learning and implementation. We aim to start early to accommodate any learning curves and ensure timely completion. By adhering to a structured development process with regular sprints, we plan to finish building the product before the established deadline, maintaining a balance between quality and time constraints.


## Functional Requirements:
- User Authentication and Profile Management
- Admin Dashboard
- Designing Suit
- Visualization of Suit
- Gifting Suit
- Ordering Process
- Order Tracking
- Connecting with Admin

## Non-Functional Requirements:
- Performance
- Security
- Reliability
- Usability
- Compatibility

# Dev Logs
### Sprint 1:

*Work Done:* \
The first week of developing was totally focused on learning the MERN stack. None of our team memebers are familiar with MERN stack except React.js. So we couldn't really build that many features. The frontend team worked on building a basic landing page and the user sign in and register page, while the backend team worked on Authentication. We will provide two types of authentication, sign in with username/password and sign in with google. The backend team implemented Google sing in using OAuth2.0 in sprint 1. However, as none of us were familiar with the technologies used, we couldn't connect the database with the server. The user can sign in but no information is stored anywhere, we just made sure that google can authenticate our user and send back the necessary informations. So far in sprint 1, the frontend and the backend is not connected yet. The first week was totally spent figuring out how things work and we aim to properly dive deep in development from the next sprint.
 - ✅ Authentication: Google
 - ✅ Landing Page
 - ❌ Authentication: Username/Password
 - ❌ Connecting Authentication with Frontend
 - ❌ Database

*Plans for next Sprint:* \
The backend team aims to complete the authentication system using both methods while also properly connecting the database so that user information is stored securely. We will also start working on our product database and handle requests and response to fetch/store data. \
The frontend team aims to complete the suit matarial selection pages and connect the frontend with the backend through necessary API calls to the server.
### Sprint 2:

*Work Done:* \
For sprint 2, we mainly focused on the backend. The backend team finished working on authentication. The server API can now successfully authenticate users using both Google and Username/Password method. We used token based authentication. The frontend team connected the authentication API to the frontend. Then we implemented the database and necessary controllers for CRUD operations on our products: Suit and Fabric. The suit designing process is yet to made on the frontend. As this sprint overlapped with our midterm exam, no further work could've been done.
 - ✅ Authentication using Username/Password
 - ✅ Connected Authentication with Frontend
 - ✅ Impemented and Deployed Database
 - ✅ Created database models for User, Suit, & Fabric
 - ✅ Implemented CRUD APIs for database models

*Plans for next Sprint:* \
 So far, the frontend is lacking behind the backend so hopefully next sprint it will catch up. We aim to implement the suit desiging page properly in the next sprint while also working on the suit visualizing process. 

### Sprint 3:

*Work Done:* \
In sprint 3, we finished two features and started working on the suit visualizing feature. We implemented the admin dashboard and chatting with admin feature first. Although admin dashboard is not connected fully with the backend, it just shows informations but you can't manupulated data yet. Chatting with admin feature has been implemented with the the help of **Socket.io**, it is a websocket framework that helped us with instant messaging. For suit visualization, we used **React Three Fiber (R3F)**. I created the base 3D model in blender, then changed the material with texture images using R3F. Image upload was not done within sprint 3, so the texture images were stored manually. 
 - ✅ Admin API
 - ✅ API access permissions
 - ✅ Chat feature
 - ✅ Admin Dashboard Page
 - ✅ Suit Visualization Prototype
 - ✅ Redesign landing page
 - ✅ Logout functionality on Frontend

*Plans for next Sprint:* \
For the 4th and final sprint, we have to finish the project so we just need to finish as much features as possible. We will focus on finishing implementing the features listed above and refine them as we go. 



