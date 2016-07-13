import React from 'react'
import CourseStore, {FILTER_EVENT} from './CourseStore'
import CourseItem from './CourseItem'

export default class CourseList extends React.Component {

  static propTypes = {
    courses: React.PropTypes.array.isRequired
  }


  constructor(props) {
    super(props)
    this.state = { coursesFiltered: false }
  }


  coursesFiltered = (courses) => {
    this.setState({coursesFiltered: true, filtered: courses})
  }

  componentWillMount() {
    CourseStore.addEventListener(FILTER_EVENT, this.coursesFiltered)
  }

  componentWillUnmount() {
    CourseStore.removeEventListener(FILTER_EVENT, this.coursesFiltered)
  }

  render() {
    let courses
    if (this.state.coursesFiltered) {
      console.log("displaying filtered courses")
      courses = this.filtered
    } else {
      console.log("displaying all courses")
      courses = this.props.courses
    }

    let courseItems = courses.map( (course) => <CourseItem course={course} key={course.slug}/>)

    return (
      <div ref="parent">
        {courseItems}
      </div>
    )
  }
}

