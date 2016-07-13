import React from 'react'
import CourseStore, {COURSES_UPDATE_EVENT} from './CourseStore'
import CourseItem from './CourseItem'

export default class CourseList extends React.Component {
  constructor(props) {
    super(props)
    // We assume an initial list of courses have already loaded.
    this.state = { courses: CourseStore.getCourses() }
  }

  coursesUpdated = (courses) => {
    this.setState({courses: courses})
  }

  componentWillMount() {
    CourseStore.on(COURSES_UPDATE_EVENT, this.coursesUpdated)
  }

  componentWillUnmount() {
    CourseStore.removeListener(COURSES_UPDATE_EVENT, this.coursesUpdated)
  }

  render() {
    let courseItems = this.state.courses.map( (course) => <CourseItem course={course} key={course.slug}/>)

    return (
      <div ref="parent">
        {courseItems}
      </div>
    )
  }
}

