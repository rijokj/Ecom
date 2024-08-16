const express = require("express")
const admin_route = express()
const adminController = require("../controller/adminController")
const categoryController = require("../controller/categoryController")
const couponController = require("../controller/couponController")
const productController = require("../controller/productController")
const validate = require("../middleware/adminAuth")
const bodyParser = require("body-parser")
const multer = require("../multer/multer")


const session = require('express-session');
const cookieparser = require('cookie-parser')
const nocache = require('nocache')

admin_route.use(nocache())
admin_route.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

  admin_route.use(cookieparser())


  admin_route.get('*',validate.checkUser)

admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))

admin_route.set("view engine","ejs")
admin_route.set("views","./views/admin")

// adminLogin

admin_route.get('/',adminController.loginAdmin)
admin_route.post('/',adminController.verifyLogin)

admin_route.get('/home',validate.requireAuth,adminController.loadDashboard)
admin_route.get('/users',adminController.loadUsers)

// userManagement

admin_route.get('/deleteUsers',validate.requireAuth,adminController.deleteUser)
admin_route.post('/blockUsers',validate.requireAuth,adminController.blockUser)
admin_route.post('/unBlockUsers',validate.requireAuth,adminController.unBlockUser)

// categoryManagement

admin_route.get('/category',validate.requireAuth,categoryController.loadCategory)
admin_route.get('/addCategory',validate.requireAuth,categoryController.loadAddCategory)
admin_route.post('/addCategory',validate.requireAuth,categoryController.createCategory)

admin_route.get('/unListCategory',validate.requireAuth,categoryController.unListCategory)
admin_route.get('/reListCategory',validate.requireAuth,categoryController.reListCategory)
admin_route.get('/editCategory',validate.requireAuth,categoryController.loadUpdateCategory)
admin_route.post('/editCategory',validate.requireAuth,categoryController.updateCategory)


// productManagement

admin_route.get('/product',validate.requireAuth,productController.loadProducts)
admin_route.post('/addProduct',multer.upload,productController.createProduct)
admin_route.get('/displayProduct',validate.requireAuth,productController.displayProduct)
admin_route.get('/unListProduct',productController.unListProduct)
admin_route.get('/reListProduct',productController.reListProduct)
admin_route.get('/updateProduct',validate.requireAuth,productController.loadUpdateProduct)
admin_route.post('/updateProduct',multer.update,productController.updateProduct)

//order
admin_route.get('/orderList',validate.requireAuth,adminController.orderList)
admin_route.get('/orderDetails',validate.requireAuth,adminController.orderDetails)
admin_route.put('/cancelOrder',adminController.cancelOrder)
admin_route.put('/returnOrder',adminController.returnOrder)
admin_route.put('/orderStatus',adminController.changeStatus)  


admin_route.get('/addCoupon',validate.requireAuth,couponController.loadCouponAdd)
admin_route.post('/addCoupon',couponController.addCoupon)
admin_route.get('/generate-coupon-code',validate.requireAuth,couponController.generateCoupon)
admin_route.get('/couponList',validate.requireAuth,couponController.couponList)

admin_route.delete('/removeCoupon',couponController.removeCoupon)


admin_route.get('/salesReport',validate.requireAuth,adminController.getSalesReport)
admin_route.post('/salesReport',validate.requireAuth,adminController.postSalesReport)



admin_route.get('/logout',validate.requireAuth,adminController.logout)

module.exports = admin_route
