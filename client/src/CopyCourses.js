import React from 'react'
import CourseStore, {COURSE_SELECT_EVENT, COURSE_UNSELECT_EVENT} from './CourseStore'

export default class CopyCourses extends React.Component {
  constructor() {
    super()
    this.state = { courses: CourseStore.getSelected() }
  }

  courseSelectionUpdated = () => {
    this.setState({courses: CourseStore.getSelected()})
  }

  componentWillMount() {
    CourseStore.on(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.on(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

  componentWillUnmount() {
    CourseStore.removeListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.removeListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

  copyLabel() {
    let size = Math.ceil(this.state.courses.reduce((accum, course) => accum + course.size, 0)/(1024*1024))
    let l = this.state.courses.length
    switch(l) {
      case 0:
        return "No Courses Selected."
      case 1:
        return `1 course will be copied (${size} MB total).`
      default:
        return `${l} courses to be copied (${size} MB total).`
    }
  }

  handleStart = (evt) => {
    evt.preventDefault()
    this.setState({
      copying: "inprogress",
      progress: {
        current: "",
        done:1,
      }})
  }

  handleCancel = (evt) => {
    evt.preventDefault()
    this.setState({
      copying: null
    })
  }

  renderCopyProgress() {
    switch (this.state.copying) {
      case "inprogress":
        return (
          <progress className="progress progress-striped progress-animated" value={this.state.progress.done} max={this.state.courses.length}></progress>
        )
      default:
        return ""
    }
  }

  render() {
    return (
      <div id="copyCoursesModal" className="modal fade">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">Copy Courses</h4>
            </div>
            <div className="modal-body m-x-1">
              <p className="text-xs-center lead"><span className="font-italic">{this.copyLabel()}</span></p>
              {this.renderCopyProgress()}
            </div>
            <div className="modal-footer">
              { (() => {
                if (this.state.courses.length == 0) {
                  return ""
                } else {
                  switch(this.state.copying) {
                    case "inprogress": return <button type="button" className="btn btn-danger" onClick={this.handleCancel}>Cancel</button>
                    default: return <button type="button" className="btn btn-primary" onClick={this.handleStart}>Start</button>
                  }
                }
              })()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
