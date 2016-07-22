import React from 'react'
import TestUtils from 'react-addons-test-utils'
import CourseItem from '../CourseItem'
import CourseStore from '../CourseStore'

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
    CourseStore.getSelected = jest.fn( () => [])
    item = TestUtils.renderIntoDocument(<CourseItem course={course}/>)
  })

  it("displays the name of the course", () => {
    let name = TestUtils.findRenderedDOMComponentWithTag(item, "h4").innerHTML
    expect(name).toBe(course.name)
  })

  it('displays the Select button by default', () => {
    let title = TestUtils.findRenderedDOMComponentWithTag(item, "a").innerHTML
    expect(title).toBe('Select')
  })

  it('displays the title "Selected" after course is selected, which resets itself on clicking again', () => {
    TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithTag(item, "a"))
    let title = TestUtils.findRenderedDOMComponentWithTag(item, "a").innerHTML
    expect(title).toBe('Selected')


    TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithTag(item, "a"))
    title = TestUtils.findRenderedDOMComponentWithTag(item, "a").innerHTML
    expect(title).toBe('Select')
  })
})
