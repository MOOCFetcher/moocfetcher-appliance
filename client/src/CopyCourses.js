import CourseStore, {
  COPY_ERROR_EVENT,
  COPY_FINISH_EVENT,
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
    CourseStore.on(COPY_ERROR_EVENT, this.copyError)
    CourseStore.on(COPY_FINISH_EVENT, this.copyFinished)
  }

  componentWillUnmount () {
    CourseStore.removeListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.removeListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)

    CourseStore.removeListener(COPY_REQUESTED_EVENT, this.copyRequested)
    CourseStore.removeListener(COPY_PROGRESS_EVENT, this.copyProgressUpdated)
    CourseStore.remove(COPY_ERROR_EVENT, this.copyError)
    CourseStore.remove(COPY_FINISH_EVENT, this.copyFinished)
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

  copyError = (error) => {
    this.setState({
      copy: {
        latest: COPY_ERROR_EVENT,
        error
      }
    })
  }

  copyFinished = (progress) => {
    this.setState({
      copy: {
        latest: COPY_FINISH_EVENT,
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

  handleDone = (evt) => {
    evt.preventDefault()
    this.setState({copy: null})
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
      return `1 course to be copied (${size} MB total).`
    default:
      return `${l} courses to be copied (${size} MB total).`
    }
  }

  statusLabel (text, key) {
    return (<p className='text-xs-center lead' key={key}>
      <span className='font-italic'>{text}</span>
    </p>)
  }

  errorLabel (text, key) {
    return (<p className='text-xs-center text-danger lead' key={key}>
      <span className='font-italic'>{text}</span>
    </p>)
  }

  progressBar (value, total) {
    return (<progress
        className='progress progress-striped progress-animated'
        key='progress'
        max={total}
        value={value}
            />)
  }

  renderModalBody () {
    if (this.state.copy) {
      switch (this.state.copy.latest) {
      case COPY_REQUESTED_EVENT:
        return this.statusLabel('Waiting for server…', 'msg')
      case COPY_PROGRESS_EVENT:
        if (this.state.copy.progress) {
          const p = this.state.copy.progress

          return [
            this.statusLabel(`${p.done} of ${p.total} copied…`, 'msg1'),
            this.progressBar(p.done, p.total),
            this.statusLabel(`Copying ${p.current}…`, 'msg2')
          ]
        }

        return [
          this.statusLabel(`0 of ${this.state.courses.length} copied…`, 'msg'),
          this.progressBar(0, this.state.courses.length)
        ]
      case COPY_ERROR_EVENT:
        return [
          this.errorLabel(this.state.copy.error.Error, 'msg')
        ]
      case COPY_FINISH_EVENT:
        return [
          this.statusLabel('Copy Finished.', 'msg1'),
          this.statusLabel('Eject USB Pen Drive and Press Done.', 'msg2')
        ]
      default:
        break
      }
    }

    return [
      this.statusLabel(this.copyLabel(), 'msg1'),
      this.statusLabel('Insert USB Pen Drive and Press Start.', 'msg2')
    ]
  }

  renderModalFooter () {
    const copyStatus = this.state.copy

    if (copyStatus) {
      switch (copyStatus.latest) {
      case COPY_PROGRESS_EVENT:
        return (<button
            className='btn btn-danger'
            onClick={this.handleCancel}
            type='button'
                >{"Cancel"}</button>)
      case COPY_FINISH_EVENT:
        return (<button
            className='btn btn-success'
            onClick={this.handleDone}
            type='button'
                >{"Done"}</button>)
      case COPY_ERROR_EVENT:
        return (<button
            className='btn btn-danger'
            onClick={this.handleDone}
            type='button'
                >{"Done"}</button>)
      default:
        break

      }
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
