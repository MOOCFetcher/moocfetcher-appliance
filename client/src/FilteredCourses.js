import CourseStore, {
  COURSES_UPDATE_EVENT,
  COURSE_SELECT_EVENT,
  COURSE_UNSELECT_EVENT
} from './CourseStore'
import CourseList from './CourseList'
import React from 'react'

export default class FilteredCourses extends React.Component {
  constructor () {
    super()
    this.state = {
      courses: CourseStore.getCourses(),
      selected: CourseStore.getSelected()
    }
  }

  componentWillMount () {
    CourseStore.on(COURSES_UPDATE_EVENT, this.coursesUpdated)
    CourseStore.on(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.on(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

  componentWillUnmount () {
    CourseStore.removeListener(COURSES_UPDATE_EVENT, this.coursesUpdated)
    CourseStore.removeListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.removeListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

  coursesUpdated = (courses) => {
    this.setState({courses})
  }

  courseSelectionUpdated = () => {
    // FIXME
    this.forceUpdate()
  }

  render () {
    return <CourseList courses={this.state.courses} />
  }
}

