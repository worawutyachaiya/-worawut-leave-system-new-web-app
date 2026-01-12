import axios from 'axios'

const axiosInstance = (() => {
  return axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    //timeout: 120000, // ตั้งค่า timeout ที่ 120 วินาที (2 นาที)
    headers: {
      'Content-Type': 'application/json'
    }
  })
})()

async function AxiosRequest(options: any) {
  const onSuccess = function (response: any) {
    return response
  }

  const onError = function (error: any) {
    return Promise.reject(error)
  }

  return axiosInstance(options).then(onSuccess).catch(onError)
}

export default AxiosRequest
