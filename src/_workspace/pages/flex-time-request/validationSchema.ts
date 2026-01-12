import { z } from 'zod'
import type { FlexTimeType } from '@/_workspace/types/flex-time/FlexTimeInterface'
export type FlexTimeTypeOption = FlexTimeType
const flexTimeFormSchema = z.object({
  flexTimeType: z
    .object({
      FLEX_TIME_TYPE_ID: z.number(),
      FLEX_TIME_DESCRIPTION: z.string()
    })
    .nullable()
    .refine(val => val !== null, { message: 'Please select flex time type' }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().optional()
})
export const validationSchemaPage = z.object({
  formData: flexTimeFormSchema
})
export type FormDataPage = z.infer<typeof validationSchemaPage>
