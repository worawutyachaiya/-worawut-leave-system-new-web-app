import { z } from 'zod'
import dayjs from 'dayjs'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
const columns = [
  'mrt-row-actions',
  'FLEX_TIME_DESCRIPTION',
  'START_DATE',
  'END_DATE',
  'REQUEST_DATE',
  'STATUS',
  'APPROVER_NAME'
] as const
const leaveTypeSearchSchema = z.object({
  leaveTypeCode: z.string().nullable().optional(),
  leaveTypeDescription: z.string().nullable().optional(),
  status: z
    .object({
      value: z.string(),
      label: z.string()
    })
    .nullable()
    .optional()
})
export const validationSchemaPage = z.object({
  searchFilters: leaveTypeSearchSchema,
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
export const validationSchemaModal = z.object({
  LEAVE_TYPE_CODE: z.string().min(1, requiredFieldMessage({ fieldName: 'Leave Type Code' })),
  LEAVE_TYPE_DESCRIPTION_TH: z.string().min(1, requiredFieldMessage({ fieldName: 'Description (TH)' })),
  LEAVE_TYPE_DESCRIPTION_EN: z.string().min(1, requiredFieldMessage({ fieldName: 'Description (EN)' })),
  LEAVE_TYPE_MAX_DAY: z.number().min(0),
  LEAVE_TYPE_IS_REQUIRE_FILE: z.boolean(),
  LEAVE_TYPE_IS_ACTIVE: z.boolean(),
  LEAVE_TYPE_SORT_ORDER: z.number().optional()
})
export type FormDataModal = z.infer<typeof validationSchemaModal>
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
          leaveTypeCode: savedData?.searchFilters?.leaveTypeCode || null,
          leaveTypeDescription: savedData?.searchFilters?.leaveTypeDescription || null,
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
      resolve({
        searchFilters: {
          leaveTypeCode: null,
          leaveTypeDescription: null,
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
