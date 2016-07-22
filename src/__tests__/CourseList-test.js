import React from 'react'
import TestUtils from 'react-addons-test-utils'
import CourseList from '../CourseList'
import CourseStore from '../CourseStore'

jest.unmock('../CourseList')
jest.unmock('../CourseItem')

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

CourseStore.getCourses = jest.fn(() => {
  return courses
})

describe("CourseList", () => {
  let list
  beforeEach(() => {
    CourseStore.getSelected = jest.fn( () => [])
    list = TestUtils.renderIntoDocument(<CourseList/>)
  })

  it("displays a list of courses", () => {
    expect(list.refs.parent.children.length).toBe(courses.length)
  })
})
