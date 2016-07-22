import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Main from '../Main'

jest.unmock('../Main')

describe("Main", () => {
  let main
  beforeEach(() => {
    main = TestUtils.renderIntoDocument(<Main/>)
  })

  it("Displays loading message when no courses are loaded, which disappears on course load.", () => {
    expect(main.refs.loading).toBeDefined()
    main.coursesLoaded()
    expect(main.refs.loading).not.toBeDefined()
  })
})

