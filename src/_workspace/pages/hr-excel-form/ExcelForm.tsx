import { Fragment, useState, useCallback } from 'react'

// MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material'

// MUI Icons
import DownloadIcon from '@mui/icons-material/Download'
import EditNoteIcon from '@mui/icons-material/EditNote'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import PreviewIcon from '@mui/icons-material/Preview'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

// Third-party Imports
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useDropzone } from 'react-dropzone'

// Extend dayjs with customParseFormat plugin
dayjs.extend(customParseFormat)

// Translation
import { useTranslation } from '@/contexts/TranslationContext'

// Services & Validation
import HrExcelFormService from '@/_workspace/services/hr-excel-form/HrExcelFormService'
import HrHolidayService from '@/_workspace/services/hr-holiday/HrHolidayService'
import { validateExcelData } from './ValidateSchema'
import { CreateFormParams } from '@/_workspace/types/hr-excel-form/HrExcelFormInterface'
import { ToastMessageSuccess, ToastMessageError } from '@/components/ToastMessage'

interface ExcelRow {
  [key: string]: any
}

const ExcelForm = () => {
  const { t } = useTranslation()

  // States
  const [excelFile, setExcelFile] = useState<ArrayBuffer | null>(null)
  const [excelData, setExcelData] = useState<ExcelRow[] | null>(null)
  const [typeError, setTypeError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const fileTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ]

      if (
        fileTypes.includes(file.type) ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.csv')
      ) {
        setTypeError(null)
        setSelectedFile(file)
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = e => {
          if (e.target?.result) {
            setExcelFile(e.target.result as ArrayBuffer)
          }
        }
      } else {
        setTypeError('Please select only Excel file types (.xlsx, .xls, .csv)')
        setExcelFile(null)
        setSelectedFile(null)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    }
  })

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setExcelFile(null)
    setTypeError(null)
  }

  // Handle file upload (parse Excel)
  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, { type: 'buffer' })
      const worksheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[worksheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)

      setExcelData(data as ExcelRow[])
      setActiveStep(3) // Move to preview step
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!excelData || excelData.length <= 0) {
      ToastMessageError({ message: 'No data to submit' })
      return
    }

    // Validate data
    const validation = validateExcelData(excelData)
    if (!validation.success) {
      setValidationErrors(validation.errors?.map(e => `${e.path}: ${e.message}`) || [])
      ToastMessageError({ message: 'Validation failed' })
      return
    }
    setValidationErrors([])

    setIsSubmitting(true)
    try {
      for (const row of excelData) {
        // Helper function to convert Excel date (serial number or string) to YYYY-MM-DD
        const parseExcelDate = (value: any): string => {
          if (typeof value === 'number') {
            // Excel serial number: days since 1900-01-01 (with Excel's incorrect leap year bug)
            return dayjs('1900-01-01')
              .add(value - 2, 'days')
              .format('YYYY-MM-DD')
          } else if (typeof value === 'string') {
            // Try parsing as DD/MM/YYYY format
            const parsed = dayjs(value, 'DD/MM/YYYY')
            if (parsed.isValid()) {
              return parsed.format('YYYY-MM-DD')
            }
            // Try parsing as other common formats
            const fallback = dayjs(value)
            if (fallback.isValid()) {
              return fallback.format('YYYY-MM-DD')
            }
          }
          // Return empty string if parsing fails
          return ''
        }

        const startDateRaw = row['วันที่เริ่มต้น (ex.15/01/2000)']
        const endDateRaw = row['วันที่สิ้นสุด (ex.15/01/2000)']

        const startDate = parseExcelDate(startDateRaw)
        const endDate = parseExcelDate(endDateRaw)

        if (!startDate || !endDate) {
          throw new Error(`Invalid date for employee ${row['รหัสพนักงาน']}`)
        }

        // Get holiday count
        const holidayRes = await HrHolidayService.getHoliday({ startDate, endDate })
        const holidayCount = holidayRes.data?.TotalCountOnDb ?? 0

        // Calculate total days (simplified - actual calculation might need more logic)
        const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1 - holidayCount

        const params: CreateFormParams = {
          LEAVE_TYPE: row['ประเภทการลา'].split('.')[0],
          START_DATE: startDate,
          END_DATE: endDate,
          LEAVE_TIME: row['เวลา'],
          TOTAL_DAY_LEAVE: String(totalDays > 0 ? totalDays : 1),
          REASON: row['เหตุผล'] || '',
          REMARK: row['หมายเหตุ'] || '',
          EMPLOYEE_CODE: String(row['รหัสพนักงาน'])
        }

        const res = await HrExcelFormService.create(params)
        if (!res.data.Status) {
          throw new Error(res.data.Message || 'Failed to create leave request')
        }
      }

      ToastMessageSuccess({ message: 'Data submitted successfully!' })
      // Reset
      setExcelFile(null)
      setExcelData(null)
      setSelectedFile(null)
      setActiveStep(0)
    } catch (error: any) {
      ToastMessageError({ message: error.message || 'An error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Steps configuration
  const steps = [
    {
      label: 'Download a new format file',
      description: '',
      icon: <DownloadIcon />,
      color: 'primary' as const,
      content: (
        <Box sx={{ maxWidth: '35%' }}>
          <Button
            variant='contained'
            color='success'
            href='/Leave_System_Template_For_Import.xlsx'
            target='_blank'
            rel='noopener noreferrer'
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <img
              width='20'
              height='20'
              src='https://img.icons8.com/color/48/microsoft-excel-2019--v1.png'
              alt='microsoft-excel'
            />
            Leave_System_Template_For_Import.xlsx
          </Button>
        </Box>
      )
    },
    {
      label: 'Enter data in excel from file downloaded',
      description: '* Please do not change the file format from default and enter all require cell',
      icon: <EditNoteIcon />,
      color: 'info' as const,
      content: <Typography color='text.secondary'>Fill in the required data in the Excel template</Typography>
    },
    {
      label: 'Upload the excel file',
      description: '',
      icon: <UploadFileIcon />,
      color: 'warning' as const,
      content: (
        <Box component='form' onSubmit={handleFileSubmit}>
          {!selectedFile ? (
            <Card
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
                },
                mb: 2,
                maxWidth: '35%',
                ml: 0
              }}
            >
              <input {...getInputProps()} />
              <div className='flex items-center flex-col'>
                <Avatar
                  variant='rounded'
                  sx={{
                    bgcolor: 'primary.main',
                    width: 48,
                    height: 48,
                    mb: 2,
                    border: '2px solid',
                    borderColor: 'divider',
                    margin: '0 auto'
                  }}
                >
                  <CloudUploadIcon sx={{ color: 'white' }} />
                </Avatar>
                <Typography variant='h6' sx={{ mb: 1 }}>
                  {isDragActive ? 'Drop file here' : 'Drag & drop file here, or click to select'}
                </Typography>
                <Typography color='text.secondary'>{t('Supported: .xlsx, .xls, .csv')}</Typography>
              </div>
            </Card>
          ) : (
            <Card
              sx={{
                borderRadius: 2,
                p: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                mb: 2,
                maxWidth: '35%',
                ml: 0
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='subtitle1' fontWeight={600}>
                  {t('Uploaded File')}
                </Typography>
                <Chip label='1 file' size='small' color='primary' variant='outlined' />
              </Box>
              <List disablePadding>
                <ListItem
                  key={selectedFile.name}
                  sx={{
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    mb: 1,
                    '&:last-child': { mb: 0 }
                  }}
                  secondaryAction={
                    <IconButton edge='end' color='error' onClick={handleRemoveFile} size='small'>
                      <i className='tabler-x text-xl' />
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      variant='rounded'
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: 'success.lighter'
                      }}
                    >
                      <i className='tabler-file-description text-xl' />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={selectedFile.name}
                    secondary={`${(selectedFile.size / 1024).toFixed(2)} KB`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500, noWrap: true }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              </List>
            </Card>
          )}

          <Button type='submit' variant='contained' color='warning' disabled={!excelFile}>
            Upload
          </Button>
          {typeError && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {typeError}
            </Alert>
          )}
        </Box>
      )
    },
    {
      label: 'Preview the uploaded data',
      description: '',
      icon: <PreviewIcon />,
      color: 'error' as const,
      content: (
        <Box>
          {!excelData || excelData.length <= 0 ? (
            <Typography color='text.secondary'>No Result Found</Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Table stickyHeader size='small'>
                <TableHead>
                  <TableRow>
                    {Object.keys(excelData[0]).map(key => (
                      <TableCell key={key} sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                        {key}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {excelData.map((row, index) => (
                    <TableRow key={index} hover>
                      {Object.keys(row).map(key => {
                        // Format dates if needed
                        let value = row[key]
                        if (
                          (key.includes('วันที่') || key.toLowerCase().includes('date')) &&
                          typeof value === 'number'
                        ) {
                          // Excel date conversion
                          value = dayjs('1900-01-01')
                            .add(value - 2, 'days')
                            .format('DD/MM/YYYY')
                        }
                        return <TableCell key={key}>{value}</TableCell>
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )
    },
    {
      label: 'Submit the data',
      description: '',
      icon: <CheckCircleIcon />,
      color: 'success' as const,
      content: (
        <Box>
          {validationErrors.length > 0 && (
            <Alert severity='error' sx={{ mb: 2 }}>
              <Typography fontWeight='bold'>Validation Errors:</Typography>
              {validationErrors.map((err, idx) => (
                <Typography key={idx} variant='body2'>
                  {err}
                </Typography>
              ))}
            </Alert>
          )}
          <Button
            variant='contained'
            color='primary'
            onClick={handleSubmit}
            disabled={isSubmitting || !excelData || excelData.length <= 0}
            startIcon={isSubmitting ? <CircularProgress size={20} color='inherit' /> : undefined}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      )
    }
  ]

  return (
    <Card sx={{ overflow: 'visible' }}>
      <CardHeader title='How to import excel data' titleTypographyProps={{ variant: 'h5' }} />
      <Divider />
      <CardContent>
        <Stepper activeStep={activeStep} orientation='vertical'>
          {steps.map((step, index) => (
            <Step key={step.label} expanded>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${step.color}.main`,
                      color: 'white'
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Typography variant='h6'>{step.label}</Typography>
                {step.description && (
                  <Typography variant='body2' color='text.secondary'>
                    {step.description}
                  </Typography>
                )}
              </StepLabel>
              <StepContent>
                <Box sx={{ mt: 2, mb: 2 }}>{step.content}</Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  )
}

export default ExcelForm
