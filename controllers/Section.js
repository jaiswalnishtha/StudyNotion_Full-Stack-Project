const Section = require("../models/Section");
const Course = require("../models/Course");
require("dotenv").config();

exports.createSection = async (req,res) => {
    try{
        //data fetch
        const {sectionName,courseId} = req.body;
        //validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        //create section
        const newSection = await Section.create({sectionName}); 
        //update course with section objectid
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        );
        //HW:yha upr populate kaise kru ki section subsection dono populate ho jaye

        //return res
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails,
        });
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            meassage:'Unable to create Section, please try again',
            error:error.message,
        });
    }
}

exports.updateSection = async (req,res) => {
    try{
        //data fetch
        const {sectionName,sectionId} = req.body;

        //validation
        if(!sectionName || !sectionId) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName} , {new:true});
        //return res
        return res.status(200).json({
            success:true,
            message:'Section updated successfully',
            updatedCourseDetails,
        });
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            meassage:'Unable to update Section, please try again',
            error:error.message,
        });
    }
}

exports.deleteSection = async (req,res) => {
    try{
        //get id--assuming that we r sending id in params
        const {sectionId} = req.params;
        //find by id and delete
        await Section.findByIdAndDelete(sectionId);
        // Do we need to deelete enrtry from course schema???????????
        //return res
        return res.status(200).json({
            success:true,
            message:'Section deleted successfully',
            updatedCourseDetails,
        });
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            meassage:'Unable to delete Section, please try again',
            error:error.message,
        });
    }
}