const Coupon = require("../models/couponModel")
const couponHelper = require("../helpers/couponHelper")

const loadCouponAdd = (req,res)=>{
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log(error.message);
    }
}

const generateCoupon = (req,res)=>{
  couponHelper.generatorCouponCode().then((couponCode) => { 
      res.send(couponCode);
      console.log("generatecode" +couponCode);
    });
}


  const addCoupon =  (req, res) => {
    try {
        const data = {
            couponCode: req.body.coupon,
            validity: req.body.validity,
            minPurchase: req.body.minPurchase,
            minDiscountValue: req.body.minDiscountPercentage,
            maxDiscountValue: req.body.maxDiscount,
            description: req.body.description,
          };
          couponHelper.addCoupon(data).then((response) => {
            res.json(response);
          });
        
    } catch (error) {
        console.log(error.message);
        
        
    }
   
  }

  const couponList = async(req,res)=>{
    try {
        const couponList = await Coupon.find()
        res.render('couponList',{couponList})
    } catch (error) {
        console.log(error.message);
    }
  }

  const removeCoupon = async(req,res)=>{
    try {
        const id = req.body.couponId
        await Coupon.deleteOne({_id:id})
        res.json({status:true})
        
    } catch (error) {
        
    }
  }



  module.exports ={
    loadCouponAdd,
    generateCoupon,
    addCoupon,
    couponList,
    removeCoupon
  }