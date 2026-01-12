// React Imports
import { forwardRef, ReactElement, Ref } from 'react'

// MUI Imports
import { Dialog, DialogContent, Button, Typography, Box, type SlideProps, Slide, CircularProgress } from '@mui/material'

// Assets
import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'

// Dialog Transition
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

function DeleteConfirmDialog({ open, onClose, onConfirm, isDeleting = false }: Props) {
  return (
    <Dialog
      maxWidth='xs'
      fullWidth
      open={open}
      onClose={!isDeleting ? onClose : undefined}
      TransitionComponent={Transition}
      keepMounted
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          borderRadius: 2
        },
        '& .MuiDialog-container': {
          justifyContent: 'center',
          alignItems: 'flex-start'
        }
      }}
      PaperProps={{ sx: { top: 30, m: 0 } }}
    >
      <DialogContent sx={{ py: 4, px: 5 }}>
        <Box sx={{ textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          {/* Delete Illustration */}
          <Box
            component='img'
            src={undraw_clean_up_re_504g}
            alt='Delete'
            sx={{
              width: 150,
              height: 'auto',
              mb: 6
            }}
          />

          {/* Title */}
          <Typography variant='h4' fontWeight='bold'>
            Are You Sure ?
          </Typography>
          <Typography variant='h5' sx={{ color: 'text.secondary', mb: 4 }}>
            ยืนยันการลบเอกสารหรือไม่ ?
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              type='button'
              onClick={onConfirm}
              variant='contained'
              color='error'
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={16} color='inherit' /> : null}
              sx={{ minWidth: 120 }}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete !'}
            </Button>
            <Button variant='outlined' color='secondary' onClick={onClose} disabled={isDeleting} sx={{ minWidth: 120 }}>
              No, Keep it
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmDialog
