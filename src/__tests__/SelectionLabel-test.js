import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SelectionLabel from '../SelectionLabel'
import CourseStore from '../CourseStore'

jest.unmock('../SelectionLabel')


describe('SelectionLabel', () => {
  let selectedCourses, main
  beforeEach(() => {
    selectedCourses = []
    CourseStore.getSelected = jest.fn(() => selectedCourses)
    main = TestUtils.renderIntoDocument(<SelectionLabel/>)
  })

  it('Displays the corresponding text when there are none, one or more courses', () => {
    selectedCourses = []
    main.courseSelectionUpdated()
    expect(main.refs.selectLabel.innerHTML).toMatch("No Courses Selected.")


    selectedCourses = ['dummy']
    main.courseSelectionUpdated()
    expect(main.refs.selectLabel.innerHTML).toMatch("1 Course Selected.")

    selectedCourses = ['dummy 1', 'dummy 2']
    main.courseSelectionUpdated()
    expect(main.refs.selectLabel.innerHTML).toMatch("2 Courses Selected.")
  })
})


