import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SelectedCourses from '../SelectedCourses'
import CourseStore from '../CourseStore'

jest.unmock('../SelectedCourses')

let courses = [
  {
    "slug": "political-philosophy-2",
    "courseType": "v2.ondemand",
    "id": "z_MvXQoVEeWCpyIAC3lAyw",
    "name": "Revolutionary Ideas:  An Introduction to Legal and Political Philosophy, Part 2",
    "primaryLanguageCodes": [
      "en"
    ]
  },
  {
    "slug": "symmetry",
    "courseType": "v2.ondemand",
    "name": "Beauty, Form & Function: An Exploration of Symmetry",
    "id": "iLI6egl6EeWw4CIACxsM5w"
  }
]

CourseStore.getSelected = jest.fn(() => {
  return courses
})

describe("SelectedCourses", () => {
  const shallowRenderer = TestUtils.createRenderer()
  beforeEach(() => {
    shallowRenderer.render(<SelectedCourses/>)
  })

  it("retrieves a list of selected courses", () => {
    expect(CourseStore.getSelected.mock.calls.length).toBe(1)
  })
})

