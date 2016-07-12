import React from 'react'
import ReactDOM from 'react-dom'
import SearchBox from './SearchBox.js'
import CourseList from './CourseList.js'
import $ from 'jQuery'

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    $.getJSON('/data/courses.json', (data) => this.loadCourses(data.courses))
  }

  loadCourses(courses) {
    this.courses = courses
    this.filteredCourses = courses
    this.setState({coursesLoaded: true})
  }

  render() {
    if (!this.state.coursesLoaded) {
      return <p className='text-xs-center'>Loading Courses…</p>
    }

    return (
      <div>
        <p className="text-xs-center">Search or browse our catalog of courses and select them to copy onto your own USB pen&nbsp;drive.</p>
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <SearchBox />
            <p className="font-italic lead text-xs-center">No Courses Found.</p>
          </div>
          <div className="col-md-8 col-md-offset-2">
            <CourseList />
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('app'))
