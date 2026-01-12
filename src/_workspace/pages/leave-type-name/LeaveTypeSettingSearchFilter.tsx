import { useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Button, Card, CardContent, CardHeader, Grid, Collapse, IconButton } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { Controller, useFormContext } from 'react-hook-form'
import SelectCustom from '@/components/react-select/SelectCustom'
import CustomTextField from '@/components/mui/TextField'
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useLeaveTypeSetting'
import { FormDataPage, StatusOption } from './validationSchema'
import { LEAVE_TYPE_STATUS_OPTIONS } from '@/_workspace/types/leave-type-setting/LeaveTypeSettingInterface'
import { useDxContext } from '@/_template/DxContextProvider'
function LeaveTypeSettingSearchFilter() {
  const { setIsEnableFetching } = useDxContext()
  const [isExpanded, setIsExpanded] = useState(true)
  const queryClient = useQueryClient()
  const { control, reset } = useFormContext<FormDataPage>()
  const { t } = useTranslation()
  const onClickSearch = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }
  const onClickClear = () => {
    reset({
      searchFilters: {
        leaveTypeCode: '',
        leaveTypeDescription: '',
        status: null
      }
    })
  }
  return (
    <Card>
      <CardHeader
        title={t('Search filters')}
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <Collapse in={isExpanded}>
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={4}>
            {/* Leave Type Code */}
            <Grid item xs={12} md={3}>
              <Controller
                name='searchFilters.leaveTypeCode'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('Leave Type Code')}
                    placeholder={t('Enter leave type code')}
                    value={field.value || ''}
                  />
                )}
              />
            </Grid>
            {/* Leave Type Description */}
            <Grid item xs={12} md={5}>
              <Controller
                name='searchFilters.leaveTypeDescription'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('Leave Type Description')}
                    placeholder={t('Enter leave type description')}
                    value={field.value || ''}
                  />
                )}
              />
            </Grid>
            {/* Status */}
            <Grid item xs={12} md={3}>
              <Controller
                name='searchFilters.status'
                control={control}
                render={({ field }) => (
                  <SelectCustom<StatusOption>
                    {...field}
                    label={t('Status')}
                    options={LEAVE_TYPE_STATUS_OPTIONS}
                    getOptionLabel={option => option.label}
                    getOptionValue={option => option.value}
                    placeholder={t('Select status')}
                    isClearable
                    classNamePrefix={'select'}
                  />
                )}
              />
            </Grid>
            {/* Buttons */}
            <Grid item xs={12}>
              <Button variant='contained' color='primary' onClick={onClickSearch} sx={{ mr: 2 }}>
                {t('Search')}
              </Button>
              <Button variant='tonal' color='secondary' onClick={onClickClear}>
                {t('Clear')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  )
}
export default LeaveTypeSettingSearchFilter
