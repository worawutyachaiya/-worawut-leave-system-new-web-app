// React Imports
import { MouseEvent, useState } from 'react'

// MUI Imports
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

// Types
import type { MRT_Row } from 'material-react-table'
import type { UserLeaveInterface } from '@/_workspace/types/hr-user-leave/HrUserLeave'

import { useTranslation } from '@/contexts/TranslationContext'

interface ActionsMenuProps {
  row: MRT_Row<UserLeaveInterface>
  onEdit: (row: UserLeaveInterface) => void
  onDelete: (row: UserLeaveInterface) => void
}

const ActionsMenu = ({ row, onEdit, onDelete }: ActionsMenuProps) => {
  const { t } = useTranslation()
  // State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const rowOpen = Boolean(anchorEl)

  const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleRowOptionsClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    onEdit(row.original)
    handleRowOptionsClose()
  }

  const handleDelete = () => {
    onDelete(row.original)
    handleRowOptionsClose()
  }

  return (
    <>
      <IconButton size='small' onClick={handleRowOptionsClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        <MenuItem onClick={handleEdit} sx={{ '& svg': { mr: 2 } }}>
          <ListItemIcon>
            <EditIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText primary={t('Edit')} />
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
          <ListItemIcon>
            <DeleteIcon fontSize='small' color='error' />
          </ListItemIcon>
          <ListItemText primary={t('Delete')} />
        </MenuItem>
      </Menu>
    </>
  )
}

export default ActionsMenu
