import LeaveDocumentAPI from '@/_workspace/api/leave-document/LeaveDocumentAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import axios from 'axios'
import type { LeaveDocumentDownloadParams, LeaveDocumentTabPaneParams } from '@/_workspace/types/leave-document/LeaveDocumentInterface'
import { data } from 'react-router'
export default class LeaveDocumentService {
  static getAll() {
    return axiosRequest_LeaveSystem({
      url: `${LeaveDocumentAPI.API_ROOT_URL}/getAll`,
      method: 'POST'
    })
  }
  static getByTabPane(params: LeaveDocumentTabPaneParams) {
    const baseURL = import.meta.env.VITE_APP_API_END_POINT_LEAVE
    return axios({
      url: `${baseURL}${LeaveDocumentAPI.API_ROOT_URL}/getByTabPane`,
      method: 'POST',
      data: params,
      responseType: 'blob'
    })
  }
  static downloadRegularity(params: LeaveDocumentDownloadParams) {
    const baseURL = import.meta.env.VITE_APP_API_END_POINT_LEAVE
    return axios({
      url: `${baseURL}${LeaveDocumentAPI.API_ROOT_URL}/getRegularity`,
      method: 'POST',
      data: params,
      responseType: 'blob'
    })
  }
}
