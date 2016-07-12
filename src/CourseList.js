import React from 'react'

export default class CourseList extends React.Component {
  render() {
    return (
      <div>
        <div className="row course-box card card-block">
          <div className="col-xs-10"><h4>Buddhism and Modern Psychology</h4></div>
          <div className="col-xs-2"><a href="#" className="btn btn-primary btn-sm">Add</a></div>
        </div>
        <div className="row course-box card card-block">
          <div className="col-xs-10"><h4>Ancient Philosophy: Plato and his Predecessors</h4></div>
          <div className="col-xs-2"><a href="#" className="btn btn-primary btn-sm">Add</a></div>
        </div>
      </div>
    )
  }
}

