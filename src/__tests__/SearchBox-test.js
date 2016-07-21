import React from 'react'
import TestUtils from 'react-addons-test-utils'

jest.unmock('../SearchBox')


describe('SearchBox', () => {
  let item
  beforeEach(() => {
    item = TestUtils.renderIntoDocument(<SearchBox/>)
  })

  it('Filters course when oninput event is fired for the search input field', () => {
    item.refs.searchbox.value = "Philosophy"
  })
})
