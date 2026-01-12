import { useState, useCallback } from 'react'
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Drawer,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import LeaveEmployeeInformationService from '@/_workspace/services/leave-employee-information/LeaveEmployeeInformationService'
import { fetchAllEmployee } from '@/_workspace/react-select/async-promise-load-options/fetchAllEmployee'
import { useTranslation } from '@/contexts/TranslationContext'
import type { FormDataPage } from './validationSchema'
import type { EmployeeOptionType } from '@/_workspace/types/subordinate-flex-time/SubordinateFlexTimeTypes'

interface Props {
  mdAbove: boolean
  leftSidebarOpen: boolean
  calendarApi: any
  handleLeftSidebarToggle: () => void
}

function SubordinateFlexTimeSidebar({ mdAbove, leftSidebarOpen, calendarApi, handleLeftSidebarToggle }: Props) {
  const { t } = useTranslation()
  const [isSearching, setIsSearching] = useState(false)
  const { control, watch, setValue, getValues } = useFormContext<FormDataPage>()
  const employeeCode = watch('searchFilters.employeeCode')
  const employeeInfo = watch('searchFilters.employeeInfo')

  const loadEmployeeOptions = async (inputValue: string): Promise<EmployeeOptionType[]> => {
    try {
      // HR Check: ค้นหาพนักงานทั้งหมด (ไม่ใช่ in-flow)
      const results = await fetchAllEmployee({ EMPLOYEE_ID: inputValue })
      return (results || []).map((emp: any) => ({
        EMPLOYEE_ID: emp.EMPLOYEE_CODE || emp.EMPLOYEE_ID,
        EMPLOYEE_NAME: emp.FULL_NAME || emp.EMPLOYEE_NAME || ''
      }))
    } catch (error) {
      return []
    }
  }

  const handleSearchClick = useCallback(async () => {
    const selectedEmployee = getValues('searchFilters.employeeCode')
    if (!selectedEmployee) return
    setIsSearching(true)
    try {
      const response = await LeaveEmployeeInformationService.searchEmployeeByEmployeeCode({
        EMPLOYEE_CODE: selectedEmployee.EMPLOYEE_ID
      })
      if (response?.data?.ResultOnDb && response.data.ResultOnDb.length > 0) {
        const empData = response.data.ResultOnDb[0]
        setValue('searchFilters.employeeInfo', {
          EMPLOYEE_ID: empData.EMPLOYEE_CODE || empData.EMPLOYEE_ID || selectedEmployee.EMPLOYEE_ID,
          EMPLOYEE_NAME: empData.EMPLOYEE_NAME || '',
          EMPLOYEE_SURNAME: empData.EMPLOYEE_SURNAME || '',
          EMPLOYEE_DEPT: empData.EMPLOYEE_DEPT || '',
          EMPLOYEE_SECTION: empData.EMPLOYEE_SECTION || ''
        })
      }
    } catch (error) {
      console.error('Error fetching employee info:', error)
    } finally {
      setIsSearching(false)
    }
  }, [getValues, setValue])

  const handleClearClick = () => {
    setValue('searchFilters.employeeCode', null)
    setValue('searchFilters.employeeInfo', null)
  }

  const sidebarContent = (
    <Box sx={{ p: 3, width: '100%', overflowY: 'auto', '& .select__control': { boxShadow: 'none' } }}>
      <Card elevation={0} sx={{ mb: 3, boxShadow: 'none' }}>
        <CardHeader title={t('Search filter')} titleTypographyProps={{ variant: 'h5' }} />
        <CardContent>
          <Box sx={{ mb: 4 }}>
            <Typography variant='body2' sx={{ mb: 1 }}>
              {t('Employee ID')}
            </Typography>
            <Controller
              name='searchFilters.employeeCode'
              control={control}
              render={({ field: { value, onChange, ref, ...fieldProps } }) => (
                <AsyncSelectCustom
                  {...fieldProps}
                  value={value}
                  onChange={onChange}
                  loadOptions={loadEmployeeOptions}
                  getOptionLabel={(option: EmployeeOptionType) => option.EMPLOYEE_ID}
                  getOptionValue={(option: EmployeeOptionType) => option.EMPLOYEE_ID}
                  placeholder={t('Select employee id')}
                  isClearable
                  cacheOptions
                  defaultOptions
                  label=''
                  classNamePrefix='select'
                />
              )}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            <Button variant='contained' color='primary' onClick={handleSearchClick} disabled={isSearching}>
              {isSearching ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  {t('Searching')}
                </>
              ) : (
                t('Search')
              )}
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClearClick} disabled={isSearching}>
              {t('Clear')}
            </Button>
          </Box>
        </CardContent>
      </Card>
      {employeeInfo && (
        <>
          <Divider sx={{ my: 2 }} />
          <Card elevation={0} sx={{ mb: 3, boxShadow: 'none' }}>
            <CardHeader title={t('Employee Information')} titleTypographyProps={{ variant: 'h5' }} />
            <List>
              <ListItem>
                <ListItemText primary={t('ID')} secondary={employeeInfo.EMPLOYEE_ID} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={t('Name')}
                  secondary={`${employeeInfo.EMPLOYEE_NAME} ${employeeInfo.EMPLOYEE_SURNAME}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('Department')} secondary={employeeInfo.EMPLOYEE_DEPT} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('Section')} secondary={employeeInfo.EMPLOYEE_SECTION} />
              </ListItem>
            </List>
          </Card>
        </>
      )}
    </Box>
  )

  if (mdAbove) {
    return (
      <Box
        sx={{
          width: 300,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: 'none'
        }}
      >
        {sidebarContent}
      </Box>
    )
  }

  return (
    <Drawer
      open={leftSidebarOpen}
      onClose={handleLeftSidebarToggle}
      anchor='left'
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          boxShadow: 'none'
        }
      }}
    >
      {sidebarContent}
    </Drawer>
  )
}

export default SubordinateFlexTimeSidebar
