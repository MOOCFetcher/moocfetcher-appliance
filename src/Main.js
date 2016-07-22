import React from 'react'
import CourseStore, {CourseActions, COURSES_UPDATE_EVENT} from './CourseStore'
import SearchBox from './SearchBox.js'
import CourseList from './CourseList.js'

export default class Main extends React.Component {

  constructor(props) {
    super(props)
    this.state = { coursesUpdated: false}
  }

  coursesUpdated = () => {
    this.setState({coursesUpdated: true})
  }

  filterLabel() {
    let l = CourseStore.getCourses().length
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
    CourseStore.addListener(COURSES_UPDATE_EVENT, this.coursesUpdated)
    CourseActions.fetch()
  }

  componentWillUnmount() {
    CourseStore.removeListener(COURSES_UPDATE_EVENT, this.coursesUpdated)
  }

  render() {
    if (!this.state.coursesUpdated) {
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
            <CourseList/>
          </div>
        </div>
      </div>
    )
  }
}
