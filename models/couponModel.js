const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponCode : {
        type : String,
    },
    validity:{
        type: Date,
        default: new Date(),
    },
    minPurchase: { type: Number,
                  default:0 },
    minDiscountValue: { type : Number ,
                        default:0},
    maxDiscountValue: { type : Number ,
                        default:0 },
    description: { type : String },
    createdAt: {
        type:Date,
        default : new Date(),
    }
})

module.exports = mongoose.model('Coupon',couponSchema)