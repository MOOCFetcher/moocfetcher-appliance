import React from 'react'
import CourseItem from '../CourseItem'
import {CourseActions} from '../CourseStore'
import sd from 'skin-deep'

jest.unmock('../CourseItem')

let course =  {
  "slug": "political-philosophy-2",
  "courseType": "v2.ondemand",
  "id": "z_MvXQoVEeWCpyIAC3lAyw",
  "name": "Revolutionary Ideas: An Introduction to Legal and Political Philosophy, Part 2",
  "primaryLanguageCodes": [
    "en"
  ]
}

describe("CourseItem", () => {
  let item

  let renderItem = (c) => {
    return sd.shallowRender(<CourseItem course={c}/>)
  }

  beforeEach(() => {
    item = renderItem(course)
  })

  it("displays the name of the course", () => {
    let name = item.subTree('h4').text()
    expect(name).toBe(course.name)
  })

  it('displays the Select button if course is not selected', () => {
    let title = item.subTree('a').text()
    expect(title).toBe('Select')
  })

  it('displays the Remove button is course is selected', () => {
    let c = Object.assign({},course)
    c.selected = true
    item = renderItem(c)

    let title = item.subTree('a').text()
    expect(title).toBe('Remove')
  })

  it('Invokes CourseActions.select when Select button is clicked', () => {
    item.subTree('a').props.onClick({
      preventDefault: () => {}
    })
    expect(CourseActions.select.mock.calls.length).toBe(1)
  })

  it('Invokes CourseActions.unselect when Remove button is clicked', () => {
    let c = Object.assign({},course)
    c.selected = true
    item = renderItem(c)

    item.subTree('a').props.onClick({
      preventDefault: () => {}
    })
    expect(CourseActions.unselect.mock.calls.length).toBe(1)
  })
})
