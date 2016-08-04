import Main from '../Main'
import React from 'react'
import sd from 'skin-deep'

jest.unmock('../Main')

describe('Main', () => {
  let main = null

  beforeEach(() => {
    main = sd.shallowRender(<Main />)
  })

  it('Displays ‘Loading’ when no courses are loaded, which disappears on course load.', () => {
    let loadingText = main.subTree('p').text()

    expect(loadingText).toMatch('Loading')

    main.getMountedInstance().coursesLoaded()
    loadingText = main.subTree('p').text()
    expect(loadingText).not.toMatch('Loading')
    expect(loadingText).toMatch('Search')
  })
})

