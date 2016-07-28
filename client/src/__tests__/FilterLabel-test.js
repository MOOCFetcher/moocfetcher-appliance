import React from 'react'
import FilterLabel from '../FilterLabel'
import CourseStore from '../CourseStore'
import sd from 'skin-deep'

jest.unmock('../FilterLabel')


describe('FilterLabel', () => {
  let filteredCourses, main
  beforeEach(() => {
    filteredCourses = []
    CourseStore.getCourses = jest.fn(() => filteredCourses)
    main = sd.shallowRender(<FilterLabel/>)
  })

  it('Displays the corresponding text when there are none, one or more courses', () => {
    expect(main.subTree('p').text()).toBe("No Courses Found.")

    filteredCourses = ['dummy']
    main.getMountedInstance().coursesUpdated()
    expect(main.subTree('p').text()).toBe("1 Course Found.")

    filteredCourses = ['dummy 1', 'dummy 2']
    main.getMountedInstance().coursesUpdated()
    expect(main.subTree('p').text()).toBe("2 Courses Found.")
  })
})
