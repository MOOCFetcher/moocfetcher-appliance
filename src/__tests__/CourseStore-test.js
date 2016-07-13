import CourseStore, {CourseActions, COURSES_UPDATE_EVENT, FILTER_ACTION, FETCH_ACTION} from '../CourseStore'
import AppDispatcher from '../AppDispatcher'
import $ from 'jQuery'

jest.unmock('../CourseStore')
jest.unmock('events')

// Mock course data
let courseData = {
  "courses" : [
    {
      "slug": "political-philosophy-2",
      "courseType": "v2.ondemand",
      "id": "z_MvXQoVEeWCpyIAC3lAyw",
      "name": "Revolutionary Ideas:  An Introduction to Legal and Political Philosophy, Part 2",
      "primaryLanguageCodes": [
        "en"
      ]
    },
    {
      "slug": "symmetry",
      "courseType": "v2.ondemand",
      "name": "Beauty, Form & Function: An Exploration of Symmetry",
      "id": "iLI6egl6EeWw4CIACxsM5w"
    },
    {
      "courseType": "v2.ondemand",
      "slug": "python-data",
      "name": "Python Data Structures",
      "id": "P--h6zpNEeWYbg7p2_3OHQ",
      "primaryLanguageCodes": [
        "en"
      ]
    },
    {
      "id": "Z3yHdBVBEeWvmQrN_lODCw",
      "name": "User Experience: Research & Prototyping",
      "courseType": "v2.ondemand",
      "slug": "user-research",
      "primaryLanguageCodes": [
        "en"
      ]
    }
  ]
}


describe("CourseActions", () => {
  beforeEach(() => {
    AppDispatcher.dispatch.mockClear()    
  })

  it("calls the dispatcher with a filter action", () => {
    let filter = "Philosophy"
    CourseActions.filter(filter)
    expect(AppDispatcher.dispatch.mock.calls.length).toBe(1)
    let action = AppDispatcher.dispatch.mock.calls[0][0]
    expect(action.text).toBe(filter)
    expect(action.actionType).toBe(FILTER_ACTION)
  })

  it("calls the dispatcher with a fetch action", () => {
    CourseActions.fetch()
    expect(AppDispatcher.dispatch.mock.calls.length).toBe(1)
    let action = AppDispatcher.dispatch.mock.calls[0][0]
    expect(action.actionType).toBe(FETCH_ACTION)
  })
})


describe("CourseStore", () => {
  // Callback registered by CourseStore with AppDispatcher
  let callback = AppDispatcher.register.mock.calls[0][0]
  let eventReceiver = jest.fn()
  describe("on receiving fetch action", () => {
    // Mock jQuery getJSON method.
    $.getJSON = jest.fn((url, cb) => {
      cb(courseData)
    })
    beforeEach(() => {
      CourseStore.addListener(COURSES_UPDATE_EVENT, eventReceiver)
      callback({ actionType: FETCH_ACTION })
    })

    afterEach(() => {
      CourseStore.removeListener(COURSES_UPDATE_EVENT, eventReceiver)
      eventReceiver.mockClear()
    })

    it("fetches the courses", () => {
      expect($.getJSON.mock.calls.length).toBe(1)
      expect(eventReceiver.mock.calls.length).toBe(1)
      expect(eventReceiver.mock.calls[0][0]).toBe(courseData.courses)
    })
  })

  describe("on receiving filter action", () => {
    beforeEach(() => {
      CourseStore.addListener(COURSES_UPDATE_EVENT, eventReceiver)
      callback({ actionType: FILTER_ACTION, text: "Philosophy" })
    })

    afterEach(() => {
      CourseStore.removeListener(COURSES_UPDATE_EVENT, eventReceiver)
      eventReceiver.mockClear()
    })

   it("filters the courses", () => {
      expect($.getJSON.mock.calls.length).toBe(1)
      expect(eventReceiver.mock.calls.length).toBe(1)
      let filterResult = eventReceiver.mock.calls[0][0]
      expect(filterResult.length).toBe(1)
      expect(filterResult[0].slug).toBe(courseData.courses[0].slug)
    })
  })
})
