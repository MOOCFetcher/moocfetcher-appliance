import CourseStore from '../CourseStore'
import FilteredCourses from '../FilteredCourses'
import React from 'react'
import sd from 'skin-deep'

jest.unmock('../FilteredCourses')
jest.unmock('../CourseList')

const courses = [
  {
    slug: 'political-philosophy-2',
    courseType: 'v2.ondemand',
    id: 'z_MvXQoVEeWCpyIAC3lAyw',
    name: 'Revolutionary Ideas:  An Introduction to Legal and Political Philosophy, Part 2',
    primaryLanguageCodes: [
      'en'
    ]
  },
  {
    slug: 'symmetry',
    courseType: 'v2.ondemand',
    name: 'Beauty, Form & Function: An Exploration of Symmetry',
    id: 'iLI6egl6EeWw4CIACxsM5w'
  }
]

CourseStore.getCourses = jest.fn(() => courses)

describe('FilteredCourses', () => {
  beforeEach(() => {
    sd.shallowRender(<FilteredCourses />)
  })

  it('retrieves a list of courses', () => {
    expect(CourseStore.getCourses.mock.calls.length).toBe(1)
  })
})
