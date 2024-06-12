const RatingAndReview=require("../models/RatingAndRaview");
const Course=require("../models/Course");


exports.createRating=async(req, res)=>{
    try{
//get user Id
const userId=req.user.id;
//fetch data from req body
const {rating , review,courseId}=req.body;
//check if user is enrolled or not
const courseDetails = await Course.findOne({
    _id:courseId, 
    studentsEnrolled:{$elemMatch:{$eq:userId}}, 
});
if(!courseDetails){
    return res.status(404).json({
        success:false, 
        message:'Students is not enrolled in the course'
    });
}
//check if user is already enrolled int the course
const alreadyReviewed =await RatingAndReview.findOne({
    user:userId, 
    course:courseId
});
if(alreadyReviewed){
    return res.status(403).json({
        success:false, 
        message:"Course is already reviewed by the user", 
    })
}
const ratingReview=await RatingAndReview.create({
    rating, review, course:courseId, user:userId, 
})
//update course with this rating/review
const updatedCourseDetails =await Course.findByIdAndUpdate({_id:courseId}, {
    $push:{
        ratingAndReviews:ratingReview._id, 
    }
}, {new:true});
console.log(updatedCourseDetails);
return res.status(200).json({
    success:true, 
    message:"Rating And Review created successfully", 
    ratingReview,
})
    }
    catch(error){
        return res.status(500).json({
            success:false, 
            message:message.error, 
          
        })

    }
};

//get all average rating 
exports.getAverageRating = async(req, res)=>{
    try{
        //grt course id
        const courseId=req.body.courseId;
        //calculate average rating 
        const result= await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                
                }, 

            }, 
            {
                $group:{
                    _id:null, 
                    averageRating :{$avg:"$rating"}, 
                }
            }
        ]);
if(result.length>0){
    return res.status(200).json({
        success:true, 
        averageRating: result[0].averageRating,
    })
}
//if no rating review exist
return res.status(200).json({
    success:true, 
    message:"Average rating is 0, no ratings given till now",
    averageRating:0,
})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false, 
            message:error.message,
        
    })
    }

    }

    //get all rating and reviews
    exports.getAllRating=async(req, res)=>{
        try{
const allReviews= await RatingAndReview.find({})
sort({rating:"desc"})
.populate({
    path:"user", 
    select:"firstName lastName email image",
})
.populate({
    path:"user", 
    select:"courseName",
})
.exec();
return res.status(200).json({
    success:true, 
    message:"All reviews fetched successfully",
    data:allReviews,

})
        }catch(error){
            console.log(error);
                return res.status(500).json({
                    success:false, 
                    message:error.message,
                
            })
            }
        
    }