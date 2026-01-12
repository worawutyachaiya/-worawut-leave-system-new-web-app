import { z } from 'zod'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
const columns = [
  'mrt-row-actions',
  'EMPLOYEE_CODE',
  'EMPLOYEE_NAME',
  'EMPLOYEE_SECTION',
  'LEAVE_TYPE_DESCRIPTION_TH',
  'LEAVE_REQUEST_START_DATE',
  'LEAVE_REQUEST_TOTAL_DAY',
  'LEAVE_REQUEST_FILE_UPLOAD_PATH',
  'CREATE_DATE'
] as const
const searchFiltersSchema = z.object({
  employeeCode: z.any().nullable(),
  employeeInfo: z
    .object({
      EMPLOYEE_ID: z.string(),
      EMPLOYEE_NAME: z.string(),
      EMPLOYEE_SURNAME: z.string(),
      EMPLOYEE_DEPT: z.string(),
      EMPLOYEE_SECTION: z.string()
    })
    .nullable(),
  tableEmployeeCode: z.string().optional(),
  tableEmployeeName: z.string().optional(),
  tableSection: z.any().nullable()
})
const searchResultsSchema = z.object({
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
export const validationSchemaPage = z.object({
  searchFilters: searchFiltersSchema,
  searchResults: searchResultsSchema
})
export type FormDataPage = z.infer<typeof validationSchemaPage>
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
      const savedData = result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA
      resolve({
        searchFilters: {
          employeeCode: savedData?.searchFilters?.employeeCode || null,
          employeeInfo: savedData?.searchFilters?.employeeInfo || null,
          tableEmployeeCode: savedData?.searchFilters?.tableEmployeeCode || '',
          tableEmployeeName: savedData?.searchFilters?.tableEmployeeName || '',
          tableSection: savedData?.searchFilters?.tableSection || null
        },
        searchResults: {
          pageSize: savedData?.searchResults?.pageSize || 10,
          columnFilters: savedData?.searchResults?.columnFilters || [],
          sorting: savedData?.searchResults?.sorting || [],
          density: savedData?.searchResults?.density || 'comfortable',
          columnVisibility: savedData?.searchResults?.columnVisibility || {},
          columnPinning: savedData?.searchResults?.columnPinning || { left: [], right: [] },
          columnOrder: savedData?.searchResults?.columnOrder || Array.from(columns),
          columnFilterFns: savedData?.searchResults?.columnFilterFns || {}
        }
      })
    } catch (error) {
      resolve({
        searchFilters: {
          employeeCode: null,
          employeeInfo: null,
          tableEmployeeCode: '',
          tableEmployeeName: '',
          tableSection: null
        },
        searchResults: {
          pageSize: 10,
          columnFilters: [],
          sorting: [],
          density: 'comfortable',
          columnVisibility: {},
          columnPinning: { left: [], right: [] },
          columnOrder: Array.from(columns),
          columnFilterFns: {}
        }
      })
    }
  })
}
