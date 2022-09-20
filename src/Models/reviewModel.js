const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId
const reviewSchema = new mongoose.schema({
    bookId: {
        type: ObjectId,
        ref: "Book",
        require: true
    },
    reviewedBy: {
        type: String,
        require: true,
        default: 'Guest', value: String
    },
    reviewedAt: {
        type: Date,
        require: true,
        default: Date.now
    },
    rating: {
        type: Number,
        require: true
    },
    review: { type: String },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

module.exports = mongoose.model('Review', reviewSchema)