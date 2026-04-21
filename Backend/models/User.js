// Database Schema
const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Conversation = require('./Conversation')
const Suit = require('./Suit')
const Message = require('./Message')
const GenderTypes = require('../constants/GenderTypes')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    gender: {
        type: String,
        enum: [GenderTypes.MALE, GenderTypes.FEMALE, GenderTypes.OTHERS]
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    address: String,
    phone: String,
    image: String,
    dob: Date,
    googleId: String,
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpiry: {
        type: Date,
        default: null
    },
})

// Manually Cascade deleting necessary documents
UserSchema.pre('deleteOne', async function(next) {
    try {
        convo = await Conversation.find({ user: this._conditions._id })
        await Message.deleteMany({ conversation: convo })
        await Conversation.deleteOne({ user: this._conditions._id });
        await Suit.deleteMany({ user: this._conditions._id })
        next();
    } catch (error) {
        next(error);
    }
});

// Executes before saving
UserSchema.pre('save', async function () {
    if(!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

UserSchema.methods.createJWT = function () {
    return jwt.sign(
      { userID: this._id, username: this.username },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );
};
  
UserSchema.methods.comparePassword = async function (givenPassword) {
    const isMatch = await bcrypt.compare(givenPassword, this.password);
    return isMatch;
};

UserSchema.methods.generatePasswordResetToken = function () {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpiry = Date.now() + 30 * 60 * 1000; // Token valid for 30 minutes
    return resetToken;
};

UserSchema.methods.verifyPasswordResetToken = function (token) {
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return this.passwordResetToken === hashedToken && this.passwordResetExpiry > Date.now();
};

UserSchema.plugin(findOrCreate)

module.exports = mongoose.model('User', UserSchema)