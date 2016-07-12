import React from 'react'

export default class SearchBox extends React.Component {
  render() {
    return (
      <form>
        <input type="text" className="form-control" id="search-box" placeholder="e.g. Philosophy"/>
      </form>
    )
  }
}
