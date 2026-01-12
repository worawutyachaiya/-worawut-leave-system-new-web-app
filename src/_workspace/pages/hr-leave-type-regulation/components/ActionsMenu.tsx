// MUI Imports
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'

// React Imports
import { MouseEvent, useState } from 'react'
import type { MRT_Row } from 'material-react-table'
import type { LeaveTypeRegulationData } from '../modal/validationSchema'

interface ActionsMenuProps {
  row: MRT_Row<LeaveTypeRegulationData>
  onEdit: (row: LeaveTypeRegulationData) => void
  onDelete: (row: LeaveTypeRegulationData) => void
}

const ActionsMenu = ({ row, onEdit, onDelete }: ActionsMenuProps) => {
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
        <i className='tabler-dots-vertical' />
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
            <i className='tabler-edit text-xl' />
          </ListItemIcon>
          <ListItemText primary='Edit' />
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
          <ListItemIcon>
            <i className='tabler-trash text-xl text-error' />
          </ListItemIcon>
          <ListItemText primary='Delete' />
        </MenuItem>
      </Menu>
    </>
  )
}

export default ActionsMenu
