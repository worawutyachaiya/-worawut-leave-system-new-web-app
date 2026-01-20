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
import { LeaveHistoryInterface } from '@/_workspace/types/leave-history/LeaveHistoryInterface'
const ITEM_HEIGHT = 48
interface ActionsMenuProps<T extends MRT_RowData> {
  row: MRT_Row<T>
  rowSelected: MRT_Row<T> | null
  setRowSelected: Dispatch<SetStateAction<MRT_Row<T> | null>>
  isNeedEditDelete?: boolean
  isProductMain?: boolean
  MENU_ID: number
  onCancelRequest?: (row: MRT_Row<T>) => void
}
const ActionsMenu = <T extends MRT_RowData>({
  row,
  setRowSelected,
  isNeedEditDelete = true,
  isProductMain,
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
    const rowData = row.original as LeaveHistoryInterface
    if (rowData.INUSE === 0 || rowData.INUSE === '0') {
      ToastMessageError({
        title: 'Cancel Leave Request',
        message: 'Cannot cancel because already cancelled !'
      })
      return false
    }
    const pcode = rowData.PCODE?.toString() || ''
    const isSpecialPcode = pcode.startsWith('S') || pcode.startsWith('M') || pcode.startsWith('E')
    if (!isSpecialPcode && rowData.IS_APPROVER_APPROVED === '1') {
      ToastMessageError({
        title: 'Cancel Leave Request',
        message: 'คุณไม่สามารถยกเลิกได้ เพราะได้รับการอนุมัติแล้ว'
      })
      return false
    }
    const startDate = dayjs(rowData.LEAVE_REQUEST_START_DATE, 'YYYY-MM-DD')
    const today = dayjs().startOf('day')
    if (startDate.isSame(today) || startDate.isBefore(today)) {
      ToastMessageError({
        title: 'Cancel Leave Request',
        message: 'คุณจำเป็นต้องยกเลิกล่วงหน้าอย่างน้อย 1 วัน'
      })
      return false
    }
    if (rowData.LEAVE_REQUEST_STATUS === '2') {
      ToastMessageError({
        title: 'Cancel Leave Request',
        message: 'Cannot cancel because already rejected !'
      })
      return false
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
      {row?.original?.inuseForSearch != 0 &&
        (isNeedEditDelete && (row?.original?.inuseForSearch === 1 || row?.original?.inuseForSearch === 3) ? (
          <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={handleClick}>
            <i className='tabler-dots-vertical' />
          </IconButton>
        ) : (
          <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={handleClick}>
            <i className='tabler-dots-vertical' />
          </IconButton>
        ))}
      <Menu
        keepMounted
        id='long-menu'
        anchorEl={anchorEl}
        onClose={handleClose}
        open={Boolean(anchorEl)}
        slotProps={{ paper: { style: { maxHeight: ITEM_HEIGHT * 4.5 } } }}
      >
        {/* <MenuItem
          disabled={row?.original?.inuseForSearch == 0}
          onClick={() => {
              console.log('Edit clicked')
          }}
        >
          <ListItemIcon>
            <i className='tabler-edit text-xl' />
          </ListItemIcon>
          <ListItemText primary='Edit' />
        </MenuItem> */}
        {/* ) */}
        {/* : isProductMain ? (
          <MenuItem onClick={onClickEdit}>
            <ListItemIcon>
              <i className='tabler-edit text-xl' />
            </ListItemIcon>
            <ListItemText primary='Edit' />
          </MenuItem>
        )  */}
        {/* <Divider /> */}
        {/* {row?.original?.inuseForSearch === 1 ? (
          <MenuItem onClick={onClickDelete}>
            <ListItemIcon>
              <i className='tabler-trash text-xl' color='red' />
            </ListItemIcon>ฎ
            <ListItemText primary='Delete' />
          </MenuItem>
        ) : null} */}
        <MenuItem
          onClick={() => {
            onClickCancelRequest()
          }}
        >
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
