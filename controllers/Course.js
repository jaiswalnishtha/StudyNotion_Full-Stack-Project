  const Course =require("../models/Course");
  const Tag =require("../models/category");
  const User=require("../models/User");
  const {uploadToCloudinary, uploadImageToCloudinary}= require("../utils/imageUploader");

  //craeteciurse handler function 
  exports.createCourse = async (req, res)=>{
    try{
        //fetch data
        const {courseName, courseDescription, whatYouWillLearn , price, category }=req.body;

        //get thumbnail
        const thumbnail= req.files.thumbnailImage;
         //validation
         if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail){
            return res.status(400).json({
                success:false, 
                message:" All fields are required",
            })
         }
         // check for instructor
         const userId=req.user.id;
         const instructorDetails=await User.findById(userId);
         console.log("Instructor Details:", instructorDetails);

         if(! instructorDetails){
            return res.status(404).json({
                success:false, 
                message:" Instructor Details not found",
            });
         }

         //CHECK GIVVEN TAG IS VAID OR NOT

         const categoryDetails= await Category.findById(category);
         if(!categoryDetails){
            return res.status(404).json({
                success:false, 
                message:" Category Details not found",
            });
         }
         //upload image to cloudinary
         const thumbnailImage=await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
         //CREATE a new course entry
         const newCourse= await Course.create({
            courseName, 
            courseDescription, 
            instructor:instructorDetails._id, 
            whatYouWillLearn:whatYouWillLearn, 
            price, 
            category:categoryDetails._id, 
            thumbnail:thumbnailImage.secure_url,
         })
         //add the new course to the user schema
         await User.findByIdAndUpdate(
{_id:instructorDetails._id}, 
{   $push:{
    courses:newCourse._id, 
}
}, 
{new:true},
         
        );
        //update the tag schema
        //todo
         //return response
         return res.status(404).json({
            success:true, 
            message:" Course Created Successfully",
            data:newCourse, 
        });
    }
        
         catch(error){
 console.error(error);
 return res.status(500).json({
    success:false, 
    message:" Failed to create course",
    error:error.message
});
         }
    
  };

  //get allcourses handler function

  exports.showAllCourses=async(req, res)=>{
    try{
        const allCourses= await Course.find({}, {
            courseName:true, 
            price:true, 
            thumbnail:true, 
            instructor:true, 
            ratingAndReviews:true,
             studentsEnrolled:true, })
             .populate("instructor")
             .exec();
             return res.status(200).json({
                success:true, 
                message:"Data for all courses fetched successfully",
                data:allCourses,
            });

        
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false, 
            message:"Cannot fetch course data",
            error:error.message,
        });
    }
  };
