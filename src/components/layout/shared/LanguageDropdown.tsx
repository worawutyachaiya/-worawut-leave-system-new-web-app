// React Imports
import { useRef, useState } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { Locale } from '@configs/i18n'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { useTranslation } from '@/contexts/TranslationContext'

type LanguageDataType = {
  langCode: Locale
  langName: string
}

// Vars - คงไว้ทั้งภาษาอังกฤษและไทย แต่ไม่ต้องใส่รูปธง
const languageData: LanguageDataType[] = [
  {
    langCode: 'en',
    langName: 'English'
  },
  {
    langCode: 'th',
    langName: 'ไทย'
  }
]

const LanguageDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  // Hooks
  const { settings } = useSettings()
  const { locale, setLocale } = useTranslation()

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleSelectLanguage = (langCode: Locale) => {
    setLocale(langCode)
    handleClose()
}

  return (
    <>
      {/* ส่วน Trigger: กลับมาใช้ไอคอน tabler-language เพียวๆ แบบเก่า */}
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <i className='tabler-language' />
      </IconButton>

      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-start'
        anchorEl={anchorRef.current}
        className='min-is-[160px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top' }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList onKeyDown={handleClose}>
                  {languageData.map(lang => (
                    <MenuItem
                      key={lang.langCode}
                      onClick={() => handleSelectLanguage(lang.langCode)}
                      selected={locale === lang.langCode}
                    >
                      {/* ส่วน Menu: แสดงแค่ชื่อภาษา ไม่แสดงธง */}
                      {lang.langName}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default LanguageDropdown
