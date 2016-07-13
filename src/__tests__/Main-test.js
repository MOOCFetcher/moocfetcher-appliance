import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Main from '../Main'

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
  let main
  beforeEach(() => {
    main = TestUtils.renderIntoDocument(<Main/>)
  })

  it("Displays loading message when no courses are loaded, which disappears on course load.", () => {
    expect(main.refs.loading).toBeDefined()
    main.coursesUpdated([])
    expect(main.refs.loading).not.toBeDefined()
    
  })

  it("Updates filtered text when courses are loaded", () => {
    main.coursesUpdated([])
    expect(main.refs.filterLabel.innerHTML).toBe("No Courses Found.")

    main.coursesUpdated(courses.slice(1))
    expect(main.refs.filterLabel.innerHTML).toBe("1 Course Found.")

    main.coursesUpdated(courses)
    expect(main.refs.filterLabel.innerHTML).toBe("2 Courses Found.")
  })

  it("Updates filtered text when courses are loaded", () => {
    // First load the courses…
    main.coursesUpdated(courses)
    expect(main.refs.filterLabel.innerHTML).toBe("2 Courses Found.")

    // Then filter them
    main.coursesUpdated([])
    expect(main.refs.filterLabel.innerHTML).toBe("No Courses Found.")
   })
})


