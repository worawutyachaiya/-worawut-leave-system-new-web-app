import { useTranslation } from '@/contexts/TranslationContext'
import { Box, Card, CardContent, Button, Drawer } from '@mui/material'
import type { Theme } from '@mui/material/styles'
interface Props {
  mdAbove: boolean
  leftSidebarOpen: boolean
  handleLeftSidebarToggle: () => void
  handleAddEventClick: () => void
}
const FlexTimeSidebarLeft = ({ mdAbove, leftSidebarOpen, handleLeftSidebarToggle, handleAddEventClick }: Props) => {
  const { t } = useTranslation()
  const sidebarContent = (
    <Box sx={{ p: 4, width: mdAbove ? 300 : 240 }}>
      <Card sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Button variant='contained' color='primary' fullWidth onClick={handleAddEventClick}>
            {t('Flex Time Request')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
  if (mdAbove) {
    return (
      <Box
        sx={{
          width: 300,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        {sidebarContent}
      </Box>
    )
  }
  return (
    <Drawer
      open={leftSidebarOpen}
      onClose={handleLeftSidebarToggle}
      anchor='left'
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box'
        }
      }}
    >
      {sidebarContent}
    </Drawer>
  )
}
export default FlexTimeSidebarLeft
