const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const adminHelper = require('../helpers/adminHelper');
const jwt = require('jsonwebtoken');
const orderHelper = require('../helpers/orderHelper')



const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'my-secret', {
    expiresIn: maxAge
  });
};

const loginAdmin = async(req,res)=>{
    try {
        if(res.locals.admin!=null){
            res.redirect('/admin/home')}
            else{
                
        res.render('login')
            }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        const adminData= await Admin.findOne({email:email})

        if(adminData.password === password){
            if(adminData){
                const token = createToken(adminData._id);
                res.cookie('jwtAdmin', token, { httpOnly: true, maxAge: maxAge * 1000 });
                    res.redirect("/admin/home")
                }else{
                    res.render('login',{message:"Email and Password are Incorrect"});
                }
            }else{
                res.render('login',{message:"Email and Password are Incorrect"})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req,res)=>{
    try {
        res.render('home')
    } catch (error) {
        console.log(error.message);
    }
}

const loadUsers = async(req,res)=>{
  try {
const page = parseInt(req.query.page) || 1; 
const pageSize = parseInt(req.query.pageSize) || 5; 
const skip = (page - 1) * pageSize;
const totalCount = await User.countDocuments({});
const totalPages = Math.ceil(totalCount / pageSize);




    var search = ''
    if(req.query.search){
        search = req.query.search
    }
    const usersData = await User.find({
        $or:[
            {fname:{$regex:'.*'+search+'.*'}},
            {lname:{$regex:'.*'+search+'.*'}},
            {email:{$regex:'.*'+search+'.*'}},
            {mobile:{$regex:'.*'+search+'.*'}},
        ]
    }).skip(skip)
    .limit(pageSize)
   
    res.render('userList',{user:usersData,page,
        pageSize,
        totalPages})
} catch (error) {
    console.log(error.message);
}
}

    const logout = (req,res) =>{
        res.cookie('jwtAdmin', '' ,{maxAge : 1})
        res.redirect('/admin')
      }

    const deleteUser = async(req,res)=>{
        try {
            const id = req.query.id;
            await User.deleteOne({_id:id})
            res.redirect('/admin/users')
            
        } catch (error) {
            console.log(error.message);
        }
      }
      
      const blockUser = async(req,res)=>{
        try {
          const id = req.body.userId
          await User.findByIdAndUpdate({_id:id},{$set:{is_Blocked:true}})
          res.send({status:true})
        } catch (error) {
          console.log(error.message)
        }
      }
      
      
      const unBlockUser = async(req,res)=>{
        try {
          const id = req.body.userId
          await User.findByIdAndUpdate({_id:id},{$set:{is_Blocked:false}})
          res.send({status:true})
        } catch (error) {
          console.log(error.message)
        }
      }

      const orderList = (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
      
        orderHelper
          .getOrderList(page, limit)
          .then(({ orders, totalPages, page: currentPage, limit: itemsPerPage }) => {
            res.render("orderList", {
              orders,
              totalPages,
              page: currentPage,
              limit: itemsPerPage,
            });
          })
          .catch((error) => {
            console.log(error.message);
          });
      };

      const orderDetails = async (req,res)=>{
        try {
          const id = req.query.id
          adminHelper.findOrder(id).then((orders) => {
            const address = orders[0].shippingAddress
            const products = orders[0].productDetails 
            res.render('orderDetails',{orders,address,products}) 
          });
            
        } catch (error) {
          console.log(error.message);
        }
      
      }

      const cancelOrder = async(req,res)=>{
        const userId = req.body.userId
      
        const orderId = req.body.orderId
        const status = req.body.status
      
        adminHelper.cancelOrder(orderId,userId,status).then((response) => {
          res.send(response);
        });
      
      }

      const returnOrder = async(req,res)=>{
        const orderId = req.body.orderId
        const status = req.body.status
        const userId = req.body.userId
      
      
        adminHelper.returnOrder(orderId,userId,status).then((response) => {
          res.send(response);
        });
      
      } 


      const changeStatus = async(req,res)=>{
        const orderId = req.body.orderId
        const status = req.body.status
        adminHelper.changeOrderStatus(orderId, status).then((response) => {
          res.json(response);
        });
      
      }


      const getSalesReport =  async (req, res) => {
        const report = await adminHelper.getSalesReport();
        let details = [];
        const getDate = (date) => {
          const orderDate = new Date(date);
          const day = orderDate.getDate();
          const month = orderDate.getMonth() + 1;
          const year = orderDate.getFullYear();
          return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
            isNaN(year) ? "0000" : year
          }`;
        };
      
        report.forEach((orders) => {
          details.push(orders.orders);
        });
      
        res.render('salesReport',{details,getDate})
      
        
      }

      const postSalesReport =  (req, res) => {
        let details = [];
        const getDate = (date) => {
          const orderDate = new Date(date);
          const day = orderDate.getDate();
          const month = orderDate.getMonth() + 1;
          const year = orderDate.getFullYear();
          return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
            isNaN(year) ? "0000" : year
          }`;
        };
      
        adminHelper.postReport(req.body).then((orderData) => {
          orderData.forEach((orders) => {
            details.push(orders.orders);
          });
          res.render("salesReport", {details,getDate});
        });
      }
     
module.exports={
    loginAdmin,
    verifyLogin,
    loadDashboard,
    logout,
    loadUsers,
    deleteUser,
    blockUser,
    unBlockUser,
    orderList,
    orderDetails,
    cancelOrder,
    getSalesReport,
    postSalesReport,
    changeStatus,
    returnOrder
}