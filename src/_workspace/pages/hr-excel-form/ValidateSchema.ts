import { z } from 'zod'

// Validation schema for Excel row data
export const ExcelRowSchema = z.object({
    'รหัสพนักงาน': z.union([z.string(), z.number()]).transform(val => String(val)),
    'ประเภทการลา': z.string().min(1, 'ประเภทการลาจำเป็นต้องระบุ'),
    'วันที่เริ่มต้น (ex.15/01/2000)': z.union([z.string(), z.number()]),
    'วันที่สิ้นสุด (ex.15/01/2000)': z.union([z.string(), z.number()]),
    'เวลา': z.string().min(1, 'เวลาจำเป็นต้องระบุ'),
    'เหตุผล': z.string().optional(),
    'หมายเหตุ': z.string().optional(),
})

export const ExcelDataSchema = z.array(ExcelRowSchema).min(1, 'ต้องมีข้อมูลอย่างน้อย 1 แถว')

export type ExcelRowType = z.infer<typeof ExcelRowSchema>

// Validation function
export const validateExcelData = (data: any[]) => {
    const result = ExcelDataSchema.safeParse(data)
    if (!result.success) {
        return {
            success: false,
            errors: result.error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }))
        }
    }
    return { success: true, data: result.data }
}
