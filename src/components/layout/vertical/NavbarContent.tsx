// Third-party Imports
import classnames from 'classnames'

import { useState, useEffect } from 'react'

// Type Imports
import type { NotificationsType } from '@components/layout/shared/NotificationsDropdown'

// Component Imports
import { Divider, IconButton, Tooltip, Typography } from '@mui/material'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'

import useMediaQuery from '@mui/material/useMediaQuery'

import { useTheme } from '@mui/material/styles'

import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import NavToggle from './NavToggle'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import ColorMode from '../shared/ColorMode'
import ModeScreenFullWidth from '../shared/ScreenFullWidthContainerSwitch'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useNotification } from '@/_workspace/react-query/hooks/useNotification'

import { CoolMode } from '@/components/magicui/cool-mode'
import { ModeDropdownToggler } from '../shared/ModeDropdownSwitch'

import { useTranslation } from '@/contexts/TranslationContext'

const NavbarContent = () => {
  const { t } = useTranslation()
  // States
  const [notifications, setNotifications] = useState<NotificationsType[]>([])

  const userData = getUserData()
  const { data: result } = useNotification(
    {
      EMPLOYEE_ID_REQUEST: userData?.EMPLOYEE_CODE
    },
    !!userData?.EMPLOYEE_CODE
  )

  useEffect(() => {
    if (result?.data?.ResultOnDb && Array.isArray(result.data.ResultOnDb)) {
      const rawResult = result.data.ResultOnDb
      const mappedNotifications: NotificationsType[] = []

      const leaveCount = rawResult[0]?.[0]?.TOTAL_COUNT_LEAVE || 0
      const flexCount = rawResult[1]?.[0]?.TOTAL_COUNT_FLEX_TIME || 0
      const timeRecordCount = rawResult[2]?.[0]?.TOTAL_COUNT_TIME_RECORD || 0

      if (leaveCount > 0) {
        mappedNotifications.push({
          avatarIcon: 'tabler-calendar-time',
          title: t('Leave Approval'),
          badgeContent: leaveCount,
          read: false,
          avatarColor: 'primary',
          path: '/leave-approval'
        })
      }

      if (flexCount > 0) {
        mappedNotifications.push({
          avatarIcon: 'tabler-clock',
          title: t('Flex Time Approval'),
          badgeContent: flexCount,
          read: false,
          avatarColor: 'error',
          path: '/flex-time-approval'
        })
      }

      if (timeRecordCount > 0) {
        mappedNotifications.push({
          avatarIcon: 'tabler-clipboard-check',
          title: t('Time Record Approval'),
          badgeContent: timeRecordCount,
          read: false,
          avatarColor: 'warning',
          path: '/time-record-approval'
        })
      }

      setNotifications(mappedNotifications)
    }
  }, [result, t])

  // Hooks
  const theme = useTheme()
  const belowMdScreen = useMediaQuery(theme.breakpoints.down('md'))
  const belowSmScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        {belowMdScreen === false &&
        (import.meta.env.VITE_ENV_NAME === 'DEV' || import.meta.env.VITE_ENV_NAME === 'SIT') ? (
          <div className='flex items-center gap-4'>
            <div className='flex justify-between items-center gap-4 is-full flex-wrap'>
              <Typography color='error.main'>{`Status : Testing (ใช้สำหรับ ทดสอบการใช้งาน เท่านั้น)`}</Typography>
            </div>
          </div>
        ) : null}
      </div>
      <div className='flex items-center'>
        {/* <CoolMode>
          <Tooltip title={t('Cool Mode')}>
            <IconButton className='text-textPrimary'>
              <i className='tabler-pacman text-[22px]' />
            </IconButton>
          </Tooltip>
        </CoolMode>
        <Divider className='mr-2' orientation='vertical' flexItem /> */}
        <LanguageDropdown />
        <ModeDropdownToggler />
        {belowSmScreen ? null : (
          <>
            <ModeScreenFullWidth />
            <Divider className='mr-2' orientation='vertical' flexItem />
          </>
        )}
        <ColorMode isShowPrimaryPalette={!belowSmScreen} />
        <NotificationsDropdown notifications={notifications} />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
