import { z } from 'zod'
import dayjs from 'dayjs'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
const columns = [
  'mrt-row-actions',
  'EMPLOYEE_CODE',
  'EMPLOYEE_NAME',
  'SECTION',
  'START_WORK',
  'LEAVE_TYPE',
  'LEAVE_REMAIN',
] as const
const SectionSelectSchema = z.object({
  SECTION: z.string().optional(),
  DEPARTMENT: z.string().optional()
})
const RemainLeaveSearchSchema = z.object({
  employeeCode: z
    .object({
      EMPLOYEE_CODE: z.string()
    })
    .nullable()
    .optional(),
  EMPLOYEE_ID_REQUEST: z.string().optional(),
  employeeName: z.string().nullable().optional(),
  section: SectionSelectSchema.nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  department: z.any().nullable().optional(),
  leaveType: z.any().nullable().optional()
})
const SearchResultsSchema = z.object({
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
  searchFilters: RemainLeaveSearchSchema,
  searchResults: SearchResultsSchema
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
      const columnFilters =
        result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnFilters?.map(
          (item: any) => {
            if (['CREATE_DATE', 'UPDATE_DATE', 'LEAVE_REQUEST_DATE', 'START_WORK'].includes(item.id)) {
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
          employeeCode: savedData?.searchFilters?.employeeCode || null,
          employeeName: savedData?.searchFilters?.employeeName || null,
          section: savedData?.searchFilters?.section || null,
          startDate: savedData?.searchFilters?.startDate || null,
          endDate: savedData?.searchFilters?.endDate || null, 
          department: savedData?.searchFilters?.department || null,
          leaveType: savedData?.searchFilters?.leaveType || null
        },
        searchResults: {
          pageSize: savedData?.searchResults?.pageSize || 10,
          columnFilters: columnFilters || [],
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
          employeeName: null,
          section: null,
          startDate: dayjs().format('YYYY-MM-DD'),
          endDate: null,
          department: null,
          leaveType: null
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
