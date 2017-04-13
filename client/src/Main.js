import CourseStore, {
  COURSES_UPDATE_EVENT,
  CourseActions
} from './CourseStore'
import CopyCourses from './CopyCourses'
import FilterLabel from './FilterLabel'
import FilteredCourses from './FilteredCourses'
import React from 'react'
import SearchBox from './SearchBox'
import SelectedCourses from './SelectedCourses'
import SelectionLabel from './SelectionLabel'

export default class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {coursesLoaded: false}
  }

  componentWillMount () {
    CourseStore.addListener(COURSES_UPDATE_EVENT, this.coursesLoaded)
    CourseActions.fetch()
  }

  componentWillUnmount () {
    CourseStore.removeListener(COURSES_UPDATE_EVENT, this.coursesLoaded)
  }

  coursesLoaded = () => {
    this.setState({coursesLoaded: true})
    CourseStore.removeListener(COURSES_UPDATE_EVENT, this.coursesLoaded)
  }

  render () {
    if (!this.state.coursesLoaded) {
      return <p className='text-xs-center'>{'Loading Courses…'}</p>
    }

    return (
      <div>
        <p className='text-xs-center'>{
          `Search or browse our catalog of courses and select them to
            copy onto your own USB pen\u00a0drive.`
        }</p>
        <div className='row'>
          <div className='col-md-6 offset-md-3'>
            <SearchBox />
            <FilterLabel />
            <SelectionLabel />
          </div>
          <div className='col-md-8 offset-md-2'>
            <FilteredCourses />
          </div>
        </div>
        <CopyCourses />
        <SelectedCourses />
      </div>
    )
  }
}
