import CommonAPI from '@/_workspace/api/common/commonAPI'
import { default as axiosRequest, default as AxiosRequest } from '@/libs/axios/axiosRequest'
export default class CommonServices {
  static getByLikeMonthShortNameEnglish(property: any) {
    return AxiosRequest({
      url: `${CommonAPI.API_ROOT_URL}/GetByLikeMonthShortNameEnglish`,
      data: property,
      method: 'POST'
    })
  }
  static getImageFromUrl(URL: any) {
    return AxiosRequest({
      url: `${CommonAPI.API_ROOT_URL}/getImageFromUrl`,
      data: URL,
      method: 'POST',
      responseType: 'blob'
    })
  }
  static getImageArrayFromUrl(URL: any) {
    return axiosRequest({
      url: `${CommonAPI.API_ROOT_URL}/getImageArrayFromUrl`,
      data: URL,
      method: 'POST'
    })
  }
  static getImageEmployeeFromUrl(URL: any) {
    return AxiosRequest({
      url: `${CommonAPI.API_ROOT_URL}/getImageEmployeeFromUrl`,
      data: URL,
      method: 'POST',
      responseType: 'blob'
    })
  }
}
