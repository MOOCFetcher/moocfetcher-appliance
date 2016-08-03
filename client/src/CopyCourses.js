import React from 'react'
import CourseStore, {
  COURSE_SELECT_EVENT, COURSE_UNSELECT_EVENT,
  COPY_PROGRESS_EVENT, COPY_REQUESTED_EVENT,
  CourseActions} from './CourseStore'

export default class CopyCourses extends React.Component {
  constructor() {
    super()
    this.state = { courses: CourseStore.getSelected() }
  }

  courseSelectionUpdated = () => {
    this.setState({courses: CourseStore.getSelected()})
  }

  copyRequested = () => {
    this.setState({
      copy: {latest: COPY_REQUESTED_EVENT}
    })
  }

  copyProgressUpdated = (progress) => {
    this.setState({
      copy: {latest: COPY_PROGRESS_EVENT, progress}
    })
  }

  componentWillMount() {
    CourseStore.on(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.on(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)

    CourseStore.on(COPY_REQUESTED_EVENT, this.copyRequested)
    CourseStore.on(COPY_PROGRESS_EVENT, this.copyProgressUpdated)
  }

  componentWillUnmount() {
    CourseStore.removeListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.removeListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)

    CourseStore.removeListener(COPY_REQUESTED_EVENT, this.copyRequested)
    CourseStore.removeListener(COPY_PROGRESS_EVENT, this.copyProgressUpdated)
  }

  handleStart = (evt) => {
    evt.preventDefault()
    CourseActions.copy(this.state.courses)
  }

  handleCancel = (evt) => {
    evt.preventDefault()
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

  statusLabel(text) {
    return  <p className="text-xs-center lead"><span className="font-italic">{text}</span></p>
  }

  progressBar(value, total) {
    return <progress className="progress progress-striped progress-animated" value={value} max={total}></progress>
  }

  renderModalBody() {
    if (this.state.copy) {
      switch(this.state.copy.latest) {
        case COPY_REQUESTED_EVENT:
          return this.statusLabel("Waiting for server…")
        case COPY_PROGRESS_EVENT:
          if (this.state.copy.progress) {
            let p = this.state.copy.progress
            return [
              this.statusLabel(`${p.done} of ${p.total} copied…`),
              this.progressBar(p.done, p.total)
            ]
          } else {
            return [
              this.statusLabel(`0 of ${this.state.courses.length} copied…`),
              this.progressBar(0, this.state.courses.length)
            ]
          }
      }
    } else {
      return this.statusLabel(this.copyLabel())
    }
  }

  renderModalFooter() {
    if (this.state.copy) {
      return <button type="button" className="btn btn-danger" onClick={this.handleCancel}>Cancel</button>
    } else {
      return <button type="button" className="btn btn-primary" onClick={this.handleStart}>Start</button>
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
              {this.renderModalBody()}
            </div>
            <div className="modal-footer">
              {this.renderModalFooter()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
