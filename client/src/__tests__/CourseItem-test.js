import {CourseActions} from '../CourseStore'
import CourseItem from '../CourseItem'
import React from 'react'
import sd from 'skin-deep'

jest.unmock('../CourseItem')

const course = {
  slug: 'political-philosophy-2',
  courseType: 'v2.ondemand',
  id: 'z_MvXQoVEeWCpyIAC3lAyw',
  name: 'Revolutionary Ideas: An Introduction to Legal and Political Philosophy, Part 2',
  primaryLanguageCodes: [
    'en'
  ]
}

describe('CourseItem', () => {
  let item = null

  const renderItem = (c) => sd.shallowRender(<CourseItem course={c} />)

  beforeEach(() => {
    item = renderItem(course)
  })

  it('displays the name of the course', () => {
    const name = item.subTree('h4').text()

    expect(name).toBe(course.name)
  })

  it('displays the Select button if course is not selected', () => {
    const title = item.subTree('a').text()

    expect(title).toBe('Select')
  })

  it('displays the Remove button is course is selected', () => {
    const c = Object.assign({}, course)

    c.selected = true
    item = renderItem(c)

    const title = item.subTree('a').text()

    expect(title).toBe('Remove')
  })

  it('Invokes CourseActions.select when Select button is clicked', () => {
    item.subTree('a').props.onClick({preventDefault: () => { /* Do nothing */ }})
    expect(CourseActions.select.mock.calls.length).toBe(1)
  })

  it('Invokes CourseActions.unselect when Remove button is clicked', () => {
    const c = Object.assign({}, course)

    c.selected = true
    item = renderItem(c)

    item.subTree('a').props.onClick({preventDefault: () => { /* Do nothing */ }})
    expect(CourseActions.unselect.mock.calls.length).toBe(1)
  })
})
