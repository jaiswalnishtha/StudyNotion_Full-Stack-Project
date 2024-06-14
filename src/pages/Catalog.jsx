import React,{useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import { getCatalogPageData } from './../services/operations/pageAndComponentData';
import Footer from '../components/common/Footer';
import { apiConnector } from '../services/apiconnector';
import { categories } from '../services/apis';
import CourseSlider from '../components/core/Catalog/CourseSlider';
import CourseCard from '../components/core/HomePage/CourseCard';
import Course_Card from '../components/core/Catalog/Course_Card';
const Catalog = () => {
  const {catalogName} = useParams();
  const [getCatalogPageData,setCatalogPageData] = useState(null);
  const [categoryId,setCategoryId] = useState("");


  //fetch all cat
  useEffect(()=> {
    const getCategories = async() => {
      const res = await apiConnector("GET", categories.CATEGORIES_API)
      const category_id = 
      res?.data?.data?.filter((ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName)[0].
      _id;
      setCategoryId(category_id);
    }
    getCategories();
  },[catalogName]);

  useEffect(() => {
    const getCategoryDetails = async()=> {
      try{
        const res = await getCatalogPageData(categoryId);
        console.log("Printing res: ",res);
        setCatalogPageData(res);
      }
      catch(error) {
        console.log(error);

      }
    }
    getCategoryDetails();
  },[categoryId]);


  return (
    <div>
        <div>
          <p>{`Home / Catalog /`}
          <span>
              {getCatalogPageData?.data?.selectedCategory?.name}
          </span></p>
          <p>{getCatalogPageData?.data?.selectedCategory?.name}</p>
          <p>{getCatalogPageData?.data?.selectedCategory?.description}</p>
        </div>

        <div>
          {/* section1 */}
          <div>
          <div>Courses to get you started</div>
            <div className='flex gap-x-3'>
              <p>Most Popular</p>
              <p>New</p>
            </div>
            <div>
              <CourseSlider Courses={getCatalogPageData?.data?.selectedCategory?.courses} />
            </div>
          </div>

          {/* section 2 */}
          <div>
          <div>Top courses in {getCatalogPageData?.data?.selectedCategory?.name}</div>
            <div>
              <CourseSlider Courses={getCatalogPageData?.data?.differentCategory?.courses} />
            </div>
          </div>

          {/* section3 */}
          <div>
            <div>Frequently Bought</div>
            <div className='py-8'>

                <div className='grid grid-cols-1 lg:grid-cols-2'>

                    {
                      getCatalogPageData?.data?.mostSellingCourse?.slice(0,4)
                      .map((course,index) => (
                        <Course_Card course={course} key={index} Height = {"h-[400px]"} />
                      ))
                    }
                </div>
            </div>
          </div>

        </div>
        <Footer/>
    </div>
  )
}

export default Catalog
 