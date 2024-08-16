const categoryModel = require("../models/categoryModel")
const categoryHelper = require("../helpers/categoryHelper")


const loadCategory = async(req,res)=>{
    try {
      const category = await categoryModel.find();
      
      res.render('category',{categories:category})
    } catch (error) {
        console.log(error)
    }
}

const loadAddCategory = async(req,res)=>{
    try {
        res.render("addCategory")
        
    } catch (error) {
        console.log(error.message);
    }
}

const createCategory = async(req,res)=>{
    try {
        const categoryName = req.body.name.toLowerCase()
        const existingCategory = await categoryModel.findOne({name:categoryName})
        if(existingCategory){
            return res.render("addCategory",{message:"category already exists"})
        }
        if(!req.body.name || req.body.name.trim().length===0){
            return res.render("addCategory",{message:"Name is required"})
        }
        await categoryHelper.createCategory(req.body)
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}
const loadUpdateCategory = async(req,res)=>{
    try {
      const id = req.query.id
      const Categorydata = await categoryHelper.loadUpdateCategory(id)
      res.render('updateCategory',{category:Categorydata})
    } catch (error) {
      console.log(error.message)
    }
  }
  async function updateCategory(req, res) {
    try {
      const categoryId  = req.body.id
      await categoryHelper.updateCategory(categoryId,req.body)
      res.redirect('/admin/category')
    } catch (error) {
      console.log(error.message)
      
    }
  }
  
  // Delete a category
  const unListCategory = async(req, res)=>{
    try {
      await categoryHelper.unListCategory(req.query.id)
      res.redirect('/admin/category')
    } catch (error) {
      console.log(error.message);
    }
  }
  const reListCategory = async(req, res)=>{
    try {
      await categoryHelper.reListCategory(req.query.id)
      res.redirect('/admin/category')
    } catch (error) {
      console.log(error.message);
    }
  }

module.exports={
    loadCategory,
    loadAddCategory,
    createCategory,
    loadUpdateCategory,
    updateCategory,
    unListCategory,
    reListCategory
}