import AppDispatcher from './AppDispatcher'
import EventEmitter from 'events'
import $ from 'jQuery'

export const COURSES_UPDATE_EVENT = 'update'

// Exported for testing only
export const FILTER_ACTION = 'filter'
export const FETCH_ACTION  = 'fetch'

export class CourseActions {
  static filter(filter) {
    AppDispatcher.dispatch({
      actionType: FILTER_ACTION,
      text: filter
    })
  }

  static fetch() {
    AppDispatcher.dispatch({
      actionType: FETCH_ACTION
    })
  }
}

let courses = null
let filterText = null

function fetch(callback) {
  $.getJSON('/data/courses.json', (data) => {
    // TODO Handle error
    courses = data.courses
    callback(data.courses)
  })
}

function filter(text) {
  let filter = text.toLowerCase()
  // FIXME naive filter. make it more robust
  return courses.filter(function(item) {
    let name = item.name.toLowerCase()
    if (name.includes(filter)) {
      return true
    }
    return false
  })
}

class CourseStore extends EventEmitter {
  getCourses() {
    if (filterText) {
      return filter(filterText)
    }
    return courses
  }

  getFilterText() {
    return filterText
  }
}

const courseStore = new CourseStore()

AppDispatcher.register((action) => {
  switch(action.actionType) {
    case FILTER_ACTION:
      filterText = action.text.trim()
      courseStore.emit(COURSES_UPDATE_EVENT, courseStore.getCourses())
      break

    case FETCH_ACTION:
      fetch(() => courseStore.emit(COURSES_UPDATE_EVENT, courseStore.getCourses()))
      break

    default:
      // Shouldn’t get here.
  }
})

export default courseStore
