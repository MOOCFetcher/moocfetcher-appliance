import React from 'react'
import CourseStore, {COURSES_UPDATE_EVENT, COURSE_SELECT_EVENT, COURSE_UNSELECT_EVENT} from './CourseStore'
import CourseList from './CourseList'

export default class FilteredCourses extends React.Component {
  constructor() {
    super()
    this.state = { courses: CourseStore.getCourses(), selected: CourseStore.getSelected() }
  }

  coursesUpdated = (courses) => {
    this.setState({courses: courses})
  }

  courseSelectionUpdated = () => {
    //FIXME
    this.forceUpdate()
  }

  componentWillMount() {
    CourseStore.on(COURSES_UPDATE_EVENT, this.coursesUpdated)
    CourseStore.on(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.on(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

  componentWillUnmount() {
    CourseStore.removeListener(COURSES_UPDATE_EVENT, this.coursesUpdated)
    CourseStore.removeListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.removeListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

  render() {
    return <CourseList courses={this.state.courses}/>
  }
}

