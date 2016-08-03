import { CourseActions } from './CourseStore'

const POLLING_DURATION = 1000

export default class CopyProgressPoller {
  constructor(id) {
    this.id = id
  }

  startPolling() {
    this.keepPolling = true
    let poll = () => {
      setTimeout(() => {
        CourseActions.copyStatus(this.id)
        if (this.keepPolling) {
          poll()
        }
      }, POLLING_DURATION)
    }
    poll()
  }

  stopPolling() {
    this.keepPolling = false
  }
}
