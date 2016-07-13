import AppDispatcher from './AppDispatcher'
import EventEmitter from 'events'
import $ from 'jQuery'

// Private class to manage courses.
// FIXME might be worth extracting it out.
class Courses {
  constructor() {
    this.courses = null
    this.filterText = ''
  }

  fetch(callback) {
    $.getJSON('/data/courses.json', (data) => {
      // TODO Handle error
      this.courses = data.courses
      callback(data.courses)
    })
  }

  filter(text) {
    let filter = text.toLowerCase()
    // FIXME naive filter. make it more robust
    return this.courses.filter(function(item) {
      let name = item.name.toLowerCase()
      if (name.includes(filter)) {
        return true
      }
      return false
    })
  }
}

var courses = new Courses()

export const FILTER_EVENT = 'filter'
export const FETCH_EVENT = 'fetch'

export class CourseActions {
  static filter(filter) {
    AppDispatcher.dispatch({
      actionType: FILTER_EVENT,
      text: filter
    })
  }

  static fetch() {
    AppDispatcher.dispatch({
      actionType: FETCH_EVENT
    })
  }
}

class CourseStore extends EventEmitter {

  addEventListener(event, listener, context) {
    this.on(event, listener, context);
  }

  removeEventListener(event, listener, context) {
    this.removeListener(event, listener, context);
  }
}

const courseStore = new CourseStore()

AppDispatcher.register((action) => {
  switch(action.actionType) {
    case FILTER_EVENT:
      courseStore.emit(FILTER_EVENT, courses.filter(action.text.trim()))
      break

    case FETCH_EVENT:
      courses.fetch((courses) => {
      courseStore.emit(FETCH_EVENT, courses)
    })
      break

    default:
      // Shouldn’t get here.
  }
})

export default courseStore
