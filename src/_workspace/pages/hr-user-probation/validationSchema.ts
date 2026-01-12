import { z } from 'zod'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
const columns = [
  'PASS_PRD',
  'START_WORK',
  'PASS_PRD_DATE',
  'EMPLOYEE_ID',
  'FIRST_NAME',
  'SURNAME',
  'SECTION'
] as const
const UserProbationSearch = z.object({
  employeeCode: z
    .object({
      EMPLOYEE_CODE: z.string()
    })
    .nullable()
    .optional(),
  employeeName: z.string().optional(),
  section: z
    .object({
      SECTION: z.string()
    })
    .nullable()
    .optional(),
  status: z
    .object({
      value: z.number(),
      label: z.string()
    })
    .nullable()
    .optional()
})
export const validationSchemaPage = z.object({
  searchFilters: UserProbationSearch,
  submittedFilters: UserProbationSearch,
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
export const statusOptions = [
  { value: 0, label: 'No / ไม่ผ่าน' },
  { value: 1, label: 'Yes / ผ่าน' }
]
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
          employeeName: savedData?.searchFilters?.employeeName || '',
          section: savedData?.searchFilters?.section || null,
          status: savedData?.searchFilters?.status || null
        },
        submittedFilters: {
          employeeCode: savedData?.searchFilters?.employeeCode || null,
          employeeName: savedData?.searchFilters?.employeeName || '',
          section: savedData?.searchFilters?.section || null,
          status: savedData?.searchFilters?.status || null
        },
        searchResults: {
          pageSize: savedData?.searchResults?.pageSize || 10,
          columnFilters: savedData?.searchResults?.columnFilters || [],
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
          employeeCode: null,
          employeeName: '',
          section: null,
          status: null
        },
        submittedFilters: {
          employeeCode: null,
          employeeName: '',
          section: null,
          status: null
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
