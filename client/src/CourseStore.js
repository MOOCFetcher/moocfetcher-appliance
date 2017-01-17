import $ from 'jQuery'
import AppDispatcher from './AppDispatcher'
import CopyProgressPoller from './CopyProgressPoller'
import EventEmitter from 'events'

export const COURSES_UPDATE_EVENT = 'update'
export const COURSE_SELECT_EVENT = 'select'
export const COURSE_UNSELECT_EVENT = 'unselect'
export const COPY_REQUESTED_EVENT = 'copyrequested'
export const COPY_PROGRESS_EVENT = 'copyprogress'
export const COPY_FINISH_EVENT = 'copyfinish'
export const COPY_ERROR_EVENT = 'copyerror'
export const COPY_CANCELLED_EVENT = 'copycancelled'

// Exported for testing only
export const FILTER_ACTION = 'filter'
export const FETCH_ACTION = 'fetch'
export const SELECT_ACTION = 'select'
export const UNSELECT_ACTION = 'unselect'
export const COPY_ACTION = 'copy'
export const COPY_STATUS_ACTION = 'copystatus'
export const COPY_CANCEL_ACTION = 'cancel'

export class CourseActions {
  static filter (filterTxt) {
    AppDispatcher.dispatch({
      actionType: FILTER_ACTION,
      text: filterTxt
    })
  }

  static fetch () {
    AppDispatcher.dispatch({actionType: FETCH_ACTION})
  }

  static select (course) {
    AppDispatcher.dispatch({
      actionType: SELECT_ACTION,
      course
    })
  }

  static unselect (course) {
    AppDispatcher.dispatch({
      actionType: UNSELECT_ACTION,
      course
    })
  }

  static copy (courses) {
    AppDispatcher.dispatch({
      actionType: COPY_ACTION,
      courses
    })
  }

  static copyStatus (id) {
    AppDispatcher.dispatch({
      actionType: COPY_STATUS_ACTION,
      id
    })
  }

  static copyCancel () {
    AppDispatcher.dispatch({actionType: COPY_CANCEL_ACTION})
  }
}

let courses = null
let filterText = null
let progressPoller = null

const fetch = function (callback) {
  $.getJSON('/data/courses.json', (data) => {
    // TODO Handle error
    courses = data.courses
    callback(data.courses)
  })
}

const copy = function (selectedCourses, callback) {
  if (progressPoller) {
    throw new Error('Copying already in progress')
  }
  $.ajax({
    type: 'POST',
    url: `${API_ROOT}/api/copy`,
    data: JSON.stringify({courses: selectedCourses}),
    dataType: 'json',
    contentType: 'application/json',
    success: (data) => {
      const id = data.id

      progressPoller = new CopyProgressPoller(id)
      progressPoller.startPolling()
      callback()
    },
    error: (resp) => {
      const error = resp.responseJSON

      callback(error)
    }
  })
}

const copyStatus = function (id, callback) {
  $.getJSON(`${API_ROOT}/api/copy-status/${id}`, (data) => {
    callback(data)
  })
}

const copyCancel = function () {
  if (!progressPoller) {
    // Nothing to do
    return
  }

  const id = progressPoller.id

  $.ajax({
    type: 'PUT',
    url: `${API_ROOT}/api/copy/${id}`
  })
}

const filter = function (text) {
  const filterTxt = text.toLowerCase()

  // FIXME naive filter. make it more robust
  return courses.filter((item) => {
    const name = item.name.toLowerCase()

    if (name.includes(filterTxt)) {
      return true
    }

    return false
  })
}

const selected = function () {
  return courses.filter((c) => c.selected)
}

const select = function (course) {
  course.selected = true
}

const unselect = function (course) {
  course.selected = false
}

class CourseStore extends EventEmitter {
  getCourses () {
    if (filterText) {
      return filter(filterText)
    }

    return courses
  }

  getFilterText () {
    return filterText
  }

  getSelected () {
    return selected()
  }
}

const courseStore = new CourseStore()

AppDispatcher.register((action) => {
  switch (action.actionType) {
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
      copy(action.courses, (err) => {
        if (err) {
          courseStore.emit(COPY_ERROR_EVENT, err)
        } else {
          courseStore.emit(COPY_PROGRESS_EVENT)
        }
      })
      break

    case COPY_STATUS_ACTION:
      copyStatus(action.id, (response) => {
        if (response.status === 'finished' ||
        response.status === 'error' ||
        response.status === 'cancelled') {
        // If progressPoller is already null, nothing needs to be done
          if (progressPoller) {
            progressPoller.stopPolling()
            progressPoller = null
          }
        }

        switch (response.status) {
          case 'finished':
            let selected = courseStore.getSelected()
            for (let course of selected) {
              CourseActions.unselect(course)
            }
            courseStore.emit(COPY_FINISH_EVENT)
            break
          case 'error':
            courseStore.emit(COPY_ERROR_EVENT, response, response)
            break
          case 'cancelled':
            courseStore.emit(COPY_CANCELLED_EVENT, response)
            break
          default:
            courseStore.emit(COPY_PROGRESS_EVENT, response)
        }
      })

      break

    case COPY_CANCEL_ACTION:
      copyCancel()
      break
    default:
      // Shouldn’t get here.
  }
})

export default courseStore
