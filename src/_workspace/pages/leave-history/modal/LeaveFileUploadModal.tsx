import { forwardRef, ReactElement, Ref } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import type { SlideProps } from '@mui/material'
import { Slide, CircularProgress } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import DeleteIcon from '@mui/icons-material/Delete'
import { useDropzone } from 'react-dropzone'
import { Controller, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import CustomTextField from '@/@core/components/mui/TextField'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { useUploadNewLeaveFile, createLeaveFileFormData } from '@/_workspace/react-query/hooks/useLeaveFile'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { leaveFileUploadSchema, type LeaveFileUploadFormData } from './validationSchema'
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})
interface LeaveFileUploadModalProps {
  leaveFileUploadId: string
  open: boolean
  onClose: () => void
  leaveRequestId: string
  onSuccess?: () => void
  existingFileName?: string | null
}
const LeaveFileUploadModal = ({
  leaveFileUploadId,
  open,
  onClose,
  leaveRequestId,
  onSuccess,
  existingFileName
}: LeaveFileUploadModalProps) => {
  const { control, handleSubmit, reset, setValue, watch } = useForm<LeaveFileUploadFormData>({
    resolver: zodResolver(leaveFileUploadSchema),
    defaultValues: {
      fileUpload: null,
      reason: '',
      remark: ''
    }
  })
  const { errors } = useFormState({ control })
  const fileUpload = watch('fileUpload') as File | null
  const [errorMessage, setErrorMessage] = React.useState('')
  const onUploadSuccess = async (response: any) => {
    if (response.data?.Status === true) {
      handleReset()
      onSuccess?.()
      onClose()
    } else {
      setErrorMessage(response.data?.Message || 'เกิดข้อผิดพลาดในการอัพโหลด')
    }
  }

  const onUploadError = (error: Error) => {
    setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ')
  }

  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadNewLeaveFile(onUploadSuccess, onUploadError)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0]
        if (error.code === 'fileUpload-too-large') {
          setErrorMessage('ไฟล์มีขนาดใหญ่เกิน 5MB')
        } else {
          setErrorMessage(error.message)
        }
        return
      }
      if (acceptedFiles.length > 0) {
        setValue('fileUpload', acceptedFiles[0])
        setErrorMessage('')
      }
    }
  })
  const onSubmit = async (data: LeaveFileUploadFormData) => {
    if (!data.fileUpload) {
      setErrorMessage('กรุณาเลือกไฟล์')
      return
    }
    const formData = createLeaveFileFormData({
      leaveRequestId,
      leaveFileUploadId,
      file: data.fileUpload,
      employeeCode: getUserData()?.EMPLOYEE_CODE || '',
      reason: data.reason || '',
      remark: data.remark || ''
    })
    await uploadFile(formData)
  }
  const handleReset = () => {
    reset({
      fileUpload: null,
      reason: '',
      remark: ''
    })
    setErrorMessage('')
  }
  const handleRemoveFile = () => {
    setValue('fileUpload', null)
  }
  const handleClose = () => {
    if (!isUploading) {
      handleReset()
      onClose()
    }
  }
  return (
    <Dialog
      maxWidth='sm'
      fullWidth={true}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose()
        }
      }}
      TransitionComponent={Transition}
      open={open}
      keepMounted
      sx={{
        '& .MuiDialog-paper': { overflow: 'visible' },
        '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
      }}
    >
      <DialogTitle id='upload-fileUpload-dialog-title'>
        <Typography variant='h5' component='span'>
          Upload Leave Attachment
        </Typography>
        <DialogCloseButton onClick={handleClose} disableRipple disabled={isUploading}>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {/* แสดงชื่อไฟล์เดิม */}
          {existingFileName && (
            <Alert severity='info' sx={{ mb: 4 }}>
              ไฟล์ปัจจุบัน: <strong>{existingFileName}</strong>
            </Alert>
          )}
          {/* Error Message */}
          {errorMessage && (
            <Alert severity='error' sx={{ mb: 4 }} onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}
          {/* Dropzone */}
          <Grid className='mb-4'>
            {!fileUpload ? (
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  p: 6,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'action.selected' : 'action.hover',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <input {...getInputProps()} />
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 56,
                    height: 56,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant='h6' sx={{ mb: 1 }}>
                  {isDragActive ? 'Drop fileUpload here' : 'Drag & drop fileUpload here, or click to select'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Supported: Max 5MB
                </Typography>
              </Box>
            ) : (
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Selected File
                  </Typography>
                  <Chip label='Ready to upload' size='small' color='success' />
                </Box>
                <List disablePadding>
                  <ListItem
                    sx={{
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      pr: 1
                    }}
                    secondaryAction={
                      <IconButton edge='end' color='error' size='small' onClick={handleRemoveFile}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar variant='rounded' sx={{ width: 36, height: 36, bgcolor: 'warning.lighter' }}>
                        {fileUpload.type.startsWith('image') ? (
                          <img
                            src={URL.createObjectURL(fileUpload)}
                            alt={fileUpload.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                          />
                        ) : (
                          <InsertDriveFileIcon color='warning' />
                        )}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={fileUpload.name}
                      secondary={`${(fileUpload.size / 1024).toFixed(2)} KB`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500, noWrap: true }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                </List>
              </Box>
            )}
          </Grid>
          {/* Reason */}
          <Grid className='mb-4'>
            <Controller
              name='reason'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  multiline
                  rows={2}
                  label='Reason (Optional)'
                  placeholder='Enter reason...'
                  autoComplete='off'
                  error={!!errors.reason}
                  helperText={errors.reason?.message}
                />
              )}
            />
          </Grid>
          {/* Remark */}
          <Grid>
            <Controller
              name='remark'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  multiline
                  rows={2}
                  label='Remark (Optional)'
                  placeholder='Enter remark...'
                  autoComplete='off'
                  error={!!errors.remark}
                  helperText={errors.remark?.message}
                />
              )}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            type='button'
            onClick={() => handleSubmit(onSubmit)()}
            variant='contained'
            color='success'
            disabled={!fileUpload || isUploading}
            startIcon={isUploading ? <CircularProgress size={16} color='inherit' /> : <CloudUploadIcon />}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary' disabled={isUploading}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
import React from 'react'
export default LeaveFileUploadModal
