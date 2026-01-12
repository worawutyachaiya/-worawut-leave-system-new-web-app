import { z } from 'zod'
import dayjs from 'dayjs'

import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Column Names for Table
const columns = [
  'mrt-row-select',
  'STATUS',
  'APPROVAL',
  'LEAVE_ATTACHMENT',
  'EMPLOYEE_CODE',
  'EMPLOYEE_NAME',
  'SECTION_NAME',
  'LEAVE_TYPE_DESCRIPTION_TH',
  'REQUEST_LEAVE_DATE',
  'LEAVE_DATE',
  'LEAVE_TIME',
  'TOTAL_DAY_LEAVE',
  'REASON',
  'UPDATE_DATE',
  'UPDATE_BY'
] as const

//Status option

// Status Option for select
export interface StatusOption {
  value: string
  label: string
}

export const statusOption = [
  { value: '', label: 'ทั้งหมด / All' },
  { value: 'checked', label: 'เช็คแล้ว / Checked' },
  { value: 'notCheck', label: 'ยังไม่เช็ค / Not Check' }
]
// M75 Search Schema
const m75SearchSchema = z.object({
  employeeCode: z
    .object({
      EMPLOYEE_CODE: z.string().optional(),
      EMPLOYEE_NAME: z.string().optional(),
      FULL_NAME: z.string().optional(),
      DEPARTMENT: z.string().optional(),
      SECTION: z.string().optional()
    })
    .nullable()
    .optional(),

  leaveType: z
    .array(
      z.object({
        LEAVE_TYPE_ID: z.number(),
        LEAVE_TYPE_DESCRIPTION_TH: z.string(),
        LEAVE_TYPE_DESCRIPTION_EN: z.string().optional()
      })
    )
    .nullable()
    .optional(),

  startDate: z.string().nullable().optional(),

  endDate: z.string().nullable().optional(),

  status: z
    .object({
      value: z.string(),
      label: z.string()
    })
    .nullable()
    .optional()
})

// Page Schema
export const validationSchemaPage = z.object({
  searchFilters: m75SearchSchema,
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

// Leave Type Option for select
export interface LeaveTypeOption {
  LEAVE_TYPE_ID: number
  LEAVE_TYPE_DESCRIPTION_TH: string
  LEAVE_TYPE_DESCRIPTION_EN?: string
}

// Employee Code Option for select
export interface EmployeeCodeOption {
  EMPLOYEE_CODE?: string
}
// Leave
// Helper functions for UserProfileSettingProgram
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

// Default Values Fetcher
export const fetchDefaultValues = async (MENU_ID: number): Promise<FormDataPage> => {
  return new Promise(async resolve => {
    try {
      const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
        AxiosResponseI<UserProfileSettingProgramI<FormDataPage>>
      >(getUrlParamSearch(paramForSearch(MENU_ID)))

      // Map Date Format สำหรับ Column Filters
      const columnFilters =
        result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnFilters?.map(
          (item: any) => {
            if (['REQUEST_LEAVE_DATE', 'LEAVE_DATE', 'UPDATE_DATE'].includes(item.id)) {
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

      // Get saved data from DB
      const savedData = result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA

      resolve({
        searchFilters: {
          employeeCode: savedData?.searchFilters?.employeeCode || null,
          leaveType: savedData?.searchFilters?.leaveType || null,
          startDate: savedData?.searchFilters?.startDate || null,
          endDate: savedData?.searchFilters?.endDate || null,
          status: savedData?.searchFilters?.status || null
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
      // Return default values on error
      resolve({
        searchFilters: {
          employeeCode: null,
          leaveType: null,
          startDate: null,
          endDate: null,
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


