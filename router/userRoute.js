const express = require("express")
const user_route = express()
const userController = require("../controller/userController")
const productController = require("../controller/productController")
const bodyParser = require("body-parser")
const validate = require('../middleware/authMiddleware')
const couponController = require('../controller/couponController')
const cartController = require("../controller/cartController")
const orderController = require('../controller/orderController')
const profileController = require("../controller/profileController")

const cookieparser = require('cookie-parser')
const nocache = require('nocache')
user_route.use(nocache())
const session = require('express-session');

user_route.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))
user_route.use(cookieparser())

user_route.set("view engine","ejs")
user_route.set("views","./views/user")

user_route.all('*',validate.checkUser)
user_route.get('/',userController.homeLoad)

// userRegistration

user_route.get('/registration',userController.loadRegister)
user_route.post('/registration',userController.insertUser)
user_route.post('/check-email',userController.checkEmail)
user_route.post('/verifyotp',userController.signupVerify )

// userLogin

user_route.get('/login',userController.loginUser)
user_route.post('/generateOTP',userController.sendOTP)
user_route.post('/verifyOTP',userController.verifyOTP)
user_route.post('/verifyUser',userController.verifyUser)

user_route.get('/logout',userController.logout)


//Resend OTP
user_route.get('/resendOtp',userController.reSendotp)

// forgotPassword

user_route.get('/forgotPassword',userController.loadForgotPassword)
user_route.post('/sendOtp',userController.passwordOTP)
user_route.post('/verifyOtpEndpoint',userController.forgotVerifyOTP)
user_route.get('/resetPassword',userController.loadresetPassword)




user_route.post('/setNewPassword',userController.setNewPassword)

// displayProduct

user_route.get('/shop',userController.displayProduct)
user_route.get('/productPage',productController.productPage)
user_route.get('/categoryShop',productController.categoryPage)

//profileManagement
user_route.get('/dashboard',profileController.loadDashboard)

user_route.get('/profileDetails',profileController.profile)
user_route.post('/submitAddress',profileController.submitAddress)
user_route.post('/updateAddress',profileController.editAddress)

user_route.post('/editInfo',userController.editInfo)

user_route.post('/editPassword',userController.editPassword)
user_route.get('/profileAddress',profileController.profileAdress)
user_route.get('/deleteAddress',profileController.deleteAddress)

user_route.get('/profileOrderList',orderController.orderList)
user_route.get('/orderDetails',orderController.orderDetails)
user_route.get('/wallet',profileController.walletTransaction)

// cartManagement

user_route.get('/cart',cartController.loadCart)
user_route.post('/addToCart/:id',cartController.addToCart)
  
user_route.put('/change-product-quantity',cartController.updateQuantity)
user_route.delete("/delete-product-cart",cartController.deleteProduct);

// checkOut

user_route.get('/checkout',orderController.checkOut)
user_route.post('/checkOutAddress',orderController.checkOutAddress)
user_route.post('/checkOut',orderController.postCheckOut)

user_route.post('/changeDefaultAddress',orderController.changePrimary)

user_route.put('/cancelOrder',orderController.cancelOrder)   

user_route.get('/applyCoupon/:id',orderController.applyCoupon)
user_route.get('/couponVerify/:id',orderController.verifyCoupon)

user_route.post('/verifyPayment',orderController.verifyPayment)
user_route.post('/paymentFailed',orderController.paymentFailed)  




module.exports = user_route

