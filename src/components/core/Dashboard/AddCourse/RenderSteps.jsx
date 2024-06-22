import React from 'react'
import { FaCheck } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import CourseInformation from './CourseInformation/CourseInformation';
import CourseBuilderForm from './CourseBuilder/CourseBuilderForm';
const RenderSteps = () => {

    const {step} = useSelector((state) => state.course);

    const steps = [
        {
            id:1,
            title:"Course Information",
        },
        {
            id:2,
            title:"Course Builder",
        },
        {
            id:3,
            title:"Publish",
        },
    ]

  return (
    <>
        <div>
            {steps.map( (item) => {
                <>
                    <div>
                        <div className={`${step === item.id ? "bg-yellow-900 border-yellow-50 text-yellow-50" 
                        : "border-richblack-700 bg-richblue-800 text-richblue-300 "}`}>

                        {
                            step > item.id ? (<FaCheck/>) : (item.id)
                        }
                        </div>
                    </div>
                    {item.id !== steps.length && (
                        <>
                            <div
                                className={`h-[calc(34px/2)] w-[33%]  border-dashed border-b-2 ${
                                step > item.id  ? "border-yellow-50" : "border-richblack-500"
                            } `}
                            ></div>
                        </>
                    )}
                </>
            })}
        </div>
        <div>
            {steps.map((item) => (
                <>
                    <div>
                        <p>{item.title}</p>
                    </div>
                </>
            ))}
        </div>

        {step === 1 && <CourseInformation/>}
        {step === 2 && <CourseBuilderForm />}
    </>
  )
}

export default RenderSteps
