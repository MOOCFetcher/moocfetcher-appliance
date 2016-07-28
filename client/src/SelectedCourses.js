import React from 'react'
import CourseStore, {COURSE_SELECT_EVENT, COURSE_UNSELECT_EVENT} from './CourseStore'
import CourseList from './CourseList'

export default class SelectedCourses extends React.Component {
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

  render() {
    return (
      <div id="selectedCoursesModal" className="modal fade">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">Selected Courses</h4>
            </div>
            <div className="modal-body m-x-1">
              {
                this.state.courses.length == 0 ?
                  <p className="text-xs-center lead"><span className="font-italic">No Courses Selected.</span></p> :
                <CourseList courses={this.state.courses}/>
              }
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Copy</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}


