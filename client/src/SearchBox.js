import {CourseActions} from './CourseStore'
import React from 'react'

export default class SearchBox extends React.Component {

  handleInput = (e) => {
    CourseActions.filter(e.target.value)
  }

  render () {
    return (
      <form>
        <input
          className='form-control'
          id='search-box'
          onInput={this.handleInput}
          placeholder='e.g. Philosophy'
          type='text'
        />
      </form>
    )
  }
}
