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
import type { DocumentData } from '../modal/validationSchema'

interface ActionsMenuProps {
  row: MRT_Row<DocumentData>
  onDelete: (row: DocumentData) => void
}

const ActionsMenu = ({ row, onDelete }: ActionsMenuProps) => {
  // States
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleDelete = () => {
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
        <MenuItem onClick={handleDelete}>
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
