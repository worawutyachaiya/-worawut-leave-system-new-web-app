import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import TableChartIcon from '@mui/icons-material/TableChart'
import type { ViewType } from '@/_workspace/types/check-subordinate-time-record/CheckSubordinateTimeRecordTypes'

interface Props {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

function ViewToggle({ activeView, onViewChange }: Props) {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewType | null) => {
    if (newView !== null) {
      onViewChange(newView)
    }
  }

  return (
    <ToggleButtonGroup
      value={activeView}
      exclusive
      onChange={handleChange}
      aria-label='view toggle'
      size='small'
      sx={{
        '& .MuiToggleButton-root': {
          border: '1px solid',
          borderColor: 'primary.main',
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }
        }
      }}
    >
      <ToggleButton value='calendar' aria-label='calendar view' disabled>
        <CalendarMonthIcon fontSize='small' />
      </ToggleButton>
      <ToggleButton value='table' aria-label='table view'>
        <TableChartIcon fontSize='small' />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default ViewToggle
