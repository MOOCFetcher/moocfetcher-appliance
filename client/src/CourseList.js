import React, {PropTypes} from 'react'
import CourseItem from './CourseItem'

const CourseList = ({courses}) => (
  <div>
    {courses.map((course) => <CourseItem course={course} key={course.slug} />)}
  </div>
)

CourseList.propTypes = {courses: PropTypes.arrayOf(PropTypes.object).isRequired}

export default CourseList
