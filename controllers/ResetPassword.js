const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//resetpasswordtoken 
exports.resetPasswordToken = async (req,res) => {
    try{
        //get email from req body
        const email = req.body.email;
        //check user for this email emailverify
        const user = await User.findOne({email:email});
        if(!user) {
            return res.json({
                success:false,
                message:'Your email is not registered with us',
            });
        }
        //generate token
        const token = crypto.randomUUID();
        //update user by adding token n expiration time
        const updatedDetails = await User.findOneAndUpdate(
            {
                email:email
            },
            {
                token:token,
                resetPasswordExpires: Date.now() + 5*60*1000,
            },
            {new:true}
        );
        //create url
        const url = `http://localhost:3000/update-password/${token}`

        //send email containing email
        await mailSender(email,"Password Reset Link",`Password reset link: ${url}` );
        //return res
        return res.json({
            success:true,
            message:'Email sent successfully, please check email and change password',
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong, please try again later',
        });
    }
}

//reset password
exports.resetPassword = async (req,res) => {
    try{
        //data fetch
        const {password,confirmPassword,token} = req.body;
        //validation
        if(password !== confirmPassword) {
            return res.json({
                success:false,
                message:'Password does not match, please try again',
            });
        }
        //get user details from db using token
        const userDetails = await user.findOne({token:token});
        //if no entry -- invalid user
        if(!userDetails) {
            return res.json({
                success:false,
                message:'Token is invalid',
            });
        }
        //token time check
        if(userDetails.resetPasswordExpires <  Date.now() ) {
            return res.status(500).json({
                success:false,
                message:'Token is expired',
            });
        }
        //hash pwd
        const hashedPassword = await bcrypt.hash(password,10);

        //password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );
        //return res
        return res.status(200).json({
            success:true,
            message:'Password reset successful',
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false, 
            message:'Something went wrong, please try again later',
        });
    }
}