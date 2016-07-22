import React from 'react'
import TestUtils from 'react-addons-test-utils'
import FilterLabel from '../FilterLabel'
import CourseStore from '../CourseStore'

jest.unmock('../FilterLabel')


describe('FilterLabel', () => {
  let filteredCourses, main
  beforeEach(() => {
    filteredCourses = []
    CourseStore.getCourses = jest.fn(() => filteredCourses)
    main = TestUtils.renderIntoDocument(<FilterLabel/>)
  })

  it('Displays the corresponding text when there are none, one or more courses', () => {
    filteredCourses = []
    main.coursesUpdated()

    filteredCourses = ['dummy']
    main.coursesUpdated()
    expect(main.refs.filterLabel.innerHTML).toBe("1 Course Found.")

    filteredCourses = ['dummy 1', 'dummy 2']
    main.coursesUpdated()
    expect(main.refs.filterLabel.innerHTML).toBe("2 Courses Found.")
  })
})

