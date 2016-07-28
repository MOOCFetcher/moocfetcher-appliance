import React from 'react'
import SelectionLabel from '../SelectionLabel'
import CourseStore from '../CourseStore'
import sd from 'skin-deep'

jest.unmock('../SelectionLabel')


describe('SelectionLabel', () => {
  let selectedCourses, main
  beforeEach(() => {
    selectedCourses = []
    CourseStore.getSelected = jest.fn(() => selectedCourses)
    main = sd.shallowRender(<SelectionLabel/>)
  })

  it('Displays the corresponding text when there are none, one or more courses', () => {
    expect(main.subTree('span').text()).toMatch("No Courses Selected.")

    selectedCourses = ['dummy']
    main.getMountedInstance().courseSelectionUpdated()
    expect(main.subTree('span').text()).toMatch("1 Course Selected.")

    selectedCourses = ['dummy 1', 'dummy 2']
    main.getMountedInstance().courseSelectionUpdated()
    expect(main.subTree('span').text()).toMatch("2 Courses Selected.")
  })

  it('Doesn’t display links for viewing selected courses, when no courses are selected', () => {
    expect(main.subTree('a', (node) => node.key == 'view')).toBe(false)
    expect(main.subTree('a', (node) => node.key == 'copy')).toBe(false)
  })

  it('Displays links for viewing and copying selected courses, when one or more courses are selected', () => {
    selectedCourses = ['dummy']
    main.getMountedInstance().courseSelectionUpdated()
    expect(main.subTree('a', (node) => node.key == 'view')).not.toBe(false)
    expect(main.subTree('a', (node) => node.key == 'copy')).not.toBe(false)
  })
})


