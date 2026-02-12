// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { Card, CardContent, CardHeader, Grid, Button, CircularProgress, Typography, Box, useTheme } from '@mui/material'
import {
  MailOutline as MailIcon,
  AccessTime as ClockIcon,
  WbSunnyOutlined as SunIcon,
  WbTwilightOutlined as SunsetIcon,
  Repeat as RepeatIcon
} from '@mui/icons-material'

// Third-party Imports
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'

// Component Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useTranslation } from '@/contexts/TranslationContext'
import {
  useGetEmailSetting,
  useUpsertEmailSetting,
  PREFIX_QUERY_KEY
} from '@/_workspace/react-query/hooks/useEmailSetting'
import type { EmailSettingInterface } from '@/_workspace/types/email-setting/EmailSettingInterface'
import OptionCard from './components/OptionCard'

const EmailSettingForm = () => {
  // Common Hooks
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const userData = getUserData() || {}

  // State
  const [deliveryType, setDeliveryType] = useState<number>(1) // Default to 1 (Immediate)
  const [batchSchedule, setBatchSchedule] = useState<string>('MORNING')

  // React Query Hooks
  const { data: emailSettingData, isLoading } = useGetEmailSetting(
    { EMPLOYEE_CODE: userData.EMPLOYEE_CODE },
    !!userData.EMPLOYEE_CODE
  )

  const { mutate: upsertEmailSetting, isPending: isSaving } = useUpsertEmailSetting(
    () => {
      toast.success(t('Email settings saved successfully'))
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    },
    error => {
      console.error('Error saving email setting:', error)
      toast.error(t('Failed to save email settings'))
    }
  )

  // Effects
  useEffect(() => {
    if (
      emailSettingData &&
      emailSettingData.data &&
      emailSettingData.data.ResultOnDb &&
      emailSettingData.data.ResultOnDb.length > 0
    ) {
      const setting = emailSettingData.data.ResultOnDb[0]
      setDeliveryType(setting.DELIVERY_TYPE)

      if (setting.DELIVERY_TYPE === 2) {
        if (setting.BATCH_TIME_1 && setting.BATCH_TIME_2) {
          setBatchSchedule('BOTH')
        } else if (setting.BATCH_TIME_1 === '16:00') {
          setBatchSchedule('AFTERNOON')
        } else {
          setBatchSchedule('MORNING')
        }
      }
    }
  }, [emailSettingData])

  // Handlers
  const handleSave = () => {
    let batchTime1 = null
    let batchTime2 = null

    if (deliveryType === 2) {
      if (batchSchedule === 'MORNING') {
        batchTime1 = '09:00'
      } else if (batchSchedule === 'AFTERNOON') {
        batchTime1 = '16:00'
      } else if (batchSchedule === 'BOTH') {
        batchTime1 = '09:00'
        batchTime2 = '16:00'
      }
    }

    const payload: EmailSettingInterface = {
      EMPLOYEE_CODE: userData.EMPLOYEE_CODE,
      DELIVERY_TYPE: deliveryType,
      BATCH_TIME_1: batchTime1,
      BATCH_TIME_2: batchTime2
    }

    upsertEmailSetting(payload)
  }

  const handleReset = () => {
    if (
      emailSettingData &&
      emailSettingData.data &&
      emailSettingData.data.ResultOnDb &&
      emailSettingData.data.ResultOnDb.length > 0
    ) {
      const setting = emailSettingData.data.ResultOnDb[0]
      setDeliveryType(setting.DELIVERY_TYPE)

      if (setting.DELIVERY_TYPE === 2) {
        if (setting.BATCH_TIME_1 && setting.BATCH_TIME_2) {
          setBatchSchedule('BOTH')
        } else if (setting.BATCH_TIME_1 === '16:00') {
          setBatchSchedule('AFTERNOON')
        } else {
          setBatchSchedule('MORNING')
        }
      } else {
        setBatchSchedule('MORNING')
      }
    } else {
      setDeliveryType(1)
      setBatchSchedule('MORNING')
    }
  }

  return (
    <Card>
      <CardHeader title={t('Email Notification Settings')} />
      <CardContent>
        {isLoading ? (
          <Grid container justifyContent='center'>
            <CircularProgress />
          </Grid>
        ) : (
          <Grid container spacing={4}>
            {/* Delivery Type Section */}
            <Grid item xs={12}>
              <Typography variant='subtitle1' gutterBottom sx={{ mb: 2 }}>
                {t('Select how you want to receive email notifications for requests')}
              </Typography>
              <Grid container spacing={6}>
                <Grid item xs={12} md={3}>
                  <OptionCard
                    title={t('Immediately')}
                    description={t('Receive email immediately')}
                    icon={<MailIcon sx={{ fontSize: 35 }} />}
                    isSelected={deliveryType === 1}
                    onClick={() => setDeliveryType(1)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <OptionCard
                    title={t('Batched')}
                    description={t('Collect and send at the specified time')}
                    icon={<ClockIcon sx={{ fontSize: 35 }} />}
                    isSelected={deliveryType === 2}
                    onClick={() => setDeliveryType(2)}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Batch Schedule Section - Conditional Render */}
            {deliveryType === 2 && (
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom sx={{ mb: 2, mt: 2 }}>
                  {t('Select the time you want')}
                </Typography>
                <Grid container spacing={6}>
                  <Grid item xs={12} md={3}>
                    <OptionCard
                      title={t('Morning (09:00)')}
                      description={t('Send email once a day at morning')}
                      icon={<SunIcon sx={{ fontSize: 35 }} />}
                      isSelected={batchSchedule === 'MORNING'}
                      onClick={() => setBatchSchedule('MORNING')}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <OptionCard
                      title={t('Afternoon (16:00)')}
                      description={t('Send email once a day at afternoon')}
                      icon={<SunsetIcon sx={{ fontSize: 35 }} />}
                      isSelected={batchSchedule === 'AFTERNOON'}
                      onClick={() => setBatchSchedule('AFTERNOON')}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <OptionCard
                      title={t('Both')}
                      description={t('Send email twice a day (09:00 & 16:00)')}
                      icon={<RepeatIcon sx={{ fontSize: 35 }} />}
                      isSelected={batchSchedule === 'BOTH'}
                      onClick={() => setBatchSchedule('BOTH')}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Action Buttons */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant='tonal' color='secondary' onClick={handleReset} disabled={isSaving}>
                {t('Clear')}
              </Button>
              <Button variant='contained' color='primary' onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    {t('Saving...')}
                  </>
                ) : (
                  t('Save Settings')
                )}
              </Button>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  )
}

export default EmailSettingForm
