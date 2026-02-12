import { Paper, Typography, Box, alpha, useTheme } from '@mui/material'

interface OptionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  isSelected: boolean
  onClick: () => void
}

const OptionCard = ({ title, description, icon, isSelected, onClick }: OptionCardProps) => {
  const theme = useTheme()

  return (
    <Paper
      elevation={isSelected ? 3 : 1}
      onClick={onClick}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: `2px solid ${isSelected ? theme.palette.primary.main : 'transparent'}`,
        borderRadius: 2,
        height: '100%',
        backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'all 0.2s',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.1)
        }
      }}
    >
      <Box sx={{ mb: 1, color: isSelected ? 'primary.main' : 'text.secondary' }}>{icon}</Box>
      <Typography variant='h6' color={isSelected ? 'primary' : 'textPrimary'} gutterBottom>
        {title}
      </Typography>
      <Typography variant='body2' color='textSecondary'>
        {description}
      </Typography>
    </Paper>
  )
}

export default OptionCard
