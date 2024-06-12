const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req,res) => {
    try{
       //get data
       const {dateOfBirth="",about="",profession,contactNumber,gender} = req.body;
       const id = req.user.id;
       //validation
       if(!contactNumber || !gender || !profession) {
        return res.status(400).json({
            success:false,
            message:'All fields are required',
        });
       }
       //usrid
       //find profile
       const userDetails = await User.findById(id);
       const profileId = userDetails.additionalDetails;
       const profileDetails = await Profile.findById(profileId);

       //update profile
       profileDetails.dateOfBirth = dateOfBirth;
       profileDetails.about = about;
       profileDetails.gender = gender;
       profileDetails.profession = profession;
       profileDetails.contactNumber = contactNumber;
       await profileDetails.save();
        //return res
        return res.status(200).json({
            success:true,
            meassage:'Profile updated Successfully',
            profileDetails,
        });
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            meassage:'Unable to update Profile, please try again',
            error:error.message,
        });
    }
}

//delete account

exports.deleteAccount = async(req,res) => {
    try{
        //get id
        const id = req.res.id;
        //validation
        const userDetails = await User.findById(id);

        if(!userDetails) {
            return res.status(404).json({
                success:false,
                message:'User not found',
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //HW: unenroll user from all enrolled courses?????

        //delete user
        await User.findByIdAndDelete({_id:id});

        //return res
        return res.status(200).json({
            success:true,
            meassage:'User deleted Successfully',
        });
    }
    catch(error) {
        res.status(500).json({
            success:false,
            message:'User cannot be deleted',
        });
    }
}

exports.getAllUserDetails = async (req,res) => {
    try{
        //get id
        const id = req.user.id;
        //validation n get user details
        if(!id){
            return res.status(404).json({
                success:false,
                message:'User cannot found',
            });
        }

        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        //return res
        return res.status(200).json({
            success:true,
            message:'User data fetched successfully',
        });
    }
    catch(error) {
        res.status(500).json({
            success:false,
            message:'Unable to fetch user data',
        });
    }
}