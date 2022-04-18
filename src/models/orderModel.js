const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema ({
    userId: {
        type: mongoose.Types.ObjectId,
        required: 'userId is required',
        refs: "User",
        unique: true
    },

    items: [{
        productId: {
            type: mongoose.Types.ObjectId,
            required: 'productId is required',
            refs: "Product"
        },
        quantity: {
            type: Number,
            required: "Enter quantity required",
            min: 1
        }
    }],
    totalPrice: {
        type: Number,
        required: 'totalPrice is required',
        Comment: 'Holds total price of all the items in the cart'
    },
    totalItems: {
        type: Number,
        required: 'totalItems are required',
        Comment: 'Holds total number of items in the cart'
    },
    totalQuantity: {
        type: Number,
        required: 'totalQuantity are required',
        Comment: 'Holds total number of items in the cart'
    },
    cancellable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'pending',

    }
}, { timestamps: true })


module.exports = mongoose.model('Order', orderSchema, 'order')