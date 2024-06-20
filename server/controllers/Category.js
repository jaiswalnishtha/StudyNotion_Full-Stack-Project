const { mongoose } = require("mongoose");
const Category =require("../models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }
//handler function of atg
exports.createCategory =async (req, res)=>{
    try{
//fetch data
const {name ,description }=req.body;
//validation
if(!name || !description){
    return res.status(400).json({
        success:false,
        message:'All fields are required',
    })
}
//create entry in db
const categoryDetails=await Category.create({
    name:name, 
    description:description,
});
console.log(categoryDetails);
//return response 
return res.status(200).json({
    success:true, 
    message:"Category created successfully",
})
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    }
};
//getAll categories
exports.showAllCategories= async(req, res)=>{
    try{
        const allCategorys = await Category.find({}, {name:true, description:true});
        res.status(200).json({
            success:true, 
            message:" All Categories returned successfully",
            data: allCategorys,
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
// category pager details 
exports.categoryPageDetails =async(req, res)=>{
    try{
//get category id
const {categoryId}=req.body;
const updatedCategoryId = new mongoose.Types.ObjectId(categoryId);
//get courses for specified category id
const selectedCategory= await Category.findById(categoryId)
.populate("courses")
.exec();
//validation
if(!selectedCategory){
    return res.status(401).json({
        success:false,
        message:"Data not found",
    });
}
//get courses for duffeent category
const differentCategories=await Category.find({
    _id:{$ne:categoryId},
})
.populate("courses")
.exec();
//get top selling courses
//homework 

//return response
return res.status(200).json({
    success:true,
    data:{
        selectedCategory,
        differentCategories
    }
});
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}