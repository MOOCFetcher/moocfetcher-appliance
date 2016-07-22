import AppDispatcher from './AppDispatcher'
import EventEmitter from 'events'
import $ from 'jQuery'

export const COURSES_UPDATE_EVENT = 'update'
export const COURSE_SELECT_EVENT = 'select'
export const COURSE_UNSELECT_EVENT = 'unselect'

// Exported for testing only
export const FILTER_ACTION = 'filter'
export const FETCH_ACTION  = 'fetch'
export const SELECT_ACTION  = 'select'
export const UNSELECT_ACTION  = 'unselect'

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

  static select(course) {
    AppDispatcher.dispatch({
      actionType: SELECT_ACTION,
      course: course
    })
  }

  static unselect(course) {
    AppDispatcher.dispatch({
      actionType: UNSELECT_ACTION,
      course: course
    })
  }
}

let courses = null
let filterText = null
let selectedCourses = []

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

function select(course) {
  if (selectedCourses.includes( c => c.slug == course.slug)) {
    return
  }

  selectedCourses.push(course)
}

function unselect(course) {
  let idx = selectedCourses.findIndex( (c) => c.slug == course.slug)
  if (idx != -1) {
    selectedCourses.splice(idx, 1)
  }
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

  getSelected() {
    return selectedCourses
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

    case SELECT_ACTION:
      select(action.course)
      courseStore.emit(COURSE_SELECT_EVENT, action.course)
      break

    case UNSELECT_ACTION:
      unselect(action.course)
      courseStore.emit(COURSE_UNSELECT_EVENT, action.course)
      break

    default:
      // Shouldn’t get here.
  }
})

export default courseStore
