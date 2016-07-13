import React from 'react'

export default class CourseItem extends React.Component {
  static propTypes = {
    course: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
  }

  render() {
    let course = this.props.course
    return (
      <div className="row course-box card card-block">
        <div className="col-xs-10"><h4>{course.name}</h4></div>
        <div className="col-xs-2"><a href="#" className="btn btn-primary btn-sm">Add</a></div>
      </div>
    )
  }
}
