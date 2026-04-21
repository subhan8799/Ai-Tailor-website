const mongoose = require('mongoose')

const AppointmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['physical', 'virtual'], default: 'virtual' },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    timestamp: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Appointment', AppointmentSchema)
