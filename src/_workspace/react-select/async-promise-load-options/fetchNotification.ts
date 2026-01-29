import NotificationService from '@/_workspace/services/notification/NotificationService'
import { NotificationInterface } from '@/_workspace/types/notification/NotificationInterface'

const fetchNotification = (params: any) => {
  return new Promise<NotificationInterface[]>(resolve => {
    NotificationService.getNotification(params)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => {
        console.log(error)
        resolve([])
      })
  })
}

export { fetchNotification }
