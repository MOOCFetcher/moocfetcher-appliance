import React from 'react'
import {CourseActions} from './CourseStore'

export default class SearchBox extends React.Component {

  initiateFilter = (e) => {
    CourseActions.filter(e.target.value)
  }

  render() {
    return (
      <form>
        <input type="text" className="form-control" id="search-box" placeholder="e.g. Philosophy" onInput={this.initiateFilter}/>
      </form>
    )
  }
}
