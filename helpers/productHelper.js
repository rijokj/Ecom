const Product = require('../models/productModel')
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types; 

const createProduct = (data,images) => {
  
    return new Promise((resolve,reject) =>{
      const newProduct = new Product({
        name:data.name,
        description:data.description,
        images:images,
        category:data.category,
        stock:data.stock,
        price:data.price
      });
  
      newProduct.save()
        .then(() =>{ 
          resolve() 
        })
        .catch((err) => {
          console.error('Error adding product:', err);
          reject(err)
        });
      });
  
  };

  const reListProduct = (query) => {
    return new Promise(async (resolve, reject) => {
      try {
        const id = query;
        const categorylisted = await Product.findOne({ _id: id }).populate('category');
        
        if (categorylisted.category.isListed === true) {
          await Product.updateOne({ _id: id }, { isProductListed: true });
        } else {
          console.log('Cannot Relist');

        }
        
        resolve();
      } catch (error) {
        console.log(error.message);
        reject(error);
      }
    });
  };
  
  
  const unListProduct = (query) => {
    return new Promise((resolve, reject) => {
      const id = query;
      Product.updateOne({ _id: id }, { isProductListed: false })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log(error.message);
          reject(error);
        });
    });
  };
  

  const updateProduct = async (data, images) => {
    try {
        const productData = await Product.updateOne(
          { _id: new ObjectId(data.id) },
          {
            $set: {
              name: data.name,
              description: data.description,
              category: data.category,
              images: images,
              stock:data.stock,
              price: data.price
            }
          }
        );

    } catch (error) {
      console.log(error.message);
    }
  }; 

  const removeImagefromFiles = (removedImages)=>{
    try {
      if(!Array.isArray(removedImages)){
        const deleteFile = (imagePath) => {
          const file = path.join(__dirname,imagePath)
          fs.unlink(file, (err) => {
              if (err) {
                  console.error(`Error deleting file: ${err}`);
                  // Handle error, e.g., send an error response
              } else {
                  console.log('File deleted successfully');
                  // Perform additional actions, e.g., send a success response
              }
          });
      };
    
      const imagePath = `../public/productImages/${removedImages}`
      deleteFile(imagePath)
        
      }else{
        removedImages.forEach((image)=>{
          const deleteFile = (imagePath) => {
            const file = path.join(__dirname,imagePath)
            fs.unlink(file, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${err}`);
                    // Handle error, e.g., send an error response
                } else {
                    console.log('File deleted successfully');
                    // Perform additional actions, e.g., send a success response
                }
            });
        };
    
        const imagePath = `../public/productImages/${image}`
        deleteFile(imagePath)
        })
      }
    } catch (error) {
      console.error(error.message);
    }
    }


module.exports = {
    createProduct,
    reListProduct,
    unListProduct,
    updateProduct,
    removeImagefromFiles
}