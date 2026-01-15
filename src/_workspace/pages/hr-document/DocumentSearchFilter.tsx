import { useState } from 'react'

import { Button, Card, CardContent, CardHeader, Grid, Collapse, IconButton, CircularProgress } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

import { Controller, useFormContext } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

import CustomTextField from '@/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'

import { useCreate } from '@libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@utils/user-profile/userLoginProfile'

import { useDxContext } from '@/_template/DxContextProvider'

import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useHrDocument'

import { FormDataPage, statusOptions } from './validationSchema'
import { MENU_ID } from './env'
import { useTranslation } from '@/contexts/TranslationContext'

const DocumentSearchFilter = () => {
  const { t } = useTranslation()
  const [collapse, setCollapse] = useState(true)
  const { control, handleSubmit, setValue, getValues } = useFormContext<FormDataPage>()
  const { setIsEnableFetching, isEnableFetching } = useDxContext()
  const queryClient = useQueryClient()

  // Save user profile settings
  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          documentName: getValues('searchFilters.documentName'),
          status: getValues('searchFilters.status')
        },
        searchResults: {
          pageSize: getValues('searchResults.pageSize'),
          columnFilters: getValues('searchResults.columnFilters'),
          sorting: getValues('searchResults.sorting'),
          density: getValues('searchResults.density'),
          columnVisibility: getValues('searchResults.columnVisibility'),
          columnPinning: getValues('searchResults.columnPinning'),
          columnOrder: getValues('searchResults.columnOrder'),
          columnFilterFns: getValues('searchResults.columnFilterFns')
        }
      }
    }
    mutate(dataItem)
  }

  const onMutateSuccess = () => {}
  const onMutateError = (e: any) => {
    console.error('Save profile error:', e)
  }

  const { mutate } = useCreate(onMutateSuccess, onMutateError)

  const onSubmit = (data: FormDataPage) => {
    setValue('submittedFilters', data.searchFilters)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  const handleClear = () => {
    setValue('searchFilters', {
      documentName: '',
      status: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  return (
    <Card sx={{ marginBottom: 4 }}>
      <CardHeader
        title={t('Search filters')}
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <IconButton onClick={() => setCollapse(!collapse)}>
            {collapse ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <Collapse in={collapse} timeout='auto' unmountOnExit>
        <CardContent>
          <Grid container spacing={4}>
            {/*------------ Document Name ------------------*/}
            <Grid item xs={12} md={3}>
              <Controller
                name='searchFilters.documentName'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('Document Name')}
                    placeholder={t('Enter document name')}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            {/*------------ Status ------------------*/}
            <Grid item xs={12} md={3}>
              <Controller
                name='searchFilters.status'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <SelectCustom
                    {...field}
                    label={t('Status')}
                    placeholder={t('Select status')}
                    options={statusOptions}
                    isClearable
                    error={!!error}
                    classNamePrefix={'select'}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            {/*------------ Buttons ------------------*/}
            <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
              <Button
                type='button'
                variant='contained'
                color='primary'
                onClick={handleSubmit(onSubmit)}
                startIcon={isEnableFetching ? <CircularProgress size={16} color='inherit' /> : null}
                disabled={isEnableFetching}
              >
                {t('Search')}
              </Button>
              <Button type='button' variant='tonal' color='secondary' onClick={handleClear}>
                {t('Clear')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default DocumentSearchFilter
