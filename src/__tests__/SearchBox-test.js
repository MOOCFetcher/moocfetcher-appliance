import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchBox from '../SearchBox'
import {CourseActions} from '../CourseStore'

jest.unmock('../SearchBox')


describe('SearchBox', () => {
  let item
  let term = "Philosophy"
  beforeEach(() => {
    item = TestUtils.renderIntoDocument(<SearchBox/>)
  })

  it('Filters course when oninput event is fired for the search input field', () => {
    item.refs.searchbox.value = term
    TestUtils.Simulate.input(item.refs.searchbox)
    expect(CourseActions.filter.mock.calls.length).toBe(1)
    expect(CourseActions.filter.mock.calls[0][0]).toBe(term)
  })
})
