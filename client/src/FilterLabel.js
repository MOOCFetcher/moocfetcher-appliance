import CourseStore, {COURSES_UPDATE_EVENT} from './CourseStore'
import React from 'react'

export default class FilterLabel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {numCourses: CourseStore.getCourses().length}
  }

  componentWillMount () {
    CourseStore.addListener(COURSES_UPDATE_EVENT, this.coursesUpdated)
  }

  componentWillUnmount () {
    CourseStore.removeListener(COURSES_UPDATE_EVENT, this.coursesUpdated)
  }

  coursesUpdated = () => {
    this.setState({numCourses: CourseStore.getCourses().length})
  }

  filterLabel (l) {
    switch (l) {
    case 0:
      return 'No Courses Found.'
    case 1:
      return '1 Course Found.'
    default:
      return `${l} Courses Found.`
    }
  }

  render () {
    return (<p
        className='font-italic lead text-xs-center'
            >{this.filterLabel(this.state.numCourses)}</p>)
  }
}
