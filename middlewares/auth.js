//auth isStudent isAdmin isInstructor
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req,res,next) => {
    try{
        //extract jwt token,other ways to fetch token
        const token = req.cookies.token 
                    || req.body.token 
                    || req.header("Authorisation").replace("Bearer ", "");
        if(!token) {
            return res.status(401).json({
                success:false,
                message:'Token missing',
            });
        }
        //verify token
        try{
            const payload = jwt.verify(token,process.env.JWT_SECRET);
            console.log(payload);
            req.user = payload;
        }catch(error){
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:'err in authentication',
        });
    }
}


exports.isStudent = async (req,res,next) => {
    try{
        if(req.user.accountType != "Student") {
            return res.status(401).json({
                success:false,
                message:'This is protected route for student',
            });
        }
        next();

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'user role cannot ber verified, please try again',
        });
    }
}

exports.isInstructor = async (req,res,next) => {
    try{
        if(req.user.accountType != "Instructor") {
            return res.status(401).json({
                success:false,
                message:'This is protected route for Instructor',
            });
        }
        next();

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'user role cannot ber verified, please try again',
        });
    }
}

exports.isAdmin = (req,res,next) => {
    try{
        if(req.user.accountType != "Admin") {
            return res.status(401).json({
                success:false,
                message:'this is protected route for admin',
            });
        }
        next();

    }catch(error){
        return res.status(401).json({
            success:false,
            message:'something went wrong',
        });
    }
}
//auth

//isStudent
//isAdmin
//isInstructor