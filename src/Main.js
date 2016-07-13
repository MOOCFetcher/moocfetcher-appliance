import React from 'react'
import CourseStore, {CourseActions, FETCH_EVENT} from './CourseStore'
import SearchBox from './SearchBox.js'
import CourseList from './CourseList.js'

export default class Main extends React.Component {

  constructor(props) {
    super(props)
    this.state = { coursesLoaded: false, numFound: 0}
  }

  coursesLoaded = (courses) => {
    this.setState({coursesLoaded: true, numFound: courses.length})
  }

  coursesFiltered = (courses) => {
    this.setState({numFound: courses.length})
  }

  filterLabel() {
    let l = this.state.numFound
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
    CourseActions.fetch()
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
            <CourseList />
          </div>
        </div>
      </div>
    )
  }
}
