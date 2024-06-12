const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();
//create subsection
exports.createSubSection = async (req,res) => {
    try{
        //data fetch
        const {sectionId,title,timeDuration,description} = req.body;
        //extract file video
        const video = req.files.videoFile;
        //validation
        if(!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success:false,
                meassage:'All fields are required',
            });
        }
        //upload to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME); 
        //create a subsectio
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        //update section with this subsection objectid
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
            {$push: {
                    subSection:subSectionDetails._id,
                    }
            },
            {new:true}
        );
        //write for populate function
        //return res
        return res.status(200).json({
            success:true,
            message:'Sub Section create successfully',
            updatedSection,
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

//HW: update n delete Subsec
exports.updateSubSection = async (req,res) => {
    try{
        //data fetch
        const {subSectionId,title,timeDuration,description} = req.body;

        //validation
        if(!subSectionId || !title || !timeDuration || !description) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        //update data
        const subSection = await SubSection.findByIdAndUpdate(subSectionId, {title:title,
                            timeDuration:timeDuration,
                            description:description} , {new:true});
        //return res
        return res.status(200).json({
            success:true,
            message:'SubSection updated successfully',
            updatedSection,
        });
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            meassage:'Unable to update SubSection, please try again',
            error:error.message,
        });
    }
}

exports.deleteSection = async (req,res) => {
    try{
        //get id--assuming that we r sending id in params
        const {subSectionId} = req.params;
        //find by id and delete
        await SubSection.findByIdAndDelete(subSectionId);
        // Do we need to deelete enrtry from course schema???????????
        //return res
        return res.status(200).json({
            success:true,
            message:'SubSection deleted successfully',
            updatedSection,
        });
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            meassage:'Unable to delete SubSection, please try again',
            error:error.message,
        });
    }
}