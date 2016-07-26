import React from 'react'
import CourseStore, {CourseActions, COURSES_UPDATE_EVENT} from './CourseStore'
import SearchBox from './SearchBox'
import FilterLabel from './FilterLabel'
import SelectionLabel from './SelectionLabel'
import FilteredCourses from './FilteredCourses'

export default class Main extends React.Component {

  constructor(props) {
    super(props)
    this.state = { coursesLoaded: false}
  }

  coursesLoaded = () => {
    this.setState({coursesLoaded: true})
    CourseStore.removeListener(COURSES_UPDATE_EVENT, this.coursesLoaded)
  }


  componentWillMount() {
    CourseStore.addListener(COURSES_UPDATE_EVENT, this.coursesLoaded)
    CourseActions.fetch()
  }

  componentWillUnmount() {
    CourseStore.removeListener(COURSES_UPDATE_EVENT, this.coursesLoaded)
  }

  render() {
    if (!this.state.coursesLoaded) {
      return <p ref="loading" className='text-xs-center'>Loading Courses…</p>
    }

    return (
      <div>
        <p className="text-xs-center">Search or browse our catalog of courses and select them to copy onto your own USB pen&nbsp;drive.</p>
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <SearchBox />
            <FilterLabel/>
            <SelectionLabel/>
          </div>
          <div className="col-md-8 col-md-offset-2">
            <FilteredCourses/>
          </div>
        </div>
      </div>
    )
  }
}
