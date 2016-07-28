import React, {PropTypes} from 'react'
import CourseItem from './CourseItem'

const CourseList = ({courses}) => (
  <div>
    {courses.map( (course) => <CourseItem course={course} key={course.slug}/>)}
  </div>
)

CourseList.propTypes = {
  courses: PropTypes.array.isRequired
}

export default CourseList
