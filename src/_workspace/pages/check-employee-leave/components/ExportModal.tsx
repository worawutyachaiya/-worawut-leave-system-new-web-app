import { forwardRef, ReactElement, Ref, useEffect, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slide,
  SlideProps,
  TextField,
  Typography
} from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import dayjs from 'dayjs'
import { utils, writeFile } from 'xlsx'
import { useTranslation } from '@/contexts/TranslationContext'
import { useSearchHrCheckerForExport } from '@/_workspace/react-query/hooks/useHrChecker'
import type { HrCheckerSearchParams, HrCheckerResponseData } from '@/_workspace/types/hr-checker/HrCheckerInterface'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})
interface ExportModalProps {
  open: boolean
  onClose: () => void
  searchParams: HrCheckerSearchParams
}
type FileFormat = 'xlsx' | 'csv' | 'txt'
const ExportModal = ({ open, onClose, searchParams }: ExportModalProps) => {
  const { t } = useTranslation()
  const [fileName, setFileName] = useState<string>('')
  const [fileFormat, setFileFormat] = useState<FileFormat>('xlsx')
  const [isFetchDataExport, setIsFetchDataExport] = useState<boolean>(false)
  const exportParams: HrCheckerSearchParams = {
    ...searchParams,
    START: '0',
    LIMIT: '999999',
    ORDER: searchParams.ORDER || []
  }
  const { data, isLoading, isFetching } = useSearchHrCheckerForExport(exportParams, isFetchDataExport)
  useEffect(() => {
    if (isFetchDataExport && !isLoading && !isFetching && data?.data?.ResultOnDb) {
      handleExportData()
    }
  }, [isFetchDataExport, isLoading, isFetching, data])
  const getExportData = (): HrCheckerResponseData[] => {
    if (Array.isArray(data?.data?.ResultOnDb) && data.data.ResultOnDb.length > 1) {
      return data.data.ResultOnDb[1] as unknown as HrCheckerResponseData[]
    }
    return []
  }
  const transformDataForExport = (rawData: HrCheckerResponseData[]) => {
    return rawData.map(elem => ({
      REQUEST_ID: `leave${elem.LEAVE_REQUEST_ID}`,
      EMPLOYEE_CODE: elem.LEAVE_REQUEST_EMPLOYEE_CODE,
      EMPLOYEE_NAME: elem.EMPLOYEE_FULL_NAME,
      EMPLOYEE_SECTION: elem.EMPLOYEE_SECTION,
      REQUEST_DATE: elem.CREATE_DATE,
      DATE: elem.LEAVE_DATE_RANGE,
      TIME: elem.LEAVE_REQUEST_TIME,
      TYPE: elem.LEAVE_TYPE_DESCRIPTION_TH,
      TOTAL: elem.LEAVE_REQUEST_TOTAL_DAY,
      REASON: elem.LEAVE_REQUEST_REASON,
      FILE: elem.LEAVE_REQUEST_FILE_UPLOAD_NAME ? 'อัพโหลดแล้ว' : '',
      Approval_1: elem.Approval_1 ? elem.Approval_1 : '',
      Approval_2: elem.Approval_2 ? elem.Approval_2 : '',
      Approval_3: elem.Approval_3 ? elem.Approval_3 : '',
      Approval_4: elem.Approval_4 ? elem.Approval_4 : '',
      Approval_5: elem.Approval_5 ? elem.Approval_5 : ''
    }))
  }
  const handleExportData = () => {
    try {
      const rawData = getExportData()
      if (rawData.length === 0) {
        ToastMessageError({ message: t('No data to export') })
        setIsFetchDataExport(false)
        return
      }
      const exportData = transformDataForExport(rawData)
      const bookType = fileFormat
      const workbook = utils.book_new()
      const worksheet = utils.json_to_sheet(exportData)
      utils.book_append_sheet(workbook, worksheet)
      let file: string
      if (fileName.trim().length > 0) {
        file = `${fileName.trim()}.${bookType}`
      } else {
        const empCode = searchParams.EMPLOYEE_CODE ? `-${searchParams.EMPLOYEE_CODE}` : ''
        const startDate = searchParams.START_DATE
          ? `-START_${dayjs(searchParams.START_DATE).format('DD_MMM_YYYY')}`
          : ''
        const endDate = searchParams.END_DATE ? `-END_${dayjs(searchParams.END_DATE).format('DD_MMM_YYYY')}` : ''
        file = `LeaveReports${empCode}${startDate}${endDate}.${bookType}`
      }
      writeFile(workbook, file)
      ToastMessageSuccess({ message: t('Export successfully') })
      setIsFetchDataExport(false)
      handleClose()
    } catch (error) {
      console.error('Export error:', error)
      ToastMessageError({ message: t('Export failed') })
      setIsFetchDataExport(false)
    }
  }
  const handleExportClick = () => {
    setIsFetchDataExport(true)
  }
  const handleClose = () => {
    if (!isLoading && !isFetching) {
      setFileName('')
      setFileFormat('xlsx')
      setIsFetchDataExport(false)
      onClose()
    }
  }
  const handleFileFormatChange = (event: SelectChangeEvent<FileFormat>) => {
    setFileFormat(event.target.value as FileFormat)
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileDownloadIcon color='primary' />
          <Typography variant='h5'>{t('Export To File')}</Typography>
        </Box>
        <DialogCloseButton onClick={handleClose} disableRipple disabled={isLoading || isFetching}>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* File Name Input */}
          <FormControl fullWidth>
            <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
              {t('File Name')}
            </Typography>
            <TextField
              fullWidth
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              placeholder={t('Enter file name')}
              disabled={isLoading || isFetching}
              size='small'
              helperText={t('Leave blank to auto-generate file name')}
            />
          </FormControl>
          {/* File Format Select */}
          <FormControl fullWidth>
            <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
              {t('File Format')}
            </Typography>
            <Select
              value={fileFormat}
              onChange={handleFileFormatChange}
              disabled={isLoading || isFetching}
              size='small'
            >
              <MenuItem value='xlsx'>xlsx</MenuItem>
              <MenuItem value='csv'>csv</MenuItem>
              <MenuItem value='txt'>txt</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isLoading || isFetching} color='secondary' variant='tonal'>
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleExportClick}
          disabled={isLoading || isFetching}
          color='primary'
          variant='contained'
          startIcon={isLoading || isFetching ? <CircularProgress size={16} color='inherit' /> : <FileDownloadIcon />}
        >
          {isLoading || isFetching ? t('Loading data...') : t('Export')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default ExportModal
