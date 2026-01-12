import { z } from 'zod'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'

const m75FormSchema = z.object({
  employeeCode: z
    .array(
      z.object({
        EMPLOYEE_CODE: z.string(),
        FULL_NAME: z.string().optional()
      }).passthrough()
    )
    .min(1, requiredFieldMessage({ fieldName: 'Employee Code' })),
  leaveType: z
    .object(
      {
        LEAVE_TYPE_ID: z.number(),
        LEAVE_TYPE_DESCRIPTION_EN: z.string().optional(),
        LEAVE_TYPE_DESCRIPTION_TH: z.string().optional()
      },
      {
        required_error: requiredFieldMessage({ fieldName: 'Leave Type' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Leave Type' })
      }
    )
    .passthrough()
    .nullable()
    .refine(val => val !== null, { message: requiredFieldMessage({ fieldName: 'Leave Type' }) }),
  startDate: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Start Date' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Start Date' })
    })
    .nullable()
    .refine(val => val !== null && val.length > 0, { message: requiredFieldMessage({ fieldName: 'Start Date' }) }),
  endDate: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'End Date' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'End Date' })
    })
    .nullable()
    .refine(val => val !== null && val.length > 0, { message: requiredFieldMessage({ fieldName: 'End Date' }) }),
  leaveTime: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Time' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Time' })
    })
    .nullable()
    .refine(val => val !== null && val.length > 0, { message: requiredFieldMessage({ fieldName: 'Time' }) }),
  totalDayLeave: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Total Day Leave' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Total Day Leave' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Total Day Leave' })),
  reason: z.string().nullable().optional(),
  remark: z.string().nullable().optional()
})

export const validationSchemaPage = z.object({
  searchFilters: m75FormSchema
})

export type FormDataPage = z.infer<typeof validationSchemaPage>

export const defaultValues = {
  searchFilters: {
    employeeCode: [],
    leaveType: null as any,
    startDate: null as any,
    endDate: null as any,
    leaveTime: null as any,
    totalDayLeave: '0',
    reason: null,
    remark: null
  }
}


