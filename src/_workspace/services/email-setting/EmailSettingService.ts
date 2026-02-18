import EmailSettingAPI from '@/_workspace/api/email-setting/EmailSettingAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'

export default class EmailSettingService {
  static get(dataItem: Record<string, any>) {
    return axiosRequest_LeaveSystem({
      url: `${EmailSettingAPI.API_ROOT_URL}/getEmailSetting`,
      method: 'POST',
      data: dataItem
    })
  }

  static upsert(dataItem: Record<string, any>) {
    return axiosRequest_LeaveSystem({
      url: `${EmailSettingAPI.API_ROOT_URL}/upsertEmailSetting`,
      method: 'POST',
      data: dataItem
    })
  }
}
