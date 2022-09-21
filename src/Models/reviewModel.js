const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId
const reviewSchema = new mongoose.Schema({
    bookId: {
        type: ObjectId,
        ref: "Book",
        require: true
    },
    reviewedBy: {
        type: String,
        require: true,
        default: 'Guest'
    },
    reviewedAt: {
        type: Date,
        require: true,
        default: Date.now
    },
    rating: {
        type: Number,
        minimum: 1,
        maximum: 5,
        require: true
    },
    review: { type: String },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

module.exports = mongoose.model('Review', reviewSchema)