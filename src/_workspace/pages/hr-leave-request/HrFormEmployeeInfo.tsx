// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Box,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Collapse,
  IconButton,
  Avatar,
  Chip
} from '@mui/material'

// Icon Imports
import {
  IconBeach,
  IconBriefcase,
  IconEmergencyBed,
  IconStethoscope,
  IconLogout,
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react'

// Components Imports
import SkeletonCustom from '@/components/SkeletonCustom'

// Hooks Imports
import {
  useLeaveEmployeeBalance,
  getRemainDayByLeaveType
} from '@/_workspace/react-query/hooks/useLeaveEmployeeBalance'

// Types
import { LEAVE_TYPE_IDS } from '@/_workspace/types/leave-employee-balance/LeaveEmployeeBalanceInterface'

// Translation
import { useTranslation } from '@/contexts/TranslationContext'

// Props Interface
interface EmployeeRemainLeaveProps {
  EMPLOYEE_CODE: string
}

function HrFormEmployeeInfo({ EMPLOYEE_CODE }: EmployeeRemainLeaveProps) {
  // States
  const [collapse, setCollapse] = useState(false)

  // Translation
  const { t } = useTranslation()

  // Query params for fetching data
  const paramForSearch = { EMPLOYEE_CODE }

  // React Query - Fetch Leave Employee Balance
  const { data, isLoading, isError, error } = useLeaveEmployeeBalance(paramForSearch)

  return (
    <Card style={{ overflow: 'visible', zIndex: 3 }}>
      <CardHeader
        title={t('Employee Leave Balance')}
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
        action={
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            {collapse ? <IconChevronDown className='text-xl' /> : <IconChevronUp className='text-xl' />}
          </IconButton>
        }
      />
      <Collapse in={!collapse}>
        <CardContent>
          {isError ? (
            <Typography color='error'>
              {t('An error occurred')}: {error?.message}
            </Typography>
          ) : null}
          {isLoading ? (
            <SkeletonCustom />
          ) : (
            <Grid container spacing={3}>
              {/*--------------- Annual Leave  ----------------------*/}
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                  <Avatar
                    variant='rounded'
                    sx={{
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48
                    }}
                  >
                    <IconBeach size={28} color='white' />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle2' color='textSecondary' sx={{ mb: 1 }}>
                      {t('Available Annual Leave')}
                    </Typography>
                    <Typography variant='h5' sx={{ mb: 0 }}>
                      {getRemainDayByLeaveType(data, LEAVE_TYPE_IDS.ANNUAL_LEAVE)} {t('Days')}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/*--------------- Annual Leave Accumulate  ----------------------*/}
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                  <Avatar
                    variant='rounded'
                    sx={{
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48
                    }}
                  >
                    <IconBeach size={28} color='white' />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle2' color='textSecondary' sx={{ mb: 1 }}>
                      {t('Annual Leave Accumulate')}
                    </Typography>
                    <Typography variant='h5' sx={{ mb: 0 }}>
                      {getRemainDayByLeaveType(data, LEAVE_TYPE_IDS.ANNUAL_LEAVE_ACCUMULATE)} {t('Days')}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/*--------------- Annual Leave Emergency  ----------------------*/}
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                  <Avatar
                    variant='rounded'
                    sx={{
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48
                    }}
                  >
                    <IconEmergencyBed size={28} color='white' />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle2' color='textSecondary' sx={{ mb: 1 }}>
                      {t('Annual Leave Emergency Remaining')}
                    </Typography>
                    <Typography variant='h5' sx={{ mb: 0 }}>
                      {getRemainDayByLeaveType(data, LEAVE_TYPE_IDS.ANNUAL_LEAVE_EMERGENCY)} {t('Days')}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/*--------------- Business Leave  ----------------------*/}
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                  <Avatar
                    variant='rounded'
                    sx={{
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48
                    }}
                  >
                    <IconBriefcase size={28} color='white' />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle2' color='textSecondary' sx={{ mb: 1 }}>
                      {t('Business Leave Remaining')}
                    </Typography>
                    <Typography variant='h5' sx={{ mb: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getRemainDayByLeaveType(data, LEAVE_TYPE_IDS.BUSINESS_LEAVE)} {t('Days')}
                      {getRemainDayByLeaveType(data, LEAVE_TYPE_IDS.BUSINESS_LEAVE) < 0 && (
                        <Chip
                          label={t('You are borrowing business leave next year.')}
                          color='error'
                          size='small'
                          variant='outlined'
                        />
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/*--------------- Sick Leave Used  ----------------------*/}
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                  <Avatar
                    variant='rounded'
                    sx={{
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48
                    }}
                  >
                    <IconStethoscope size={28} color='white' />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle2' color='textSecondary' sx={{ mb: 1 }}>
                      {t('Sick Leave Used')}
                    </Typography>
                    <Typography variant='h5' sx={{ mb: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getRemainDayByLeaveType(data, LEAVE_TYPE_IDS.SICK_LEAVE)} {t('Days')} / 30 {t('Days')}
                      {getRemainDayByLeaveType(data, LEAVE_TYPE_IDS.SICK_LEAVE) > 30 && (
                        <Chip label={t('Already exceed 30 days')} color='error' size='small' variant='outlined' />
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/*--------------- Other Leave Used  ----------------------*/}
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                  <Avatar
                    variant='rounded'
                    sx={{
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48
                    }}
                  >
                    <IconLogout size={28} color='white' />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle2' color='textSecondary' sx={{ mb: 1 }}>
                      {t('Other Leave Used')}
                    </Typography>
                    <Typography variant='h5' sx={{ mb: 0 }}>
                      {getRemainDayByLeaveType(data, LEAVE_TYPE_IDS.OTHER_LEAVE)} {t('Days')}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default HrFormEmployeeInfo
