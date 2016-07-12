import React from 'react';
import ReactDOM from 'react-dom';


ReactDOM.render(
  <div>
    <p className="text-xs-center">Search or browse our catalog of courses and select them to copy onto your own USB pen&nbsp;drive.</p>
    <div className="row">
      <div className="col-md-6 col-md-offset-3">
        <form>
          <input type="text" className="form-control" id="search-box" placeholder="e.g. Philosophy"/>
        </form>
        <p className="font-italic lead text-xs-center">No Courses Found.</p>
      </div>
      <div className="col-md-8 col-md-offset-2">
        <div className="row course-box card card-block">
          <div className="col-xs-10"><h4>Buddhism and Modern Psychology</h4></div>
          <div className="col-xs-2"><a href="#" className="btn btn-primary btn-sm">Add</a></div>
        </div>
        <div className="row course-box card card-block">
          <div className="col-xs-10"><h4>Ancient Philosophy: Plato and his Predecessors</h4></div>
          <div className="col-xs-2"><a href="#" className="btn btn-primary btn-sm">Add</a></div>
        </div>
      </div>
    </div>
  </div>,
  document.getElementById('app')
)
