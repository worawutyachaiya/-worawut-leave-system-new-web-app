import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import HrSettingAPI from '@/_workspace/api/hr-setting/HrSettingAPI'
import type { SearchDocumentParams, DeleteDocumentParams } from '@/_workspace/types/hr-document/HrDocumentService'
export default class HrDocumentService {
  static searchDocument(params: SearchDocumentParams) {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/searchDocument`,
      method: 'POST',
      data: params
    })
  }
  static createDocument(formData: FormData) {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/createDocument`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
  static deleteDocument(params: DeleteDocumentParams) {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/deleteDocument`,
      method: 'POST',
      data: params
    })
  }
  static downloadDocument(fileName: string) {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/downloadDocument`,
      method: 'POST',
      data: { FILE_NAME: fileName },
      responseType: 'blob'
    })
  }
}
