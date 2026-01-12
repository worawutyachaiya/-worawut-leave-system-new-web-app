import { useState } from 'react'
import type { Dispatch, MouseEvent, SetStateAction } from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import { ListItemIcon, ListItemText } from '@mui/material'
import type { MRT_Row, MRT_RowData } from 'material-react-table'
import dayjs from 'dayjs'
import { useCheckPermission } from '@/_template/CheckPermission'
import { ToastMessageError } from '@/components/ToastMessage'
import type { FlexTimeRequestData } from '@/_workspace/types/flex-time/FlexTimeInterface'
const ITEM_HEIGHT = 48
interface ActionsMenuProps<T extends MRT_RowData> {
  row: MRT_Row<T>
  rowSelected: MRT_Row<T> | null
  setRowSelected: Dispatch<SetStateAction<MRT_Row<T> | null>>
  isNeedEditDelete?: boolean
  MENU_ID: number
  onCancelRequest?: (row: MRT_Row<T>) => void
}
const ActionsMenu = <T extends MRT_RowData>({
  row,
  setRowSelected,
  isNeedEditDelete = true,
  MENU_ID,
  onCancelRequest
}: ActionsMenuProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setRowSelected(null)
    setAnchorEl(null)
  }
  const validateCancelRequest = (): boolean => {
    const rowData = row.original as unknown as FlexTimeRequestData
    if (rowData.INUSE === 0 || String(rowData.INUSE) === '0') {
      ToastMessageError({
        title: 'Cancel FlexTime Request',
        message: 'Cannot cancel because already cancelled !'
      })
      return false
    }
    const status = rowData.IS_APPROVER_APPROVED ?? rowData.FLEX_TIME_REQUEST_STATUS
    if (String(status) === '2') {
      ToastMessageError({
        title: 'Cancel FlexTime Request',
        message: 'Cannot cancel because already rejected !'
      })
      return false
    }
    const startDate = rowData.FLEX_TIME_REQUEST_START_DATE || rowData.START_DATE
    if (startDate) {
      const cancelCutoff = dayjs(startDate).startOf('day').add(8, 'hours').add(30, 'minutes')
      const now = dayjs()
      if (now.isAfter(cancelCutoff)) {
        ToastMessageError({
          title: 'Cancel FlexTime Request',
          message: 'คุณจำเป็นต้องยกเลิกล่วงหน้าอย่างน้อยก่อนเวลา 08:30 น. ของวันที่ใช้สิทธิ'
        })
        return false
      }
    }
    return true
  }
  const onClickCancelRequest = () => {
    if (!validateCancelRequest()) {
      setAnchorEl(null)
      return
    }
    setRowSelected(row)
    onCancelRequest?.(row)
    setAnchorEl(null)
  }
  const checkPermission = useCheckPermission()
  return (
    <>
      <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={handleClick}>
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        id='long-menu'
        anchorEl={anchorEl}
        onClose={handleClose}
        open={Boolean(anchorEl)}
        slotProps={{ paper: { style: { maxHeight: ITEM_HEIGHT * 4.5 } } }}
      >
        <MenuItem onClick={onClickCancelRequest}>
          <ListItemIcon>
            <i className='tabler-trash text-xl text-error' />
          </ListItemIcon>
          <ListItemText primary='Cancel Request' />
        </MenuItem>
      </Menu>
    </>
  )
}
export default ActionsMenu
