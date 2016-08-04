import CourseStore, {
  COPY_PROGRESS_EVENT,
  COPY_REQUESTED_EVENT,
  COURSE_SELECT_EVENT,
  COURSE_UNSELECT_EVENT,
  CourseActions
} from './CourseStore'
import React from 'react'

export default class CopyCourses extends React.Component {
  constructor () {
    super()
    this.state = {courses: CourseStore.getSelected()}
  }

  componentWillMount () {
    CourseStore.on(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.on(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)

    CourseStore.on(COPY_REQUESTED_EVENT, this.copyRequested)
    CourseStore.on(COPY_PROGRESS_EVENT, this.copyProgressUpdated)
  }

  componentWillUnmount () {
    CourseStore.removeListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.removeListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)

    CourseStore.removeListener(COPY_REQUESTED_EVENT, this.copyRequested)
    CourseStore.removeListener(COPY_PROGRESS_EVENT, this.copyProgressUpdated)
  }

  courseSelectionUpdated = () => {
    this.setState({courses: CourseStore.getSelected()})
  }

  copyRequested = () => {
    this.setState({copy: {latest: COPY_REQUESTED_EVENT}})
  }

  copyProgressUpdated = (progress) => {
    this.setState({
      copy: {
        latest: COPY_PROGRESS_EVENT,
        progress
      }
    })
  }

  handleStart = (evt) => {
    evt.preventDefault()
    CourseActions.copy(this.state.courses)
  }

  handleCancel = (evt) => {
    evt.preventDefault()
  }

  copyLabel () {
    const size = Math.ceil(
      this.state.courses.reduce(
        (accum, course) => accum + course.size, 0) / (1024 * 1024)
    )
    const l = this.state.courses.length

    switch (l) {
    case 0:
      return 'No Courses Selected.'
    case 1:
      return `1 course will be copied (${size} MB total).`
    default:
      return `${l} courses to be copied (${size} MB total).`
    }
  }

  statusLabel (text) {
    return <p className='text-xs-center lead'><span className='font-italic'>{text}</span></p>
  }

  progressBar (value, total) {
    return (<progress
        className='progress progress-striped progress-animated'
        max={total}
        value={value}
            />)
  }

  renderModalBody () {
    if (this.state.copy) {
      switch (this.state.copy.latest) {
      case COPY_REQUESTED_EVENT:
        return this.statusLabel('Waiting for server…')
      case COPY_PROGRESS_EVENT:
        if (this.state.copy.progress) {
          const p = this.state.copy.progress

          return [
            this.statusLabel(`${p.done} of ${p.total} copied…`),
            this.progressBar(p.done, p.total)
          ]
        }

        return [
          this.statusLabel(`0 of ${this.state.courses.length} copied…`),
          this.progressBar(0, this.state.courses.length)
        ]

      default:
        break
      }
    }

    return this.statusLabel(this.copyLabel())
  }

  renderModalFooter () {
    if (this.state.copy) {
      return (<button
          className='btn btn-danger'
          onClick={this.handleCancel}
          type='button'
              >{"Cancel"}</button>)
    }

    return (<button
        className='btn btn-primary'
        onClick={this.handleStart}
        type='button'
            >{"Start"}</button>)
  }

  render () {
    return (
      <div className='modal fade' id='copyCoursesModal'>
        <div className='modal-dialog' role='document'>
          <div className='modal-content' >
            <div className='modal-header'>
              <button aria-label='Close' className='close' data-dismiss='modal' type='button'>
                <span aria-hidden='true' >{"\u00d7"}</span>
              </button>
              <h4 className='modal-title'>{"Copy Courses"}</h4>
            </div>
            <div className='modal-body m-x-1'>
              {this.renderModalBody()}
            </div>
            <div className='modal-footer'>
              {this.renderModalFooter()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
