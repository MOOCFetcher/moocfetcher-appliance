import React from 'react'
import CourseStore, {COURSES_UPDATE_EVENT} from './CourseStore'
import CourseList from './CourseList'

export default class FilteredCourses extends React.Component {
  constructor() {
    super()
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
    return <CourseList courses={this.state.courses}/>
  }
}

