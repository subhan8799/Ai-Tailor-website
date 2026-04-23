const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const User = require('./models/User');
const Fabric = require('./models/Fabric');
const Suit = require('./models/Suit');
const Order = require('./models/Order');
const Review = require('./models/Review');
const CartItem = require('./models/Cart');
const Appointment = require('./models/Appointment');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const { Wishlist, Notification } = require('./models/Extra');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

// Seed data
const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Fabric.deleteMany({});
        await Suit.deleteMany({});
        await Order.deleteMany({});
        await Review.deleteMany({});
        await CartItem.deleteMany({});
        await Appointment.deleteMany({});
        await Conversation.deleteMany({});
        await Message.deleteMany({});
        await Wishlist.deleteMany({});
        await Notification.deleteMany({});
        
        console.log('Cleared existing data');

        // 1. Seed Users
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const users = await User.insertMany([
            {
                username: 'admin',
                name: 'Admin User',
                email: 'admin@aitailor.com',
                password: hashedPassword,
                gender: 'male',
                isAdmin: true,
                address: '123 Admin Street, New York, NY 10001',
                phone: '+1 555-0100',
                image: ''
            },
            {
                username: 'johndoe',
                name: 'John Doe',
                email: 'john@example.com',
                password: hashedPassword,
                gender: 'male',
                isAdmin: false,
                address: '456 Customer Ave, Los Angeles, CA 90001',
                phone: '+1 555-0101',
                image: ''
            },
            {
                username: 'janesmith',
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: hashedPassword,
                gender: 'female',
                isAdmin: false,
                address: '789 Client Blvd, Chicago, IL 60601',
                phone: '+1 555-0102',
                image: ''
            },
            {
                username: 'mikebrown',
                name: 'Mike Brown',
                email: 'mike@example.com',
                password: hashedPassword,
                gender: 'male',
                isAdmin: false,
                address: '321 Buyer Lane, Houston, TX 77001',
                phone: '+1 555-0103',
                image: ''
            },
            {
                username: 'sarahwilson',
                name: 'Sarah Wilson',
                email: 'sarah@example.com',
                password: hashedPassword,
                gender: 'female',
                isAdmin: false,
                address: '654 Shopper St, Phoenix, AZ 85001',
                phone: '+1 555-0104',
                image: ''
            }
        ]);
        console.log(`✓ Seeded ${users.length} users`);

        // 2. Seed Fabrics
        const fabrics = await Fabric.insertMany([
            { name: 'Italian Wool Navy', color: 'Navy Blue', price: 299, stock: 50, image: '' },
            { name: 'Pure Cotton White', color: 'White', price: 149, stock: 100, image: '' },
            { name: 'Linen Beige', color: 'Beige', price: 199, stock: 75, image: '' },
            { name: 'Silk Charcoal', color: 'Charcoal', price: 449, stock: 25, image: '' },
            { name: 'Tweed Green', color: 'Green', price: 249, stock: 40, image: '' },
            { name: 'Cashmere Black', color: 'Black', price: 599, stock: 15, image: '' },
            { name: 'Polyester Gray', color: 'Gray', price: 99, stock: 200, image: '' },
            { name: 'Velvet Burgundy', color: 'Burgundy', price: 349, stock: 30, image: '' },
            { name: 'Flannel Blue', color: 'Blue', price: 229, stock: 60, image: '' },
            { name: 'Seersucker Stripes', color: 'White/Blue', price: 179, stock: 80, image: '' }
        ]);
        console.log(`✓ Seeded ${fabrics.length} fabrics`);

        // 3. Seed Suits
        const suits = await Suit.insertMany([
            {
                type: 'single_breast',
                fabric: fabrics[0]._id,
                user: users[1]._id,
                image: '',
                price: 799,
                length: 30,
                waist: 34,
                chest: 42,
                arm_length: 25,
                button: '2'
            },
            {
                type: 'double_breast',
                fabric: fabrics[3]._id,
                user: users[2]._id,
                image: '',
                price: 999,
                length: 28,
                waist: 30,
                chest: 38,
                arm_length: 23,
                button: '6x2'
            },
            {
                type: 'tuxedo',
                fabric: fabrics[5]._id,
                user: users[1]._id,
                image: '',
                price: 1299,
                length: 32,
                waist: 36,
                chest: 44,
                arm_length: 26,
                button: '1'
            },
            {
                type: 'single_breast',
                fabric: fabrics[4]._id,
                user: users[3]._id,
                image: '',
                price: 749,
                length: 29,
                waist: 32,
                chest: 40,
                arm_length: 24,
                button: '2'
            },
            {
                type: 'single_breast',
                fabric: fabrics[7]._id,
                user: users[4]._id,
                image: '',
                price: 899,
                length: 27,
                waist: 28,
                chest: 36,
                arm_length: 22,
                button: '2'
            }
        ]);
        console.log(`✓ Seeded ${suits.length} suits`);

        // 4. Seed Orders
        const orders = await Order.insertMany([
            {
                user: users[1]._id,
                product: suits[0]._id,
                productType: 'Suit',
                fabricLength: 2.5,
                paymentId: 'pi_1234567890',
                price: 799,
                status: 'Delivered',
                isGift: false,
                address: '456 Customer Ave, Los Angeles, CA 90001',
                phone: '+1 555-0101',
                message: 'Please deliver on weekend',
                timestamp: new Date('2025-03-15')
            },
            {
                user: users[2]._id,
                product: fabrics[1]._id,
                productType: 'Fabric',
                fabricLength: 3.0,
                paymentId: 'pi_1234567891',
                price: 447,
                status: 'Shipped',
                isGift: true,
                address: '789 Client Blvd, Chicago, IL 60601',
                phone: '+1 555-0102',
                message: 'Gift wrap please',
                timestamp: new Date('2025-04-01')
            },
            {
                user: users[3]._id,
                product: suits[2]._id,
                productType: 'Suit',
                fabricLength: 2.0,
                paymentId: 'pi_1234567892',
                price: 1299,
                status: 'Processing',
                isGift: false,
                address: '321 Buyer Lane, Houston, TX 77001',
                phone: '+1 555-0103',
                message: '',
                timestamp: new Date('2025-04-10')
            },
            {
                user: users[4]._id,
                product: fabrics[4]._id,
                productType: 'Fabric',
                fabricLength: 2.5,
                paymentId: 'pi_1234567893',
                price: 622,
                status: 'Pending',
                isGift: false,
                address: '654 Shopper St, Phoenix, AZ 85001',
                phone: '+1 555-0104',
                message: 'Need by May 1st',
                timestamp: new Date('2025-04-20')
            },
            {
                user: users[1]._id,
                product: suits[3]._id,
                productType: 'Suit',
                fabricLength: 2.8,
                paymentId: 'pi_1234567894',
                price: 749,
                status: 'Delivered',
                isGift: false,
                address: '456 Customer Ave, Los Angeles, CA 90001',
                phone: '+1 555-0101',
                message: 'Thank you!',
                timestamp: new Date('2025-02-20')
            }
        ]);
        console.log(`✓ Seeded ${orders.length} orders`);

        // 5. Seed Reviews
        const reviews = await Review.insertMany([
            {
                user: users[1]._id,
                order: orders[0]._id,
                rating: 5,
                fabricRating: 5,
                fitRating: 4,
                stitchingRating: 5,
                comment: 'Excellent quality suit! The fabric is premium and the fit is perfect. Highly recommend!',
                timestamp: new Date('2025-03-20')
            },
            {
                user: users[2]._id,
                order: orders[1]._id,
                rating: 4,
                fabricRating: 4,
                fitRating: 5,
                stitchingRating: 4,
                comment: 'Great fabric, beautiful color. Delivery was a bit slow but the product is worth it.',
                timestamp: new Date('2025-04-05')
            },
            {
                user: users[3]._id,
                order: orders[4]._id,
                rating: 5,
                fabricRating: 5,
                fitRating: 5,
                stitchingRating: 5,
                comment: 'Best suit I have ever owned! The tailoring is exceptional.',
                timestamp: new Date('2025-02-25')
            },
            {
                user: users[4]._id,
                order: orders[2]._id,
                rating: 4,
                fabricRating: 5,
                fitRating: 4,
                stitchingRating: 4,
                comment: 'Very comfortable fabric. The tuxedo looks elegant for formal events.',
                timestamp: new Date('2025-04-15')
            }
        ]);
        console.log(`✓ Seeded ${reviews.length} reviews`);

        // 6. Seed Cart Items
        const cartItems = await CartItem.insertMany([
            {
                user: users[1]._id,
                product: fabrics[0]._id,
                productType: 'Fabric',
                fabricLength: 2.5,
                timestamp: new Date('2025-04-18')
            },
            {
                user: users[2]._id,
                product: suits[1]._id,
                productType: 'Suit',
                fabricLength: 2.0,
                timestamp: new Date('2025-04-19')
            },
            {
                user: users[3]._id,
                product: fabrics[6]._id,
                productType: 'Fabric',
                fabricLength: 3.0,
                timestamp: new Date('2025-04-20')
            },
            {
                user: users[4]._id,
                product: suits[4]._id,
                productType: 'Suit',
                fabricLength: 2.2,
                timestamp: new Date('2025-04-21')
            }
        ]);
        console.log(`✓ Seeded ${cartItems.length} cart items`);

        // 7. Seed Appointments
        const appointments = await Appointment.insertMany([
            {
                user: users[1]._id,
                type: 'physical',
                date: new Date('2025-04-25'),
                timeSlot: '10:00 AM',
                notes: 'First consultation for custom suit',
                status: 'confirmed',
                timestamp: new Date('2025-04-20')
            },
            {
                user: users[2]._id,
                type: 'virtual',
                date: new Date('2025-04-26'),
                timeSlot: '2:00 PM',
                notes: 'Fabric selection consultation',
                status: 'pending',
                timestamp: new Date('2025-04-21')
            },
            {
                user: users[3]._id,
                type: 'physical',
                date: new Date('2025-04-27'),
                timeSlot: '11:00 AM',
                notes: 'Fitting appointment',
                status: 'confirmed',
                timestamp: new Date('2025-04-22')
            },
            {
                user: users[4]._id,
                type: 'virtual',
                date: new Date('2025-04-28'),
                timeSlot: '3:00 PM',
                notes: 'Follow-up consultation',
                status: 'pending',
                timestamp: new Date('2025-04-23')
            }
        ]);
        console.log(`✓ Seeded ${appointments.length} appointments`);

        // 8. Seed Conversations & Messages
        const conversations = await Conversation.insertMany([
            { user: users[1]._id },
            { user: users[2]._id },
            { user: users[3]._id }
        ]);
        console.log(`✓ Seeded ${conversations.length} conversations`);

        const messages = await Message.insertMany([
            {
                conversation: conversations[0]._id,
                fromUser: false,
                message: 'Hello! Welcome to AI Tailor. How can I help you today?',
                timestamp: new Date('2025-04-20T10:00:00')
            },
            {
                conversation: conversations[0]._id,
                fromUser: true,
                message: 'Hi, I want to order a custom suit. What is the process?',
                timestamp: new Date('2025-04-20T10:05:00')
            },
            {
                conversation: conversations[0]._id,
                fromUser: false,
                message: 'Great! You can browse our fabrics and design your suit. Would you like to schedule an appointment?',
                timestamp: new Date('2025-04-20T10:10:00')
            },
            {
                conversation: conversations[1]._id,
                fromUser: false,
                message: 'Hi! Do you have any questions about our services?',
                timestamp: new Date('2025-04-21T14:00:00')
            },
            {
                conversation: conversations[1]._id,
                fromUser: true,
                message: 'Yes, what is the delivery time for custom suits?',
                timestamp: new Date('2025-04-21T14:05:00')
            },
            {
                conversation: conversations[1]._id,
                fromUser: false,
                message: 'Typically it takes 2-3 weeks for custom suits after final fitting.',
                timestamp: new Date('2025-04-21T14:10:00')
            },
            {
                conversation: conversations[2]._id,
                fromUser: true,
                message: 'I need help with my order #123456',
                timestamp: new Date('2025-04-22T09:00:00')
            },
            {
                conversation: conversations[2]._id,
                fromUser: false,
                message: 'Of course! I can help with that. Could you provide your order number?',
                timestamp: new Date('2025-04-22T09:05:00')
            }
        ]);
        console.log(`✓ Seeded ${messages.length} messages`);

        // 9. Seed Wishlists
        const wishlists = await Wishlist.insertMany([
            { user: users[1]._id, productType: 'Fabric', product: fabrics[2]._id },
            { user: users[1]._id, productType: 'Suit', product: suits[1]._id },
            { user: users[2]._id, productType: 'Fabric', product: fabrics[5]._id },
            { user: users[3]._id, productType: 'Suit', product: suits[2]._id },
            { user: users[4]._id, productType: 'Fabric', product: fabrics[8]._id }
        ]);
        console.log(`✓ Seeded ${wishlists.length} wishlist items`);

        // 10. Seed Notifications
        const notifications = await Notification.insertMany([
            {
                user: users[1]._id,
                title: 'Order Delivered',
                message: 'Your order #12345 has been delivered successfully!',
                type: 'order',
                read: false,
                link: '/orders',
                timestamp: new Date('2025-04-20')
            },
            {
                user: users[2]._id,
                title: 'New Promo',
                message: 'Get 20% off on all Italian wool fabrics this week!',
                type: 'promo',
                read: false,
                link: '/fabrics',
                timestamp: new Date('2025-04-21')
            },
            {
                user: users[1]._id,
                title: 'Appointment Reminder',
                message: 'You have an appointment scheduled for tomorrow at 10:00 AM',
                type: 'system',
                read: true,
                link: '/appointments',
                timestamp: new Date('2025-04-24')
            },
            {
                user: users[3]._id,
                title: 'Gift Received',
                message: 'You received a gift from a friend! Check your orders.',
                type: 'gift',
                read: false,
                link: '/orders',
                timestamp: new Date('2025-04-22')
            },
            {
                user: users[4]._id,
                title: 'Review Request',
                message: 'Thank you for your purchase! Share your experience with us.',
                type: 'system',
                read: false,
                link: '/reviews',
                timestamp: new Date('2025-04-23')
            }
        ]);
        console.log(`✓ Seeded ${notifications.length} notifications`);

        console.log('\n========================================');
        console.log('✅ Database seeded successfully!');
        console.log('========================================');
        console.log('\nTest Accounts:');
        console.log('  Admin: admin@aitailor.com / password123');
        console.log('  User: john@example.com / password123');
        console.log('  User: jane@example.com / password123');
        console.log('  User: mike@example.com / password123');
        console.log('  User: sarah@example.com / password123');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the seed
connectDB().then(seedData);