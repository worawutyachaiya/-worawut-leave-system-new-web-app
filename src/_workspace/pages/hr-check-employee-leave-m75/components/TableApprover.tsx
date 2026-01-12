import { useMemo } from 'react'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useSearchApprover } from '@/_workspace/react-query/hooks/useLeaveApprover'
import { useSettings } from '@/@core/hooks/useSettings'
import { HrCheckerM75ResponseData } from '@/_workspace/types/hr-checker-m75/HrCheckerM75Interface'
interface TableApproverProps {
    row: HrCheckerM75ResponseData
}
interface ApproverItem {
    APPROVER_ID: string
    APPROVAL_STATUS_ID: number | string
}
const TableApprover: React.FC<TableApproverProps> = ({ row }) => {
    const { settings } = useSettings()
    const params = useMemo(
        () => ({
            LEAVE_REQUEST_ID: row?.LEAVE_REQUEST_ID || '',
            TYPE: (row as any)?.TYPE || ''
        }),
        [row?.LEAVE_REQUEST_ID, (row as any)?.TYPE]
    )
    const approverList = row?.APPROVER || []
    const shouldFetch = !!row?.LEAVE_REQUEST_ID && approverList.length >= 0
    const { data, isLoading, isError } = useSearchApprover(params, shouldFetch)
    const result = useMemo<ApproverItem[]>(() => {
        const resultArray: ApproverItem[] = []
        const apiData = data?.data?.ResultOnDb || []

        // Always use approverList (from columns) as the base source of truth
        if (Array.isArray(approverList)) {
            approverList.forEach((elem: any) => {
                const approverId = typeof elem === 'string' ? elem : elem?.APPROVER_ID || elem
                if (approverId) {
                    resultArray.push({
                        APPROVER_ID: String(approverId),
                        APPROVAL_STATUS_ID: 0 // Default to pending
                    })
                }
            })
        }

        // Update statuses based on API data
        resultArray.forEach(el => {
            // Find matching approval record in API data
            const apiItem = apiData.find((item: any) =>
                el.APPROVER_ID.toString().toLowerCase() === item.APPROVAL_BY_APPROVER_EMPLOYEE_CODE?.toLowerCase()
            )

            if (apiItem) {
                el.APPROVAL_STATUS_ID = apiItem.APPROVAL_STATUS_ID
            } else if ((row as any)?.IS_APPROVED === 1 || (row as any)?.IS_APPROVED === '1') {
                // If request is fully approved but no specific record found for this approver, 
                // and this approver is in the list, they might have been auto-skipped or data missing.
                // But strictly, if we found a match, we use it. If not, it remains 0 (Pending) or we could infer.
                // For now, let's stick to updating only if found.
            }
        })

        return resultArray
    }, [row, approverList, data?.data?.ResultOnDb])
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <CircularProgress size={20} />
            </Box>
        )
    }
    if (isError) {
        return <span className='text-error'>Error loading approvers</span>
    }
    if (result.length === 0) {
        return <span className='text-secondary'>-</span>
    }
    const getStatusChip = (statusId: number | string) => {
        const status = String(statusId)
        if (status === '1') {
            return (
                <Chip
                    size='small'
                    label='✓'
                    color='success'
                    variant={settings.mode === 'dark' ? 'outlined' : 'filled'}
                    sx={{ height: 20, fontSize: 12, mr: 0.5 }}
                />
            )
        }
        if (status === '2') {
            return (
                <Chip
                    size='small'
                    label='✗'
                    color='error'
                    variant={settings.mode === 'dark' ? 'outlined' : 'filled'}
                    sx={{ height: 20, fontSize: 12, mr: 0.5 }}
                />
            )
        }
        return (
            <Chip
                size='small'
                label='✓'
                color='default'
                variant='outlined'
                sx={{ height: 20, fontSize: 12, mr: 0.5, opacity: 0.6 }}
            />
        )
    }
    return (
        <Box component='ol' sx={{ m: 0, pl: 2 }}>
            {result.map(({ APPROVER_ID, APPROVAL_STATUS_ID }, index) => (
                <Box
                    component='li'
                    key={`${APPROVER_ID}-${APPROVAL_STATUS_ID}-${index}`}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 0.25,
                        fontSize: '0.875rem'
                    }}
                >
                    {getStatusChip(APPROVAL_STATUS_ID)}
                    <span style={{ margin: '0 4px' }}>:</span>
                    <span>{APPROVER_ID}</span>
                </Box>
            ))}
        </Box>
    )
}
export default TableApprover
