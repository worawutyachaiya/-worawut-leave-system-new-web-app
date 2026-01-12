import { z } from 'zod'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
const requestLeaveFormHrSchema = z.object({
  EMPLOYEE_CODE: z
    .object({
      EMPLOYEE_CODE: z.string({
        required_error: requiredFieldMessage({ fieldName: 'Employee Code' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Employee Code' })
      }),
      FULL_NAME: z.string({
        required_error: requiredFieldMessage({ fieldName: 'Employee Code' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Employee Code' })
      })
    }, {
      required_error: requiredFieldMessage({ fieldName: 'Employee Code' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Employee Code' })
    })
    .passthrough()
    .nullable(),
  LEAVE_TYPE: z
    .object({
      LEAVE_TYPE_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Leave Type' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Leave Type' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Leave Type' }) })
        .positive({ message: requiredFieldMessage({ fieldName: 'Leave Type' }) }),
      LEAVE_TYPE_DESCRIPTION_EN: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Leave Type' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Leave Type' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Leave Type' })),
      LEAVE_TYPE_DESCRIPTION_TH: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Leave Type' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Leave Type' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Leave Type' }))
    }, {
      required_error: requiredFieldMessage({ fieldName: 'Leave Type' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Leave Type' })
    })
    .nullable(),
  START_DATE: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Start Date' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Start Date' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Start Date' })),
  END_DATE: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'End Date' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'End Date' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'End Date' })),
  LEAVE_TIME: z
    .object({
      value: z.string(),
      label: z.string()
    }, {
      required_error: requiredFieldMessage({ fieldName: 'Time Leave' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Time Leave' })
    })
    .nullable(),
  TOTAL_DAY_LEAVE: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Total Day Leave' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Total Day Leave' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Total Day Leave' })),
  REASON: z.string().nullable().optional(),
  REMARK: z.string().nullable().optional(),
  FILE_UPLOAD: z.any().nullable().optional(),
  LEAVE_REQUEST_EMPLOYEE_TELEPHONE: z.string().nullable().optional()
})
export const validationSchemaPage = z.object({
  requestLeaveForm: requestLeaveFormHrSchema
})
export type FormDataPage = z.infer<typeof validationSchemaPage>
export const defaultValues: FormDataPage = {
  requestLeaveForm: {
    EMPLOYEE_CODE: null,
    LEAVE_TYPE: null,
    START_DATE: '',
    END_DATE: '',
    LEAVE_TIME: null,
    TOTAL_DAY_LEAVE: '0',
    REASON: '',
    REMARK: '',
    FILE_UPLOAD: null,
    LEAVE_REQUEST_EMPLOYEE_TELEPHONE: ''
  }
}
