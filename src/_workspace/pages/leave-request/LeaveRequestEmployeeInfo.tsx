// React Imports
import { useState } from 'react'

// Icon Imports
import { IconBriefcase, IconBuildingSkyscraper, IconUser, IconAward } from '@tabler/icons-react'

// MUI Imports
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Collapse,
  IconButton,
  Avatar,
  Box,
  Alert
} from '@mui/material'
import classNames from 'classnames'

// Third-party Imports
import dayjs from 'dayjs'

// Components Imports
import SkeletonCustom from '@/components/SkeletonCustom'

// Hooks Imports
import { useSearchEmployeeInformation } from '@/_workspace/react-query/hooks/useLeaveEmployeeInformation'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Translation
import { useTranslation } from '@/contexts/TranslationContext'

// Utility Functions
const formatDate = (dateString: string): string => {
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const date = new Date(dateString)
  const day = date.getDate()
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

const getExperienceDate = (dateString: string, t: (key: string) => string): string => {
  const startDate = dayjs(dateString)
  const now = dayjs()

  const years = now.diff(startDate, 'year')
  const months = now.diff(startDate.add(years, 'year'), 'month')
  const days = now.diff(startDate.add(years, 'year').add(months, 'month'), 'day')

  return `${years} ${t('Years')} ${months} ${t('Months')} ${days} ${t('Days')}`
}

function LeaveRequestEmployeeInfo() {
  const [collapse, setCollapse] = useState(false)
  const { t } = useTranslation()

  const paramForSearch = { EMPLOYEE_CODE: `${getUserData().EMPLOYEE_CODE}` }
  const { data, isError, isLoading, error } = useSearchEmployeeInformation(paramForSearch, true)

  const employeeInfo = {
    EMPLOYEE_NAME: data?.data?.ResultOnDb?.[0]?.EMPLOYEE_NAME || '',
    EMPLOYEE_SURNAME: data?.data?.ResultOnDb?.[0]?.EMPLOYEE_SURNAME || '',
    EMPLOYEE_POSITION_CODE: data?.data?.ResultOnDb?.[0]?.EMPLOYEE_POSITION_CODE || '',
    EMPLOYEE_POSITION: data?.data?.ResultOnDb?.[0]?.EMPLOYEE_POSITION || '',
    EMPLOYEE_DEPT: data?.data?.ResultOnDb?.[0]?.EMPLOYEE_DEPT || '',
    EMPLOYEE_SECTION: data?.data?.ResultOnDb?.[0]?.EMPLOYEE_SECTION || '',
    EMPLOYEE_BIRTH_DAY: data?.data?.ResultOnDb?.[0]?.EMPLOYEE_BIRTH_DAY || '',
    EMPLOYEE_START_WORK: data?.data?.ResultOnDb?.[0]?.EMPLOYEE_START_WORK || ''
  }

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader
        title='Employee Information'
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
        action={
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
          </IconButton>
        }
      />
      <Collapse in={!collapse}>
        <CardContent>
          {isError && <Alert severity='error'>An error occurred: {error.message}</Alert>}
          {isLoading ? (
            <SkeletonCustom />
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3} className={classNames('mb-2 mb-sm-0')}>
                <Box sx={{ display: 'flex', alignItems: 'start' }}>
                  <Box sx={{ mr: 2 }}>
                    <Avatar
                      variant='rounded'
                      sx={{
                        bgcolor: 'primary.main',
                        width: 42,
                        height: 42
                      }}
                    >
                      <IconBriefcase size={28} color='white' />
                    </Avatar>
                  </Box>
                  <Box>
                    <Typography variant='h6' sx={{ mb: 0 }}>
                      {employeeInfo.EMPLOYEE_NAME + ' ' + employeeInfo.EMPLOYEE_SURNAME}
                    </Typography>
                    <Typography variant='body2' color='textSecondary' sx={{ mb: 0 }}>
                      {t('Position Code')} : {employeeInfo.EMPLOYEE_POSITION_CODE}
                    </Typography>
                    <Typography variant='body2' color='textSecondary' sx={{ mb: 0 }}>
                      {t('Position')} : {employeeInfo.EMPLOYEE_POSITION}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3} className={classNames('mb-2 mb-sm-0')}>
                <Box sx={{ display: 'flex', alignItems: 'start' }}>
                  <Box sx={{ mr: 2 }}>
                    <Avatar
                      variant='rounded'
                      sx={{
                        bgcolor: 'primary.main',
                        width: 42,
                        height: 42
                      }}
                    >
                      <IconBuildingSkyscraper size={28} color='white' />
                    </Avatar>
                  </Box>
                  <Box>
                    <Typography variant='h6' sx={{ mb: 0 }}>
                      {t('Organization Information')}
                    </Typography>
                    <Typography variant='body2' color='textSecondary' sx={{ mb: 0 }}>
                      {t('Business Unit')} : {employeeInfo.EMPLOYEE_DEPT}
                    </Typography>
                    <Typography variant='body2' color='textSecondary' sx={{ mb: 0 }}>
                      {t('Section')} : {employeeInfo.EMPLOYEE_SECTION}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3} className={classNames('mb-2 mb-sm-0')}>
                <Box sx={{ display: 'flex', alignItems: 'start' }}>
                  <Box sx={{ mr: 2 }}>
                    <Avatar
                      variant='rounded'
                      sx={{
                        bgcolor: 'primary.main',
                        width: 42,
                        height: 42
                      }}
                    >
                      <IconUser size={28} color='white' />
                    </Avatar>
                  </Box>
                  <Box>
                    <Typography variant='h6' sx={{ mb: 0 }}>
                      {t('User Info')}
                    </Typography>
                    <Typography variant='body2' color='textSecondary' sx={{ mb: 0 }}>
                      {t('Birthday')} : {formatDate(employeeInfo.EMPLOYEE_BIRTH_DAY)}
                    </Typography>
                    <Typography variant='body2' color='textSecondary' sx={{ mb: 0 }}>
                      {t('Start Work')} : {formatDate(employeeInfo.EMPLOYEE_START_WORK)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3} className={classNames('mb-2 mb-sm-0')}>
                <Box sx={{ display: 'flex', alignItems: 'start' }}>
                  <Box sx={{ mr: 2 }}>
                    <Avatar
                      variant='rounded'
                      sx={{
                        bgcolor: 'primary.main',
                        width: 42,
                        height: 42
                      }}
                    >
                      <IconAward size={28} color='white' />
                    </Avatar>
                  </Box>
                  <Box>
                    <Typography variant='h6' sx={{ mb: 0 }}>
                      {t('Working Experience')}
                    </Typography>
                    <Typography variant='body2' sx={{ mb: 0 }}>
                      {getExperienceDate(employeeInfo.EMPLOYEE_START_WORK, t)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default LeaveRequestEmployeeInfo
