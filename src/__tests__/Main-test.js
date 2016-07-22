import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Main from '../Main'
import CourseStore from '../CourseStore'

jest.unmock('../Main')

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

describe("Main", () => {
  let main, updatedCourses
  beforeEach(() => {
    main = TestUtils.renderIntoDocument(<Main/>)
    CourseStore.getCourses = jest.fn(() => updatedCourses)
  })

  it("Displays loading message when no courses are loaded, which disappears on course load.", () => {
    updatedCourses = []
    expect(main.refs.loading).toBeDefined()
    main.coursesUpdated()
    expect(main.refs.loading).not.toBeDefined()

  })

  it("Updates filtered text when courses are loaded", () => {
    updatedCourses = []
    main.coursesUpdated()
    expect(main.refs.filterLabel.innerHTML).toBe("No Courses Found.")

    updatedCourses = courses.slice(1)
    main.coursesUpdated()
    expect(main.refs.filterLabel.innerHTML).toBe("1 Course Found.")

    updatedCourses = courses
    main.coursesUpdated()
    expect(main.refs.filterLabel.innerHTML).toBe("2 Courses Found.")
  })

  it("Updates filtered text when courses are loaded", () => {
    // First load the courses…
    updatedCourses = courses
    main.coursesUpdated()
    expect(main.refs.filterLabel.innerHTML).toBe("2 Courses Found.")

    // Then filter them
    updatedCourses = []
    main.coursesUpdated()
    expect(main.refs.filterLabel.innerHTML).toBe("No Courses Found.")
   })
})


