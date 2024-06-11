const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

//sendotp
exports.sendOTP = async (req,res) => {

    try{
        //fetch email from req body
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        //user already exist return res
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            });
        }

        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated",otp);

        //BEKAAR CODE------> check unique otp or not
        let result = await OTP.findOne({otp:otp});

        while(result){
            otp = otpGenerator(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email,otp};
        //create entry in db
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return res successful
        res.status(200).json({
            success:true,
            message:"OTP sent Successfully",
            otp,
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

//signup
exports.signup = async (req,res) => {
    try{
        //data fetch from req body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        //validate krlo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp || !contactNumber) {
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            });
        }
        //2 password match??
        if(password != confirmPassword) {
            return res.status(400).json({
                success:false,
                message:'Password and ConfirmPassword values does not match, please try again',
            });
        }

        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:'User is already registered',
            });            
        }
        //find most recent OTP stored for user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(-1);
        console.log(recentOtp);
        //validate otp
        if(recentOtp.length==0) {
            //otp not found
            return res.status(400).json({
                success:false,
                message:'OTP not found',
            });
        }else if(otp !== recentOtp.otp) {
            //invalid otp
            return res.status(400).json({
                success:false,
                message:"OTP does not match",
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password,10);
        // create entry in db
        const profileDetails = await Profile.create({
            gender:null,
            dateofBirth:null,
            about:null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });
        // return res
         return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            user,
         });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered, please try again",
        });
    }
}
//login
exports.login = async (req,res) => {
    try{
        //get data
        const {email,password} = req.body;
        //validation
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message: 'All fields are required, please try again',
            });
        }
        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            });
        }
        //generate jwt,after pwd matching
        if(await bcrypt.compare(password,user.password)) {
            const payload = {
                email : user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET, {
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;

            //create cookie and send res
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully',
            });

        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login failure, please try again',
        });
    }
}
//changepassword HOMEWORK ??????????
exports.changePassword = async (req,res) => {
    try{
        //data fetch
        //get old password,newpassword,confirmpassword
        const { oldPassword, newPassword, confirmPassword } = req.body;


        //validation
        if(!oldPassword || !newPassword || !confirmPassword) {
            return res.status(403).json({
                success:false,
                message: 'All fields are required, please try again',
            });
        }

        if(newPassword !== confirmPassword ) {
            return res.status(402).json({
                success:false,
                message:'New password entered should be equal to confirm password',
            });
        }
        //update pwd in db?????????????
        const hashedPassword = await bcrypt.hash(password,10);

        //password update
        await User.findOneAndUpdate(
            {password:hashedPassword},
            {new:true},
        );
        //send mail - pwd updated
        await mailSender(email,"Password Reset Link","Password updated successfully" );

        //return res
        return res.status(200).json({
            success:true,
            message:'Password change successfully',
         });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Password updation fails, please try again',
        });
    }
}
