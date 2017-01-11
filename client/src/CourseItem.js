import {CourseActions} from './CourseStore'
import React from 'react'

export default class CourseItem extends React.Component {
  static propTypes = {
    course: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      slug: React.PropTypes.string.isRequired,
      selected: React.PropTypes.bool
    }).isRequired
  }

  handleSelect = (evt) => {
    evt.preventDefault()

    const course = this.props.course

    CourseActions.select(course)
  }

  handleRemove = (evt) => {
    evt.preventDefault()

    const course = this.props.course

    CourseActions.unselect(course)
  }

  render () {
    const course = this.props.course

    return (
      <div className='row course-box card card-block'>
        <div className='col-xs-10'>
          <h4>{course.name}</h4>
        </div>
        <div className='col-xs-2'>
          {(() => {
            if (course.selected) {
              return (<a className='btn btn-danger btn-sm'
                href='#'
                onClick={this.handleRemove}
                      >{'Remove'}</a>)
            }

            return (<a className='btn btn-primary btn-sm'
              href='#'
              onClick={this.handleSelect}
                    >{'Select'}</a>)
          }
          )()}
        </div>
      </div>
    )
  }
}
