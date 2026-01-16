import { z } from 'zod'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
const leaveRequestSchema = z.object({
  leaveType: z.object(
    {
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
    },
    {
      required_error: requiredFieldMessage({ fieldName: 'Leave Type' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Leave Type' })
    }
  ),
  startDate: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Start Date' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Start Date' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Start Date' })),
  endDate: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'End Date' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'End Date' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'End Date' })),
  timeLeave: z.object(
    {
      value: z.string(),
      label: z.string()
    },
    {
      required_error: requiredFieldMessage({ fieldName: 'Time Leave' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Time Leave' })
    }
  ),
  total: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Total Day Leave' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Total Day Leave' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Total Day Leave' })),
  reason: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
  fileUpload: z.any().nullable().optional(),
  tel: z.string().nullable().optional()
})
export const validationSchemaPage = z.object({
  searchFilters: leaveRequestSchema
})
export type FormDataPage = z.infer<typeof validationSchemaPage>
