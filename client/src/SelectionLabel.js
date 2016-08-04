import CourseStore, {
  COURSE_SELECT_EVENT,
  COURSE_UNSELECT_EVENT
} from './CourseStore'
import React from 'react'

export default class SelectionLabel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {numSelected: CourseStore.getSelected().length}
  }

  componentWillMount () {
    CourseStore.addListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.addListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

  componentWillUnmount () {
    CourseStore.removeListener(COURSE_SELECT_EVENT, this.courseSelectionUpdated)
    CourseStore.removeListener(COURSE_UNSELECT_EVENT, this.courseSelectionUpdated)
  }

  courseSelectionUpdated = () => {
    this.setState({numSelected: CourseStore.getSelected().length})
  }

  selectLabel (l) {
    switch (l) {
    case 0:
      return 'No Courses Selected.'
    case 1:
      return '1 Course Selected.'
    default:
      return `${l} Courses Selected.`
    }
  }

  render () {
    let children = [
      <span className='font-italic' key='label'>{this.selectLabel(this.state.numSelected)}</span>
    ]

    if (this.state.numSelected > 0) {
      children.push(
        <a
            className='p-x-2'
            data-toggle='modal'
            href='#selectedCoursesModal'
            key='view'
        >{'View'}</a>,
        <a
            className='p-x-2 btn btn-primary'
            data-toggle='modal'
            href='#copyCoursesModal'
            key='copy'
        >{'Copy'}</a>
       )
    }

    return <p className='text-xs-center lead'>{children}</p>
  }
}

