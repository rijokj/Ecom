const User = require("../models/userModel")
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const bcrypt = require("bcrypt")

const jwt = require('jsonwebtoken')
require('dotenv').config()

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET_KEY,{
        expiresIn:maxAge
    })
}


const securePassword = async(password)=>{
    try {
       const hashPassword = await bcrypt.hash(password,10)
        return hashPassword
    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async(req,res)=>{
    try {
        if(res.locals.user !=null){
            res.redirect('/')
        }else{
            res.render("signup")
        }
        
    } catch (error) {
        console.log(error);
    }
}

const insertUser = async(req,res)=>{
    try {
        const spassword = await securePassword(req.body.password)
        const user = new User({
            fName:req.body.fName,
            lName:req.body.lName,
            email:req.body.email, 
            password:spassword,
            mobile:req.body.mobile,
            is_admiin:0
        })

        const userData = await user.save()

        if(userData){
           
            res.render("index")
        }
        
    } catch (error) {
        console.log(error);    }
}

const loginUser = async (req,res)=>{
    try {
        if(res.locals.user!=null){
            res.redirect('/')
        }else{
            res.render('login')
        }
        
        
    } catch (error) {
        console.log(error);
    }
}

const sendOTP = async (req, res) => {
    try {
      const email = req.body.email;
  
      // Generate OTP
      const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
  
      // Send OTP via email
      await sendOTPByEmail(email, otp);
  
      res.render('otpLogin', { email: email, message: 'OTP sent successfully.' });
    } catch (error) {
      console.error(error);
      res.render('otpLogin', { email: email, message: 'Failed to send OTP.' });
    }
  };
  
  // Function to send OTP via email
  const sendOTPByEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
      service: 'your_email_service', // e.g., 'gmail'
      auth: {
        user: 'your_email@example.com',
        pass: 'your_email_password',
      },
    });
  
    const mailOptions = {
      from: 'your_email@example.com',
      to: email,
      subject: 'OTP for Verification',
      text: `Your OTP for verification is: ${otp}`,
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
      return true;
    } catch (error) {
      console.error('Error sending email: ' + error.message);
      throw error;
    }
  };

const verifyUser = async(req,res)=>{
    try {
           const email = req.body.email
           const password = req.body.password
           
       const userData= await User.findOne({email:email})

       if(userData){
        const passwordMatch = await bcrypt.compare(password,userData.password)
       
         if(passwordMatch){
             const token = createToken(userData._id)
            res.cookie('jwt',token,{ httpOnly:true, maxAge: maxAge*1000})
            res.render('/',{email:email})
        }else{
            res.render('login',{message:"Email or Password is incorrect"})
        }
       }else{
        res.render('login',{message:"Email or Password is incorrect"})

       }
        
    } catch (error) {
        console.log(error);
    }
}

const homeLoad = async(req,res)=>{
    try {
        res.render('index')
    } catch (error) {
        console.log(error.message);
    }
}

const logout = (req,res) =>{
    try { 
    res.cookie('jwt', '' ,{maxAge : 1})
    res.redirect('/')
      
    } catch (error) {
      console.log(error.message);
    }

}

const displayProduct= async(req,res)=>{
    try {
        const category = await Category.find({})
        
        const searchQuery = req.query.search || ''
        const sortQuery = req.query.sort || 'default'
        const minPrice = parseFloat(req.query.minPrice)
        const maxPrice = parseFloat(req.query.maxPrice)


        // search filter functionality

        const searchFilter = {
            $and:[
                {isListed:true},
                {isProductListed:true},
                {
                    $or:[
                        {name:{$regex: new RegExp(searchQuery,'i')}},
                    ],
                },

            ]
        }

        if(!isNaN(minPrice)&&!isNaN(maxPrice)){
            searchFilter.$and.push({price:{$gte:minPrice,$lte:maxPrice}})
        }

        let sortOption ={}
        if(sortQuery === 'price_asc' ||sortQuery === 'default'){
            sortOption = {price:1}
        }else{
            sortOption = {price:-1}
        }
        const products = await Product.find(searchFilter)
            .sort(sortOption)
            
        res.render('shopBrand',{category,product:products})
        
    } catch (error) {
        console.log(error.message);
    }
}

const editInfo = async (req, res) => {
    try {
      const userId = res.locals.user._id;
      const { fname, lname, email, mobile } = req.body;
  
      const result = await User.updateOne(
        { _id: userId }, // Specify the user document to update based on the user ID
        { $set: { fname, lname, email, mobile } } // Set the new field values
      );
  
      res.redirect("/profile");
    } catch (error) {
      console.log(error.message);

    }
  };


module.exports={
    loadRegister,
    insertUser,
    loginUser,
    verifyUser,
    homeLoad,
    logout,
    displayProduct,
    editInfo
}



function checkEmailAvailability() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email_error');
    const email = emailInput.value.trim();

    // Check if the email is not empty
    if (email === '') {
      emailError.textContent = 'Email is required';
      return;
    }

    // Make an AJAX request to check email availability
    $.ajax({
      url: '/check-email',  // Update the URL to your server endpoint
      type: 'POST',
      data: { email: email },
      success: function (data) {
        if (data.exists) {
          emailError.textContent = 'Email already registered';
          return false
        } else {
          emailError.textContent = '';
          return true
        }
      },
      error: function (error) {
        console.error('Error checking email availability:', error);
      }
    });

}