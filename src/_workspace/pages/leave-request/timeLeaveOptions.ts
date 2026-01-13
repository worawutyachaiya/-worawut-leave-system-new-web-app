// Time Leave Options for Leave Request Form

export interface TimeLeaveOption {
  value: string
  label: string
}

// เวลาลาสำหรับวันเดียว (ปกติ)
export const oneDayTimeLeaveArr: TimeLeaveOption[] = [
  { value: '08.30-12.30', label: '08.30 น. - 12.30 น. (0.5 วัน)' },
  { value: '12.30-17.30', label: '12.30 น. - 17.30 น. (0.5 วัน)' },
  { value: '08.30-17.30', label: '08.30 น. - 17.30 น. (1 วัน)' },
  { value: '20.30-00.30', label: '20.30 น. - 00.30 น. (0.5 วัน)' },
  { value: '00.30-05.30', label: '00.30 น. - 05.30 น. (0.5 วัน)' },
  { value: '20.30-05.30', label: '20.30 น. - 05.30 น. (1 วัน)' }
]

// เวลาลาสำหรับหลายวัน
export const multipleDayTimeLeaveArr: TimeLeaveOption[] = [
  { value: '08.30-17.30', label: '08.30 น. - 17.30 น. (1 วัน)' },
  { value: '20.30-05.30', label: '20.30 น. - 05.30 น. (1 วัน)' }
]

// เวลาลาสำหรับ Flex Time แบบเช้า (07.30-16.30)
export const oneDayTimeLeaveArrWithFlexTimeTypeFaster: TimeLeaveOption[] = [
  { value: '07.30-11.30', label: '07.30 น. - 11.30 น. (0.5 วัน)' },
  { value: '11.30-16.30', label: '11.30 น. - 16.30 น. (0.5 วัน)' },
  { value: '08.30-17.30', label: '08.30 น. - 17.30 น. (1 วัน)' }
]

// เวลาลาสำหรับ Flex Time แบบสาย (09.30-18.30)
export const oneDayTimeLeaveArrWithFlexTimeTypeSlower: TimeLeaveOption[] = [
  { value: '09.30-13.30', label: '09.30 น. - 13.30 น. (0.5 วัน)' },
  { value: '13.30-18.30', label: '13.30 น. - 18.30 น. (0.5 วัน)' },
  { value: '08.30-17.30', label: '08.30 น. - 17.30 น. (1 วัน)' }
]

// เวลาลาสำหรับ M2L (Leave Type ID: 6)
export const timeLeaveArrM2L: TimeLeaveOption[] = [{ value: '08.30-17.30', label: '08.30 น. - 17.30 น. (1 วัน)' }]

// เวลาลาสำหรับ WFH (Leave Type ID: 11)
export const timeLeaveArrWFH: TimeLeaveOption[] = [{ value: '08.30-17.30', label: '08.30 น. - 17.30 น. (1 วัน)' }]
