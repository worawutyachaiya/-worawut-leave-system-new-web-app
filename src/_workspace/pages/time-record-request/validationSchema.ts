import { z } from 'zod'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
const timeRecordRequestSchema = z.object({
  timeIn: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Time In' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Time In' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Time In' })),
  timeOut: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Time Out' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Time Out' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Time Out' })),
  dateIn: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Date In' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Date In' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Date In' })),
  dateOut: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Date Out' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Date Out' })
    })
    .min(1, requiredFieldMessage({ fieldName: 'Date Out' })),
  timeRecordType: z.object(
    {
      TIME_RECORD_TYPE_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Time Record Type' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Time Record Type' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Time Record Type' }) })
        .positive({ message: requiredFieldMessage({ fieldName: 'Time Record Type' }) }),
      TIME_RECORD_TYPE_DESCRIPTION: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Time Record Type' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Time Record Type' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Time Record Type' }))
    },
    {
      required_error: requiredFieldMessage({ fieldName: 'Time Record Type' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Time Record Type' })
    }
  ),
  reason: z.string().nullable().optional()
})
export const validationSchemaPage = z.object({
  searchFilters: timeRecordRequestSchema
})
export type FormDataPage = z.infer<typeof validationSchemaPage>
