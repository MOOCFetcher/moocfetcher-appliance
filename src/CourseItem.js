import React from 'react'
import CourseStore, {CourseActions} from './CourseStore'

export default class CourseItem extends React.Component {
  static propTypes = {
    course: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.state = { selected: CourseStore.getSelected().includes(this.props.course) }
  }

  selectCourse = (evt)  => {
    evt.preventDefault()
    let course = this.props.course
    CourseActions.select(course)
    this.setState({selected:true})
  }

  unselectCourse = (evt) => {
    evt.preventDefault()
    let course = this.props.course
    CourseActions.unselect(course)
    this.setState({selected:false})
  }

  render() {
    let course = this.props.course
    return (
      <div className="row course-box card card-block">
        <div className="col-xs-10"><h4>{course.name}</h4></div>
        <div className="col-xs-2">
        {
          this.state.selected ?
            <a href="#" onClick={this.unselectCourse} className="btn btn-success btn-sm">Selected</a>
            : <a href="#" onClick={this.selectCourse} className="btn btn-primary btn-sm">Select</a>
        }
        </div>
      </div>
    )
  }
}
