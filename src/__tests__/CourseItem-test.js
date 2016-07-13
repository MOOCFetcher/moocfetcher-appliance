import React from 'react'
import TestUtils from 'react-addons-test-utils'
import CourseItem from '../CourseItem'

jest.unmock('../CourseItem')

let course =  {
  "slug": "political-philosophy-2",
  "courseType": "v2.ondemand",
  "id": "z_MvXQoVEeWCpyIAC3lAyw",
  "name": "Revolutionary Ideas:  An Introduction to Legal and Political Philosophy, Part 2",
  "primaryLanguageCodes": [
    "en"
  ]
}

describe("CourseItem", () => {
  let item
  beforeEach(() => {
    item = TestUtils.renderIntoDocument(<CourseItem course={course}/>)
  })

  it("displays the name of the course", () => {
    let name = TestUtils.findRenderedDOMComponentWithTag(item, "h4").innerHTML
    expect(name).toBe(course.name)
  })
})
