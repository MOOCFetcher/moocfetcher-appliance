import CourseStore, {
  COURSE_SELECT_EVENT,
  COURSE_UNSELECT_EVENT
} from './CourseStore'
import CourseList from './CourseList'
import React from 'react'

export default class SelectedCourses extends React.Component {
  constructor () {
    super()
    this.state = {courses: CourseStore.getSelected()}
  }

  componentWillMount () {
    CourseStore.on(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.on(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

  componentWillUnmount () {
    CourseStore.removeListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.removeListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

  courseSelectionUpdated = () => {
    this.setState({courses: CourseStore.getSelected()})
  }

  render () {
    return (
      <div className='modal fade' id='selectedCoursesModal'>
        <div className='modal-dialog' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <button aria-label='Close' className='close' data-dismiss='modal' type='button'>
                <span aria-hidden='true'>{'\u00d7'}</span>
              </button>
              <h4 className='modal-title'>{'Selected Courses'}</h4>
            </div>
            <div className='modal-body m-x-1'>
              {(() => {
                if (this.state.courses.length === 0) {
                  return (<p className='text-xs-center lead'>
                    <span className='font-italic'>{'No Courses Selected.'}</span>
                  </p>)
                }

                return <CourseList courses={this.state.courses} />
              })()}
            </div>
            <div className='modal-footer'>
              {(() => {
                if (this.state.courses.length === 0) {
                  return ''
                }

                return (<button
                  className='btn btn-primary'
                  data-dismiss='modal'
                  data-target='#copyCoursesModal'
                  data-toggle='modal'
                  type='button'
                        >{'Copy'}</button>)
              })()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
