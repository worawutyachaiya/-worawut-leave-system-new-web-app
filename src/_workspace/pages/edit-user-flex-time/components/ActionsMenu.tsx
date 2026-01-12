// React Imports
import { useState } from 'react'
import type { MouseEvent } from 'react'

// MUI Imports
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import { ListItemIcon, ListItemText } from '@mui/material'

// Material React Table Imports
import type { MRT_Row } from 'material-react-table'

// Types
import type { UserFlexTimeData } from '@/_workspace/types/flex-time/FlexTimeInterface'

// Translation
import { useTranslation } from '@/contexts/TranslationContext'

// Toast
import { toast } from 'react-toastify'

interface ActionsMenuProps {
  row: MRT_Row<UserFlexTimeData>
  onEdit: (row: UserFlexTimeData) => void
  onDelete: (row: UserFlexTimeData) => void
}

const ActionsMenu = ({ row, onEdit, onDelete }: ActionsMenuProps) => {
  const { t } = useTranslation()

  // States
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    if (row.original.INUSE !== 1) {
      toast.error(t('Cannot edit because already deleted !'))
      handleClose()
      return
    }
    onEdit(row.original)
    handleClose()
  }

  const handleDelete = () => {
    if (row.original.INUSE !== 1) {
      toast.error(t('Cannot delete because already deleted !'))
      handleClose()
      return
    }
    onDelete(row.original)
    handleClose()
  }

  return (
    <>
      <IconButton
        aria-label='more'
        aria-controls='actions-menu'
        aria-haspopup='true'
        onClick={handleClick}
      >
        <i className='tabler-dots-vertical' />
      </IconButton>

      <Menu
        keepMounted
        id='actions-menu'
        anchorEl={anchorEl}
        onClose={handleClose}
        open={Boolean(anchorEl)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <i className='tabler-edit text-xl' />
          </ListItemIcon>
          <ListItemText primary={t('Edit')} />
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <i className='tabler-trash text-xl text-error' />
          </ListItemIcon>
          <ListItemText primary={t('Delete')} />
        </MenuItem>
      </Menu>
    </>
  )
}

export default ActionsMenu
