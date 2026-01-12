import { useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Box
} from '@mui/material'
import { utils, writeFile } from 'xlsx'
import dayjs from 'dayjs'
import { useFormContext } from 'react-hook-form'
import type { FormDataPage } from '../ValidationSchema'
import { useSearchHrCheckerExport } from '@/_workspace/react-query/hooks/useSearchHrChecker'
import type { HrCheckerM75ResponseData } from '@/_workspace/types/hr-checker-m75/HrCheckerM75Interface'

interface HrCheckM75ExportModalProps {
    open: boolean
    onClose: () => void
}

const HrCheckM75ExportModal = ({ open, onClose }: HrCheckM75ExportModalProps) => {
    const { t } = useTranslation()
    const { getValues } = useFormContext<FormDataPage>()
    const [fileName, setFileName] = useState('')
    const [fileFormat, setFileFormat] = useState<'xlsx' | 'csv' | 'txt'>('xlsx')

    // Build params for export (no pagination)
    const params = {
        EMPLOYEE_CODE: getValues('searchFilters.employeeCode')?.EMPLOYEE_CODE || '',
        LEAVE_TYPE: getValues('searchFilters.leaveType')?.map((item) => item.LEAVE_TYPE_ID) || [],
        START_DATE: getValues('searchFilters.startDate') || dayjs().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
        END_DATE: getValues('searchFilters.endDate') || dayjs().add(1, 'year').endOf('year').format('YYYY-MM-DD'),
        STATUS: getValues('searchFilters.status')?.value || '',
        M75: true
    }

    const { data, isLoading, isError } = useSearchHrCheckerExport(params, open)

    const handleExport = () => {
        if (!data?.data?.ResultOnDb) {
            return
        }

        // Get data from ResultOnDb[1] (paginated data in export should be all)
        // Or ResultOnDb[2] if available for all data
        const allData = data.data.ResultOnDb.length > 2
            ? (data.data.ResultOnDb[2] as unknown as HrCheckerM75ResponseData[])
            : (data.data.ResultOnDb[1] as unknown as HrCheckerM75ResponseData[])

        // Transform data for export
        const exportData = allData.map((row) => {
            // Create date range from start and end date if LEAVE_DATE_RANGE is not available
            let dateRange = row.LEAVE_DATE_RANGE || ''
            if (!dateRange && row.LEAVE_REQUEST_START_DATE) {
                const startDate = dayjs(row.LEAVE_REQUEST_START_DATE).format('DD/MM/YYYY')
                const endDate = row.LEAVE_REQUEST_END_DATE
                    ? dayjs(row.LEAVE_REQUEST_END_DATE).format('DD/MM/YYYY')
                    : startDate
                dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`
            }

            return {
                'REQUEST_ID': `leave${row.LEAVE_REQUEST_ID}`,
                'EMPLOYEE_ID': row.LEAVE_REQUEST_EMPLOYEE_CODE,
                'EMPLOYEE_NAME': row.EMPLOYEE_NAME ? `${row.EMPLOYEE_NAME} ${row.EMPLOYEE_SURNAME || ''}`.trim() : '',
                'EMPLOYEE_SECTION': row.EMPLOYEE_SECTION || '',
                'REQUEST_DATE': row.CREATE_DATE || '',
                'DATE': dateRange,
                'TIME': row.LEAVE_REQUEST_TIME || '',
                'TYPE': row.LEAVE_TYPE_DESCRIPTION_TH || '',
                'TOTAL': row.LEAVE_REQUEST_TOTAL_DAY || 0,
                'REASON': row.LEAVE_REQUEST_REASON || '',
                'FILE': row.LEAVE_REQUEST_FILE_UPLOAD_NAME ? 'อัพโหลดแล้ว' : '',
                'Approval_1': (() => {
                    const approver = row.approveNo1 || row.Approval_1 || ''
                    if (!approver) return ''
                    const status = String(row.LEAVE_REQUEST_STATUS)
                    if (status === '1') return `Approved By ${approver}`
                    if (status === '2') return `Rejected By ${approver}`
                    return `Pending With ${approver}`
                })(),
                'Approval_2': (() => {
                    const approver = row.approveNo2 || row.Approval_2 || ''
                    if (!approver) return ''
                    const status = String(row.LEAVE_REQUEST_STATUS)
                    if (status === '1') return `Approved By ${approver}`
                    if (status === '2') return `Rejected By ${approver}`
                    return `Pending With ${approver}`
                })(),
                'Approval_3': (() => {
                    const approver = row.approveNo3 || row.Approval_3 || ''
                    if (!approver) return ''
                    const status = String(row.LEAVE_REQUEST_STATUS)
                    if (status === '1') return `Approved By ${approver}`
                    if (status === '2') return `Rejected By ${approver}`
                    return `Pending With ${approver}`
                })(),
                'Approval_4': (() => {
                    const approver = row.approveNo4 || row.Approval_4 || ''
                    if (!approver) return ''
                    const status = String(row.LEAVE_REQUEST_STATUS)
                    if (status === '1') return `Approved By ${approver}`
                    if (status === '2') return `Rejected By ${approver}`
                    return `Pending With ${approver}`
                })(),
                'Approval_5': (() => {
                    const approver = row.approveNo5 || row.Approval_5 || ''
                    if (!approver) return ''
                    const status = String(row.LEAVE_REQUEST_STATUS)
                    if (status === '1') return `Approved By ${approver}`
                    if (status === '2') return `Rejected By ${approver}`
                    return `Pending With ${approver}`
                })()
            }
        })

        // Create workbook and export
        const bookType = fileFormat
        const workbook = utils.book_new()
        const worksheet = utils.json_to_sheet(exportData)

        utils.book_append_sheet(workbook, worksheet, 'Leave Data')

        // Generate filename
        let file: string
        if (fileName.length) {
            file = `${fileName}.${bookType}`
        } else {
            const employeeCode = getValues('searchFilters.employeeCode')?.EMPLOYEE_CODE
            const startDate = getValues('searchFilters.startDate')
            const endDate = getValues('searchFilters.endDate')

            file = `M75_LeaveReports${employeeCode ? `-${employeeCode}` : ''}${startDate ? `-START_${dayjs(startDate).format('DD_MMM_YYYY')}` : ''}${endDate ? `-END_${dayjs(endDate).format('DD_MMM_YYYY')}` : ''}.${bookType}`
        }

        writeFile(workbook, file)
        onClose()
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>{t('Export To File')}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        fullWidth
                        label={t('Enter file name')}
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder={t('Leave empty for default name')}
                    />
                    <FormControl fullWidth>
                        <InputLabel>{t('File Format')}</InputLabel>
                        <Select
                            value={fileFormat}
                            label={t('File Format')}
                            onChange={(e) => setFileFormat(e.target.value as 'xlsx' | 'csv' | 'txt')}
                        >
                            <MenuItem value='xlsx'>xlsx</MenuItem>
                            <MenuItem value='csv'>csv</MenuItem>
                            <MenuItem value='txt'>txt</MenuItem>
                        </Select>
                    </FormControl>
                    {isError && (
                        <Box sx={{ color: 'error.main' }}>
                            {t('Error loading data for export')}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color='error'>
                    {t('Cancel')}
                </Button>
                <Button
                    onClick={handleExport}
                    variant='contained'
                    color='primary'
                    disabled={isLoading || isError}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                    {isLoading ? t('Loading data...') : t('Export')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default HrCheckM75ExportModal
