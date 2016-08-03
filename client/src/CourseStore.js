import AppDispatcher from './AppDispatcher'
import EventEmitter from 'events'
import $ from 'jQuery'

export const COURSES_UPDATE_EVENT = 'update'
export const COURSE_SELECT_EVENT = 'select'
export const COURSE_UNSELECT_EVENT = 'unselect'
export const COPY_REQUESTED_EVENT = 'copyrequested'
export const COPY_PROGRESS_EVENT = 'copyprogress'

// Exported for testing only
export const FILTER_ACTION = 'filter'
export const FETCH_ACTION  = 'fetch'
export const SELECT_ACTION  = 'select'
export const UNSELECT_ACTION  = 'unselect'
export const COPY_ACTION = 'copy'

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

  static copy(courses) {
    AppDispatcher.dispatch({
      actionType: COPY_ACTION,
      courses
    })
  }
}

let courses = null
let filterText = null
let progressPoller = null

function fetch(callback) {
  $.getJSON('/data/courses.json', (data) => {
    // TODO Handle error
    courses = data.courses
    callback(data.courses)
  })
}

function copy(selectedCourses, callback) {
  if (progressPoller) {
    throw new Error("Copying already in progress")
  }
  $.ajax({
    type: 'POST',
    url: `${API_ROOT}/api/copy`,
    data: JSON.stringify({courses: selectedCourses}),
    dataType: "json",
    contentType: "application/json",
    success: () => {
    // TODO start polling for progress
    //$.getJSON(`${API_ROOT}/copy-status/${data.id}`, (progress) => callback(progress))
    callback()
    }})
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

function selected() {
  return courses.filter( (c) => c.selected)
}

function select(course) {
  course.selected = true
}

function unselect(course) {
  course.selected = false
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
    return selected()
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

    case COPY_ACTION:
      courseStore.emit(COPY_REQUESTED_EVENT)
      copy(action.courses, () => courseStore.emit(COPY_PROGRESS_EVENT))
      break
    default:
      // Shouldn’t get here.
  }
})

export default courseStore
