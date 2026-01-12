import { useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import CircularProgress from '@mui/material/CircularProgress'
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { useDxContext } from '@/_template/DxContextProvider'
import { fetchSection } from '@/_workspace/react-select/async-promise-load-options/fetchSection'
import { fetchAllEmployee } from '@/_workspace/react-select/async-promise-load-options/fetchAllEmployee'
import type { FormDataPage } from './validationSchema'
import { PREFIX_QUERY_KEY_REMAIN_LEAVE } from '@/_workspace/react-query/hooks/useSearchRemainLeave'
function RemainLeaveSearchFilter() {
  const { setIsEnableFetching } = useDxContext()
  const [collapse, setCollapse] = useState(false)
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormDataPage>()
  const { isLoading, isSubmitting } = useFormState({ control })
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const handleClear = () => {
    setValue('searchFilters', {
      employeeCode: null,
      employeeName: null,
      section: null,
      startDate: null,
      department: null,
      leaveType: null
    } as any)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY_REMAIN_LEAVE] })
  }
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY_REMAIN_LEAVE] })
  }
  const onError: SubmitErrorHandler<FormDataPage> = errors => {
    console.log('Search Errors:', errors)
  }
  return (
    <Card>
      <CardHeader
        title={t('Search filters')}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
        action={
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
          </IconButton>
        }
      />
      <Collapse in={!collapse}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit, onError)}>
            <Grid container spacing={5}>
              {/* ------------- Employee Code ------------------------------------------------------------- */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.employeeCode'
                  control={control}
                  render={({ field: { onChange, ...fieldProps }, fieldState: { error } }) => (
                    <>
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        key={`${watch('searchFilters.section')?.SECTION}`}
                        placeholder={t('Enter Employee Code')}
                        label={t('Employee Code')}
                        classNamePrefix='select'
                        loadOptions={async inputValue => {
                          const employees = await fetchAllEmployee({
                            EMPLOYEE_CODE: inputValue || '',
                            SECT_NAME: watch('searchFilters.section')?.SECTION || ''
                          })
                          return employees.map(option => ({
                            ...option,
                            EMPLOYEE_CODE: option.EMPLOYEE_CODE ?? ''
                          }))
                        }}
                        onChange={value => {
                          onChange(value)
                        }}
                        getOptionValue={(option: any) => option.EMPLOYEE_CODE || option.FULL_NAME || ''}
                        getOptionLabel={(option: any) => {
                          const code = option.EMPLOYEE_CODE || option.EMP_ID || ''
                          const name = option.FULL_NAME || option.EMPLOYEE_FULL_NAME || option.EMPLOYEE_NAME || ''
                          if (name && code) return `${code} - ${name}`
                          if (name) return name
                          if (code) return code
                          return 'Unknown'
                        }}
                      />
                    </>
                  )}
                />
              </Grid>
              {/* ------------- Employee Name (text input) -------------------------------------------- */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.employeeName'
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <div className='flex flex-col w-[inherit]'>
                        <label className='custom-select-label'>{t('Employee Name')}</label>
                        <TextField
                          {...field}
                          fullWidth
                          size='small'
                          placeholder={t('Enter employee name')}
                          onChange={e => field.onChange(e.target.value)}
                          margin='none'
                          sx={{ '& .MuiInputBase-root': { height: 40 } }}
                        />
                      </div>
                    </>
                  )}
                />
              </Grid>
              {/* ------------- Section ------------------------------------------------------------- */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.section'
                  control={control}
                  render={({ field: { onChange, ...fieldProps }, fieldState: { error } }) => (
                    <>
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        placeholder={t('Select Section')}
                        label={t('Section')}
                        classNamePrefix='select'
                        loadOptions={(inputValue: any) => {
                          return fetchSection(inputValue || '') as any
                        }}
                        onChange={(value: any) => {
                          const mappedValue = value
                            ? {
                                SECTION: value.SECT_NAME || value.SECTION || '',
                                DEPARTMENT: value.DEPARTMENT || ''
                              }
                            : null
                          onChange(mappedValue)
                          setValue('searchFilters.employeeCode', null)
                          setValue('searchFilters.employeeName', null)
                        }}
                        getOptionValue={(option: any) => option.SECT_NAME || option.SECTION || ''}
                        getOptionLabel={(option: any) => option.SECT_NAME || option.SECTION || ''}
                      />
                    </>
                  )}
                />
              </Grid>
              {/* ------------- Action Buttons ------------------------------------------------------------- */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Search Button */}
                  <Button
                    variant='contained'
                    type='button'
                    onClick={() => handleSubmit(onSubmit, onError)()}
                    disabled={isSubmitting || isLoading}
                    startIcon={isSubmitting ? <CircularProgress size={16} color='inherit' /> : null}
                  >
                    {isSubmitting ? t('Searching') : t('Search')}
                  </Button>
                  {/* Clear Button */}
                  <Button
                    variant='tonal'
                    color='secondary'
                    type='button'
                    onClick={handleClear}
                    disabled={isSubmitting || isLoading}
                  >
                    {t('Clear')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Collapse>
    </Card>
  )
}
export default RemainLeaveSearchFilter
