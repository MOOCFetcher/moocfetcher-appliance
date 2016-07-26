import React from 'react'
import {CourseActions} from './CourseStore'

export default class CourseItem extends React.Component {
  static propTypes = {
    course: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
  }

  selectCourse = (evt)  => {
    evt.preventDefault()
    let course = this.props.course
    CourseActions.select(course)
  }

  unselectCourse = (evt) => {
    evt.preventDefault()
    let course = this.props.course
    CourseActions.unselect(course)
  }

  render() {
    let course = this.props.course
    return (
      <div className="row course-box card card-block">
        <div className="col-xs-10"><h4>{course.name}</h4></div>
        <div className="col-xs-2">
        {
          course.selected ?
            <a href="#" onClick={this.unselectCourse} className="btn btn-danger btn-sm">Remove</a>
            : <a href="#" onClick={this.selectCourse} className="btn btn-primary btn-sm">Select</a>
        }
        </div>
      </div>
    )
  }
}
