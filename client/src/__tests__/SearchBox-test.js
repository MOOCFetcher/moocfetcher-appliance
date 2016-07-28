import React from 'react'
import SearchBox from '../SearchBox'
import {CourseActions} from '../CourseStore'
import sd from 'skin-deep'

jest.unmock('../SearchBox')


describe('SearchBox', () => {
  let item
  let term = "Philosophy"
  beforeEach(() => {
    item = sd.shallowRender(<SearchBox/>)
  })

  it('Filters course when oninput event is fired for the search input field', () => {
    item.subTree('input').props.onInput({
      target: { value: term }
    })
    expect(CourseActions.filter.mock.calls.length).toBe(1)
    expect(CourseActions.filter.mock.calls[0][0]).toBe(term)
  })
})
