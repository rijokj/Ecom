const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/urban_shoes",{useNewUrlParser : true,  
useUnifiedTopology:true
});
const express = require("express")

const app = express()

const userRoute = require("./router/userRoute")
const adminRoute = require("./router/adminRoute")







app.use(express.static(__dirname+'/public'))

app.use('/',userRoute)
app.use('/admin',adminRoute)


app.listen(3000,function(){
    console.log("server is running at 127.0.0.1:27017")
})

