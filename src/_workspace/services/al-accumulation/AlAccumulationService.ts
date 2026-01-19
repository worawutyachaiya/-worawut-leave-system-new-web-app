import AlAccumulationAPI from '@/_workspace/api/al-accumulation/AlAccumulationAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'

export default class AlAccumulationService {
  static getAlAccumulationAll() {
    return axiosRequest_LeaveSystem({
      url: `${AlAccumulationAPI.API_ROOT_URL}/all`,
      data: {},
      method: 'POST'
    })
  }
}
