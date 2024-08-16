const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    fName:{
        type:String,
        required:true
    },
    lName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    is_Verified:{
        type:Boolean,
        default:false
        
    },
    is_Blocked:{
        type:Boolean,
        default:false
        
    },
    wallet:{
        type:Number,
        default:0
    },
    walletTransaction:{
        type:Array
    },
    coupon:{
        type:Array
    }
})

module.exports = mongoose.model('User',userSchema)