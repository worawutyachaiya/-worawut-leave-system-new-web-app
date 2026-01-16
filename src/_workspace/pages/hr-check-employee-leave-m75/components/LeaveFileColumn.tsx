import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import DownloadIcon from '@mui/icons-material/Download'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { useDownloadLeaveFile, downloadBlobAsFile } from '@/_workspace/react-query/hooks/useLeaveFile'
import { useTranslation } from '@/contexts/TranslationContext'
interface LeaveFileColumnProps {
  fileName?: string | null
  filePath?: string | null
  size?: 'small' | 'medium' | 'large'
}
const LeaveFileColumn = ({ fileName, filePath, size = 'large' }: LeaveFileColumnProps) => {
  const { t } = useTranslation()
  const [isDownloading, setIsDownloading] = useState(false)
  const { mutateAsync: downloadFile } = useDownloadLeaveFile(
    response => {
      if (response.data && fileName) {
        downloadBlobAsFile(response.data, fileName)
      }
      setIsDownloading(false)
    },
    error => {
      console.error('Download error:', error)
      setIsDownloading(false)
    }
  )
  const handleDownload = async () => {
    if (!fileName || !filePath) return
    setIsDownloading(true)
    try {
      await downloadFile({
        FILE_NAME: fileName,
        FILE_PATH: filePath
      })
    } catch (error) {
      setIsDownloading(false)
    }
  }
  if (filePath && fileName) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={`Download File: ${fileName}`}>
          <Button
            variant='contained'
            color='success'
            size={size}
            onClick={handleDownload}
            disabled={isDownloading}
            startIcon={isDownloading ? <CircularProgress size={16} color='inherit' /> : <DownloadIcon />}
          >
            {t('Download File')}
          </Button>
        </Tooltip>
      </Box>
    )
  }
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Tooltip title='No File Uploaded'>
        <Box component='span'>
          <Button variant='tonal' color='warning' size={size} disabled startIcon={<InsertDriveFileIcon />}>
            {t('No File')}
          </Button>
        </Box>
      </Tooltip>
    </Box>
  )
}
export default LeaveFileColumn
