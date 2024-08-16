const User = require("../models/userModel")
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const bcrypt = require("bcrypt")
const otpGenerator = require("generate-otp")
const transporter = require("../config/otp")
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

        req.session.userData = req.body;
        const email = req.body.email
        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
        req.session.otp = otp;
        req.session.email = email
        await sendOTPByEmail(email, otp);
        res.render("verifyotp")

        // const spassword = await securePassword(req.body.password)
        // const user = new User({
        //     fName:req.body.fname,
        //     lName:req.body.lname,
        //     email:req.body.email, 
        //     password:spassword,
        //     mobile:req.body.mno,
        //     is_admiin:0
        // })

        // const userData = await user.save()

        // if(userData){
        //     const token = createToken(userData._id);
        //     res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        // }
        
    } catch (error) {
        console.log(error);    }
}

const checkEmail = async(req,res)=>{
    const Email = req.body.email
    const userData = await User.find({email:Email})
    try {
        if(userData.length >0){
            res.json({ exists: true });
        }else{
            res.json({ exists: false });
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
}

const signupVerify = async (req,res)=>{
    try {
        const userData = req.session.userData;
        const enteredOTP = req.body.otp;
        const storedOTP = req.session.otp;
        if (enteredOTP === storedOTP) {
            const verified = true
    if(verified){
    const spassword =await securePassword(userData.password)
        const user = new User({
            fName:userData.fname,
            lName:userData.lname,
            email:userData.email,
            mobile:userData.mno,
            password:spassword,
            is_admin:0,
            is_Verified:1

        })
        const userDataSave = await user.save()
        if(userDataSave){
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.redirect('/')
        }else{
            res.render('register',{message:"Registration Failed"})
        }
      }else{
        res.render('verifyOtp',{ message: 'Wrong Otp' });

      }
            
        }
    }catch (error) {
                console.log(error.message);
                res.redirect('/error-500')
             
            }
        }

        const reSendotp = async (req,res)=>{
            try {
                delete req.session.otp
                const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
                req.session.otp = otp;
                email = req.session.email
                await sendOTPByEmail(email, otp);
                res.render("verifyotp",{ message: 'OTP resent successfully' })
                
            } catch (error) {
                console.log(error.message);
                res.render('verifyOtp',{ message: 'Failed to send otp' })
            }
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
        
         // Store OTP in session
      req.session.otp = otp;

      // Send OTP via email
      await sendOTPByEmail(email, otp);
  
      res.render('login', { email: email, message: 'OTP sent successfully.' });
    } catch (error) {
      console.error(error);
      res.render('login', { email: email, message: 'Failed to send OTP.' });
    }
  };
  
  // Function to send OTP via email
  const sendOTPByEmail = async (email, otp) => {
    
    const mailOptions = {
      from:process.env.GMAIL_USER ,
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

  const verifyOTP = async (req, res) => {
    try {
        const email = req.body.email;
        const enteredOTP = req.body.otp;
        const storedOTP = req.session.otp;
        const userData = await User.findOne({ email: email });
        if (enteredOTP === storedOTP) {
            const token = createToken(userData._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.json({ success: true, message: 'OTP verification successful.' });
        } else {
            // Incorrect OTP
            res.json({ success: false, message: 'Incorrect OTP' });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Error during OTP verification.' });
    }
};

  const verifyUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                if (userData.is_Blocked) {
                    res.json({ success: false, message: 'User is Blocked' });
                  }else{
                const token = createToken(userData._id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

                // Instead of rendering a new page, send a JSON response
                res.json({ success: true, message: 'Login successful.', email: email });
            }
         } else {
                // Send a JSON response for unsuccessful login
                res.json({ success: false, message: 'Email or Password is incorrect' });
            }
        } else {
            // Send a JSON response for unsuccessful login
            res.json({ success: false, message: 'Email or Password is incorrect' });
        }

    } catch (error) {
        console.error(error);
        // Send a JSON response for any error during login
        res.json({ success: false, message: 'Error during login verification.' });
    }
};


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
    res.redirect('/login')
      
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

  const loadForgotPassword = async(req,res)=>{
    try {
        res.render('forgotPassword')
    } catch (error) { 
        console.log(error.message)

    }
}


    const passwordOTP = async (req,res)=>{
       
        try {
            const email = req.body.email
            const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
            req.session.otp = otp;
            req.session.email = email
            await sendOTPByEmail(email, otp);
            res.render('forgotPassword', { email: email, message: 'OTP sent successfully.' })
        } catch (error) {
            console.log(error.message);
        }
    }
    const forgotVerifyOTP = async (req, res) => {
        try {
            const email = req.body.email;
            const enteredOTP = req.body.otp;
            const storedOTP = req.session.otp;
            if (enteredOTP === storedOTP) {
             // Clear the OTP from the session after successful verification
            //  ;
             res.json({ success: true, message: 'Login successful.', email: email });
            } else {
                // Incorrect OTP
                res.json({ success: false, message: 'Incorrect OTP' });
            }
        } catch (error) {
            console.error(error);
            res.json({ success: false, message: 'Error during OTP verification.' });
        }
    };

    const loadresetPassword = (req,res)=>{
        try {
            if(req.session.otp){
                delete req.session.otp
                res.render('resetPassword')
            
            }else{
                res.redirect("/login")
            }
           
        } catch (error) {
            console.log(error.message);
        }
    }

    const setNewPassword = async (req ,res) => {
        const newpw = req.body.password
        const confpw = req.body.confPassword
        const mobile = req.session.mobile
        const Email = req.session.email
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        if(newpw.match(passwordRegex)){

            if(newpw == confpw){
    
                const spassword =await securePassword(newpw)
                const newUser = await User.updateOne({ email:Email }, { $set: { password: spassword } });
                res.redirect('/login')
            }else{
                res.render('resetPassword',{message:'Password and Confirm Password is not matching'})
            }
        }
        
    }

    const editPassword = async (req, res) => {
        try {
          const newPass = req.body.newPassword;
          // const confPass = req.body.confPass;
          const userId = res.locals.user._id;
            const spassword = await securePassword(newPass);
      
            const result = await User.updateOne(
              { _id: userId },
              { $set: { password: spassword } }
            );
      
            res.send({status:true});
          
        } catch (error) {
          console.log(error.message);
        }
      };

module.exports={
    loadRegister,
    insertUser,
    signupVerify,
    loginUser,
    sendOTP,
    reSendotp,
    verifyOTP,
    verifyUser,
    homeLoad,
    logout,
    displayProduct,
    editInfo,
    checkEmail,
    loadForgotPassword,
    passwordOTP,
    forgotVerifyOTP,
    loadresetPassword,
    setNewPassword,
    editPassword
}