const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");

//capture payment and initiate the razorpay order
exports.capturePayment = async (req,res) => {
    try{
        //userid,courseid fetch
        const {course_id} = req.body;
        const userId = req.user.id;
        //validation
        if(!course_id) {
            return res.status(404).json({
                success:false,
                message:'Please provide valid course ID',
            });
        }
        //valid courseid coursedetail
        let course;
        try{
            course = await Course.findById(course_id);
            if(!course){
                return res.json({
                    success:false,
                    message:'Could not find the course',
                });
            }
            //user already pay for same course
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)) {
                return res.status(280).json({
                    success:false,
                    message:'Student is already enrolled',
                });
            }


        }
        catch(error) {
            console.error(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
        
        //order create
        const amount = course.price;
        const currency = "INR";

        const options = {
            amount:amount * 100,
            currency,
            receipt:Math.random(Date.now()).toString(),
            notes: {
                courseId:course_id,
                userId,
            }
        };

        try{
            //initiate payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
            //return res
            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail:course.thumbnail,
                orderId:paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            });
        }
        catch(error) {
            console.log(error);
            res.json({
                success:false,
                message:"Could not initiate order",
            });
        }
        //return res
    }
    catch(error) {

    }
};

//verify signature of razorpay and server

exports.verifySignature = async (req,res) => {
    try{
        const webhookSecret = "12345678";

        const signature = req.headers["x-razorpay-signature"];

        const shasum = crypto.createHmac("sha256",webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if(signature===digest) {
            console.log("Payment is Authorised");

            const {courseId , userId} = req.body.payload.payment.entity.notes;

            try{
                //fulfil the action
                //find the course n  enroll the student in it
                const enrolledCourse = await Course.findOneAndUpdate(
                                                {_id:courseId},
                                                {$push: {studentsEnrolled:userId}},
                                                {new:true},
                );

                if(!enrolledCourse) {
                    return res.status(500).json({
                        success:false,
                        message:'Course not found',
                    });
                }

                console.log(enrolledCourse);

                //find student and add coursde to their enrolled course
                 const enrolledStudent = await User.findOneAndUpdate(
                                                {_id:userId},
                                                {$push:{courses:courseId}},
                                                {new:true},
                 );

                 if(!enrolledStudent) {
                    return res.status(500).json({
                        success:false,
                        message:'Student not found',
                    });
                }
                
                console.log(enrolledStudent);

                //mail send krdo confirmation wala
                const emailResponse = await mailSender(
                                        enrolledStudent.email,
                                        "Congratulations from StudyNotion",
                                        "Congratulations, you are onboarded into a new StudyNotion course",
                );
                console.log(emailResponse); 
                return res.status(200).json({
                    success:true,
                    message:"Signature verified and course added",
                });

            }
            catch(error) {
                console.log(error);
                return res.status(500).json({
                    success:false,
                    message:error.message,
                });
            }
        }
        else{
            return res.status(400).json({
                success:false,
                message:"Invalid request",
            });
        }
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            meassage:'Something went wrong, please try again',
            error:error.message,
        });
    }
}



