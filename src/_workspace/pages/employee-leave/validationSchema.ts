import { z } from 'zod'
import dayjs from 'dayjs'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
const columns = [
  'mrt-row-actions',
  'LEAVE_REQUEST_START_DATE',
  'EMPLOYEE_CODE',
  'FULL_NAME',
  'EMPLOYEE_SECTION',
  'EMPLOYEE_DEPT',
  'LEAVE_TYPE_DESCRIPTION_EN',
  'LEAVE_REQUEST_TIME'
] as const
const EmployeeLeave = z.object({
  leaveType: z
    .object({
      LEAVE_TYPE_ID: z.number(), 
      LEAVE_TYPE_DESCRIPTION_EN: z.string(),
      LEAVE_TYPE_DESCRIPTION_TH: z.string()
    })
    .nullable() 
    .optional(), 
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeLeave: z
    .object({
      value: z.string(),
      label: z.string()
    })
    .nullable()
    .optional(),
  total: z.string().optional(),
  employeeCode: z.object({
    EMPLOYEE_CODE: z.string().optional(),
    EMPLOYEE_NAME: z.string().optional(),
    FULL_NAME: z.string().optional(),
    DEPARTMENT: z.string().optional(),
    SECTION: z.string().optional()
  }).nullable().optional(),
  employeeName: z.object({
    EMPLOYEE_CODE: z.string().optional(),
    EMPLOYEE_NAME: z.string().optional(),
    FULL_NAME: z.string().optional(),
    DEPARTMENT: z.string().optional(),
    SECTION: z.string().optional()
  }).nullable().optional(),
  department: z.object({
    EMPLOYEE_CODE: z.string().optional(),
    EMPLOYEE_NAME: z.string().optional(),
    FULL_NAME: z.string().optional(),
    DEPARTMENT: z.string().optional(),
    SECTION: z.string().optional()
  }).nullable().optional(),
  section: z.object({
    EMPLOYEE_CODE: z.string().optional(),
    EMPLOYEE_NAME: z.string().optional(),
    FULL_NAME: z.string().optional(),
    DEPARTMENT: z.string().optional(),
    SECTION: z.string().optional()
  }).nullable().optional(),
  reason: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
  fileUpload: z.any().nullable().optional(),
  tel: z.string().nullable().optional()
})
export const validationSchemaPage = z.object({
  searchFilters: EmployeeLeave,
  searchResults: z.object({
    pageSize: z.number().min(10, requiredFieldMessage({ fieldName: 'Page Size' })),
    columnFilters: z.any(),
    sorting: z.array(z.object({ id: z.string(), desc: z.boolean() })),
    density: z.enum(['comfortable', 'compact', 'spacious']),
    columnVisibility: z.record(z.string(), z.boolean()),
    columnPinning: z.object({
      left: z.array(z.string()).optional(),
      right: z.array(z.string()).optional()
    }),
    columnOrder: z.array(z.string()),
    columnFilterFns: z.any()
  })
})
export type FormDataPage = z.infer<typeof validationSchemaPage>
export interface StatusOption {
  value: string
  label: string
}
const getUrlParamSearch = ({ USER_ID, APPLICATION_ID, MENU_ID }: UserProfileSettingProgramI): string => {
  let params = ``
  params += `"USER_ID":"${USER_ID}"`
  params += `, "APPLICATION_ID":"${APPLICATION_ID}"`
  params += `, "MENU_ID":"${MENU_ID}"`
  params = `{${params}}`
  return params
}
const paramForSearch = (MENU_ID: number): UserProfileSettingProgramI => ({
  USER_ID: Number(getUserData().USER_ID),
  APPLICATION_ID: Number(import.meta.env.VITE_APPLICATION_ID),
  MENU_ID: MENU_ID
})
export const fetchDefaultValues = async (MENU_ID: number): Promise<FormDataPage> => {
  return new Promise(async resolve => {
    try {
      const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
        AxiosResponseI<UserProfileSettingProgramI<FormDataPage>>
      >(getUrlParamSearch(paramForSearch(MENU_ID)))
      const columnFilters =
        result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnFilters?.map(
          (item: any) => {
            if (['START_DATE', 'END_DATE', 'REQUEST_DATE'].includes(item.id)) {
              const value = (item?.value as string) || ''
              return {
                id: item.id,
                value: dayjs(value).isValid() ? dayjs(value) : null
              }
            } else {
              return item
            }
          }
        )
      const savedData = result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA
      resolve({
        searchFilters: {
          leaveType: savedData?.searchFilters?.leaveType || null,
          timeLeave: savedData?.searchFilters?.timeLeave || null,
          total: savedData?.searchFilters?.total || '',
          employeeCode: savedData?.searchFilters?.employeeCode || null,
          employeeName: savedData?.searchFilters?.employeeName || null,
          department: savedData?.searchFilters?.department || null,
          section: savedData?.searchFilters?.section || null,
        },
        searchResults: {
          pageSize: savedData?.searchResults?.pageSize || 10,
          columnFilters: columnFilters || [],
          sorting: savedData?.searchResults?.sorting || [],
          density: savedData?.searchResults?.density || 'comfortable',
          columnVisibility: savedData?.searchResults?.columnVisibility || {},
          columnPinning: savedData?.searchResults?.columnPinning || {},
          columnOrder: savedData?.searchResults?.columnOrder || [...columns],
          columnFilterFns: savedData?.searchResults?.columnFilterFns || {}
        }
      })
    } catch (error) {
      resolve({
        searchFilters: {
          leaveType: null,
          timeLeave: null,
          total: '',
          employeeCode: null,
          employeeName: null,
          department: null,
          section: null,
        },
        searchResults: {
          pageSize: 10,
          columnFilters: [],
          sorting: [],
          density: 'comfortable',
          columnVisibility: {},
          columnPinning: {},
          columnOrder: [...columns],
          columnFilterFns: {}
        }
      })
    }
  })
}
