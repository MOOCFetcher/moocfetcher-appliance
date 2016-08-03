import React from 'react'
import CourseStore, {COURSE_SELECT_EVENT, COURSE_UNSELECT_EVENT} from './CourseStore'

export default class SelectionLabel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {numSelected: CourseStore.getSelected().length}
  }

  courseSelectionUpdated = () => {
    this.setState({numSelected: CourseStore.getSelected().length})
  }

  componentWillMount() {
    CourseStore.addListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.addListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

  componentWillUnmount() {
    CourseStore.removeListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.removeListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

   selectLabel(l) {
    switch(l) {
      case 0:
        return "No Courses Selected."
      case 1:
        return "1 Course Selected."
      default:
        return l + " Courses Selected."
    }
  }

   render() {
     let children = [<span className="font-italic" key="label">{this.selectLabel(this.state.numSelected)}</span>]
     if (this.state.numSelected > 0) {
       children.push(
         <a href="#selectedCoursesModal" className="p-x-2" key="view" data-toggle="modal">View</a>,
         <a href="#copyCoursesModal" className="p-x-2 btn btn-primary" key="copy" data-toggle="modal">Copy</a>
       )
     }
     return <p ref="selectLabel" className="text-xs-center lead">
       {children}
       </p>
   }
}

