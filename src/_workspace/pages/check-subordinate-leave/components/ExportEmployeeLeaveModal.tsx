import { forwardRef, ReactElement, Ref, useRef } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'
import { useReactToPrint } from 'react-to-print'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { useGetEmployeeLeaveUsage } from '@/_workspace/react-query/hooks/useCheckSubordinateLeave'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface EmployeeInfo {
  EMPLOYEE_ID: string
  EMPLOYEE_NAME: string
  EMPLOYEE_SURNAME: string
  EMPLOYEE_DEPT: string
  EMPLOYEE_SECTION: string
}

interface LeaveUsageItem {
  TOTAL_DAYS: number
  LEAVE_TYPE_ID: number
  LEAVE_TYPE_DESCRIPTION_EN: string
  LEAVE_TYPE_CODE: string
}

interface ExportEmployeeLeaveModalProps {
  open: boolean
  onClose: () => void
  employeeInfo: EmployeeInfo | null
}

const ExportEmployeeLeaveModal = ({ open, onClose, employeeInfo }: ExportEmployeeLeaveModalProps) => {
  const printRef = useRef<HTMLDivElement>(null)
  const currentYear = new Date().getFullYear()

  const { data, isLoading, isFetching } = useGetEmployeeLeaveUsage(
    { EMPLOYEE_CODE: employeeInfo?.EMPLOYEE_ID || '' },
    open && !!employeeInfo?.EMPLOYEE_ID
  )

  const leaveUsageData: LeaveUsageItem[] = data?.data?.ResultOnDb || []

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Employee_Leave_${employeeInfo?.EMPLOYEE_ID}_${currentYear}`,
    onAfterPrint: () => {
      ToastMessageSuccess({ message: 'PDF exported successfully' })
    },
    onPrintError: () => {
      ToastMessageError({ message: 'PDF export failed' })
    }
  })

  const handleClose = () => {
    if (!isLoading && !isFetching) {
      onClose()
    }
  }

  return (
    <Dialog
      maxWidth='sm'
      fullWidth
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && !isLoading && !isFetching) {
          handleClose()
        }
      }}
      TransitionComponent={Transition}
      keepMounted
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle>
        <Typography variant='h5'>Export Employee Leave</Typography>
        <DialogCloseButton onClick={handleClose} disableRipple disabled={isLoading || isFetching}>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading || isFetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <div
            ref={printRef}
            style={{
              backgroundColor: '#fff',
              color: '#000',
              padding: '2rem',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            {leaveUsageData.length > 0 ? (
              <>
                <h3 style={{ color: '#000', marginBottom: '1rem' }}>
                  {`${employeeInfo?.EMPLOYEE_ID} leave history from 01-01-${currentYear} to 31-12-${currentYear}`}
                </h3>
                <ul style={{ lineHeight: '2.5', paddingLeft: '1.5rem', margin: 0, listStyleType: 'disc' }}>
                  {leaveUsageData.map((item, index) => (
                    <li key={index} style={{ color: '#000', listStyleType: 'disc' }}>
                      {`${item.LEAVE_TYPE_DESCRIPTION_EN} (${item.LEAVE_TYPE_CODE}) : ${item.TOTAL_DAYS} ${
                        item.TOTAL_DAYS > 1 ? 'Days' : 'Day'
                      }`}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <span style={{ color: '#000' }}>No Results Found.</span>
            )}
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={() => handlePrint()}
          disabled={isLoading || isFetching || leaveUsageData.length === 0}
          color='primary'
          variant='contained'
        >
          Export
        </Button>
        <Button onClick={handleClose} disabled={isLoading || isFetching} color='secondary' variant='tonal'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExportEmployeeLeaveModal
