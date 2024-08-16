const Address = require('../models/addressModel')
const Cart = require('../models/cartModel')
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types; 
const orderHelper = require('../helpers/orderHelper')
const couponHelper = require("../helpers/couponHelper")
const Order = require('../models/orderModel');
const fs = require("fs");
const { Readable } = require('stream');
const profileHelper = require('../helpers/profileHelper')




const checkOut = async (req,res)=>{
    try {
        const user = res.locals.user
        const total = await Cart.findOne({ user: user.id });
        const address = await Address.findOne({user:user._id}).lean().exec()
        
        const cart = await Cart.aggregate([
            {
              $match: { user: user.id }
            },
            {
              $unwind: "$cartItems"
            },
            {
              $lookup: {
                from: "products",
                localField: "cartItems.productId",
                foreignField: "_id",
                as: "carted"
              }
            },
            {
              $project: {
                item: "$cartItems.productId",
                quantity: "$cartItems.quantity",
                total: "$cartItems.total",
                carted: { $arrayElemAt: ["$carted", 0] }
              }
            }
          ]);
      if(address){
        res.render('checkOut',{address:address.addresses,cart,total}) 
      }else{
        res.render('checkOut',{address:[],cart,total})
      }
    } catch (error) {
        console.log(error.message)
        
    }
}


const changePrimary = async (req, res) => {
  try {
    const userId = res.locals.user._id
    const addressIndex =req.body.addressRadio;
    const user = await Address.find({ user: userId.toString() });
    if (addressIndex === -1) {
      throw new Error("Address not found");
    }

    const removedAddress = user[0].addresses.splice(addressIndex, 1)[0];
    user[0].addresses.unshift(removedAddress);

    const final = await Address.updateOne(
      { user: userId },
      { $set: { addresses: user[0].addresses } }
    );

    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};


const checkOutAddress = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    const name = req.body.name;
    const mobileNumber = req.body.mno;
    const address = req.body.address;
    const locality = req.body.locality;
    const city = req.body.city;
    const pincode = req.body.pincode;
    const state = req.body.state;

    const newAddress = {
      name: name,
      mobileNumber: mobileNumber,
      address: address,
      locality: locality,
      city: city,
      pincode: pincode,
      state: state,
    };

    const updatedUser = await profileHelper.updateAddress(userId, newAddress);
    if (!updatedUser) {
      await profileHelper.createAddress(userId, newAddress);
    }


    res.redirect("/checkOut"); 
  } catch (error) {
    console.log(error.message);
  }
};



const postCheckOut  = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    const data = req.body;
    const couponCode = data.couponCode
    await couponHelper.addCouponToUser(couponCode, userId);
    try { 
      const checkStock = await orderHelper.checkStock(userId)
      if(checkStock){
      if (data.paymentOption === "cod") { 
        const updatedStock = await orderHelper.updateStock(userId)
        const response = await orderHelper.placeOrder(data,userId);
        await Cart.deleteOne({ user:userId  })
        res.json({ codStatus: true });
      } 
      else if (data.paymentOption === "wallet") {
        const updatedStock = await orderHelper.updateStock(userId)
        const response = await orderHelper.placeOrder(data,userId);
        res.json({ orderStatus: true, message: "order placed successfully" });
        await Cart.deleteOne({ user:userId  })
      }else if (data.paymentOption === "razorpay") {
        const response = await orderHelper.placeOrder(data,userId);
        const order = await orderHelper.generateRazorpay(userId,data.total);
        res.json(order);
       
    }else{
      await Cart.deleteOne({ user:userId  })
      res.json({ status: 'OrderFailed' });
    }

    } 
  }catch (error) {
      console.log({ error: error.message });
     
    } 
  } catch (error) {
    console.error(error);
    res.json({ status: false, error: error.message });
    
  }
}

const orderList  = async(req,res)=>{
  try {
    const user  = res.locals.user
    // const order = await Order.findOne({user:user._id})
    const orders = await Order.aggregate([
      {$match:{user:user._id}},
      { $unwind: "$orders" },
      { $sort: { "orders.createdAt": -1 } },
    ])
    res.render('profileOrder',{orders})

    
   
  } catch (error) {
    console.log(error.message);
    
  }


}

const orderDetails = async (req,res)=>{
  try {
    const user = res.locals.user
    const id = req.query.id
    orderHelper.findOrder(id, user._id).then((orders) => {
      const address = orders[0].shippingAddress
      const products = orders[0].productDetails 
      res.render('orderDetails',{orders,address,products})
    });      
  } catch (error) {
    console.log(error.message);
  }

}

const cancelOrder = async(req,res)=>{

  const orderId = req.body.orderId
  const status = req.body.status
  orderHelper.cancelOrder(orderId, status).then((response) => {
    res.send(response);
  });


}
const verifyPayment =  (req, res) => {
  const orderId = req.body.order.receipt

  orderHelper.verifyPayment(req.body).then(() => {
    orderHelper
      .changePaymentStatus(res.locals.user._id, req.body.order.receipt,req.body.payment.razorpay_payment_id)
      .then(() => {
        res.json({ status: true });
      })
      .catch((err) => {
        res.json({ status: false });
      });
  }).catch(async(err)=>{
    
    console.log(err);

  });
}


const paymentFailed = async(req,res)=>{
  try {
    const order = req.body
    const deleted = await Order.updateOne(
      { "orders._id": new ObjectId(order.order.receipt) },
      { $pull: { orders: { _id:new ObjectId(order.order.receipt) } } }

    )
    res.send({status:true})
  } catch (error) {
    
  }
  
}

const verifyCoupon = (req, res) => {
  const couponCode = req.params.id
  const userId = res.locals.user._id
  couponHelper.verifyCoupon(userId, couponCode).then((response) => {
      res.send(response)
  })
}

const applyCoupon =  async (req, res) => {
  const couponCode = req.params.id 
  const userId = res.locals.user._id
  const total = await orderHelper.totalCheckOutAmount(userId) 
  couponHelper.applyCoupon(couponCode, total).then((response) => {
      res.send(response)
  }) 
}


module.exports = {
    checkOut,
    changePrimary,
    postCheckOut,
    orderList,
    orderDetails,
    cancelOrder,
    checkOutAddress,
    verifyPayment,
    paymentFailed,
    verifyCoupon,
    applyCoupon
}