import NotificationAPI from '@/_workspace/api/notification/NotificationAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'

export default class NotificationService {
  static getNotification(dataItem: object) {
    return axiosRequest_LeaveSystem({
      url: `${NotificationAPI.API_ROOT_URL}/getNotification`,
      method: 'POST',
      data: dataItem
    })
  }
}
