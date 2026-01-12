import LeaveFileAPI from '@/_workspace/api/leave-file/LeaveFileAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import axios from 'axios'
export default class LeaveFileService {
  static uploadFile(formData: FormData) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveFileAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
  static uploadNewFile(formData: FormData) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveFileAPI.API_ROOT_URL}/createNew`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
  static downloadFile(params: { FILE_NAME: string; FILE_PATH: string }) {
    const baseURL = import.meta.env.VITE_APP_API_END_POINT_LEAVE
    return axios({
      url: `${baseURL}${LeaveFileAPI.API_ROOT_URL}/download`,
      method: 'POST',
      data: params ,
      responseType: 'blob'
    })
  }
  static deleteFile(params: object) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveFileAPI.API_ROOT_URL}/delete`,
      method: 'DELETE',
      data: params
    })
  }
  static searchFile(params: object) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveFileAPI.API_ROOT_URL}/getDownload`,
      method: 'GET',
      params: { data: JSON.stringify(params) }
    })
  }
}
