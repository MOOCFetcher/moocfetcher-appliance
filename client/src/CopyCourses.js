import CourseStore, {
  COPY_CANCELLED_EVENT,
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
    CourseStore.on(COPY_CANCELLED_EVENT, this.copyCancelled)
  }

  componentWillUnmount () {
    CourseStore.removeListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.removeListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)

    CourseStore.removeListener(COPY_REQUESTED_EVENT, this.copyRequested)
    CourseStore.removeListener(COPY_PROGRESS_EVENT, this.copyProgressUpdated)
    CourseStore.remove(COPY_ERROR_EVENT, this.copyError)
    CourseStore.remove(COPY_FINISH_EVENT, this.copyFinished)
    CourseStore.remove(COPY_CANCELLED_EVENT, this.copyCancelled)
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

  copyError = (error, progress) => {
    this.setState({
      copy: {
        latest: COPY_ERROR_EVENT,
        error,
        progress
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

  copyCancelled = (progress) => {
    this.setState({
      copy: {
        latest: COPY_CANCELLED_EVENT,
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
    CourseActions.copyCancel()
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

  progress () {
    if (this.state.copy.progress) {
      const p = this.state.copy.progress
      const body = [
        this.statusLabel(`${p.done} of ${p.total} copied (${p.copied} files)…`, 'msg1'),
        this.progressBar(p.done, p.total)
      ]

      switch (p.status) {
        case 'cancel_requested':
          body.push(this.errorLabel('Cancel requested…', 'msg2'))
          break
        case 'running':
          body.push(this.statusLabel(`Copying ${p.current}…`, 'msg2'))
          break
        default:
          break
      }

      return body
    }

    return []
  }

  renderModalBody () {
    let body = []

    if (this.state.copy) {
      switch (this.state.copy.latest) {
        case COPY_REQUESTED_EVENT:
          return this.statusLabel('Waiting for process…', 'msg')
        case COPY_PROGRESS_EVENT:
          if (this.state.copy.progress) {
            return this.progress()
          }

          return [
            this.statusLabel(`0 of ${this.state.courses.length} copied…`, 'msg'),
            this.progressBar(0, this.state.courses.length)
          ]
        case COPY_ERROR_EVENT:
          body = this.progress()
          body.push([
            this.errorLabel(this.state.copy.error.error, 'msg2')
          ])

          return body
        case COPY_CANCELLED_EVENT:
          body = this.progress()
          body.push([
            this.errorLabel('Copy cancelled successfully.', 'msg2')])

          return body
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
    let btnTitle = ''
    let classNames = ''
    let attributes = {}
    let onClickHandler = null
    let latest = ''

    if (this.state.copy) {
      latest = this.state.copy.latest
    }

    switch (latest) {
      case COPY_PROGRESS_EVENT:
        classNames = 'btn btn-danger'
        btnTitle = 'Cancel'
        onClickHandler = this.handleCancel
        break
      case COPY_FINISH_EVENT:
        classNames = 'btn btn-success'
        btnTitle = 'Done'
        attributes = {'data-dismiss': 'modal'}
        onClickHandler = this.handleDone
        break
      case COPY_ERROR_EVENT:
      case COPY_CANCELLED_EVENT:
        classNames = 'btn btn-danger'
        btnTitle = 'Done'
        onClickHandler = this.handleDone
        break
      default:
        classNames = 'btn btn-primary'
        btnTitle = 'Start'
        onClickHandler = this.handleStart
    }

    return (<button
      className={classNames}
      onClick={onClickHandler}
      type='button'
      {...attributes}
            >{btnTitle}</button>)
  }

  render () {
    return (
      <div className='modal fade' id='copyCoursesModal'>
        <div className='modal-dialog' role='document'>
          <div className='modal-content' >
            <div className='modal-header'>
              <button aria-label='Close' className='close' data-dismiss='modal' type='button'>
                <span aria-hidden='true' >{'\u00d7'}</span>
              </button>
              <h4 className='modal-title'>{'Copy Courses'}</h4>
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
