import React from 'react'
import CourseStore, {CourseActions, FETCH_EVENT, FILTER_EVENT} from './CourseStore'
import SearchBox from './SearchBox.js'
import CourseList from './CourseList.js'

export default class Main extends React.Component {

  constructor(props) {
    super(props)
    this.state = { coursesLoaded: false}
  }

  coursesLoaded = (courses) => {
    this.setState({coursesLoaded: true, courses: courses})
  }

  coursesFiltered = (courses) => {
    this.setState({filtered: courses, coursesFiltered: true})
  }

  filterLabel() {
    let l = this.state.coursesFiltered ? this.state.filtered.length : this.state.courses.length
    switch(l) {
      case 0:
        return "No Courses Found."
      case 1:
        return "1 Course Found."
      default:
        return l + " Courses Found."
    }
  }

  componentWillMount() {
    CourseStore.addEventListener(FETCH_EVENT, this.coursesLoaded)
    CourseStore.addEventListener(FILTER_EVENT, this.coursesFiltered)
    CourseActions.fetch()
  }

  componentWillUnmount() {
    CourseStore.removeEventListener(FETCH_EVENT, this.coursesLoaded)
    CourseStore.removeEventListener(FILTER_EVENT, this.coursesFiltered)
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
            <p ref="filterLabel" className="font-italic lead text-xs-center">{this.filterLabel()}</p>
          </div>
          <div className="col-md-8 col-md-offset-2">
            <CourseList courses={this.state.courses}/>
          </div>
        </div>
      </div>
    )
  }
}
