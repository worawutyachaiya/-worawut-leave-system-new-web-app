import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import DownloadIcon from '@mui/icons-material/Download'
import UploadIcon from '@mui/icons-material/Upload'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { useDownloadLeaveFile, downloadBlobAsFile } from '@/_workspace/react-query/hooks/useLeaveFile'
interface FileColumnProps {
  fileName?: string | null
  filePath?: string | null
  onClickUpload?: () => void
  showUploadButton?: boolean
  size?: 'small' | 'medium' | 'large'
}
const LeaveFileColumn = ({
  fileName,
  filePath,
  onClickUpload,
  showUploadButton = true,
  size = 'small'
}: FileColumnProps) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const { mutateAsync: downloadFile } = useDownloadLeaveFile(
    (response) => {
      if (response.data && fileName) {
        downloadBlobAsFile(response.data, fileName)
      }
      setIsDownloading(false)
    },
    (error) => {
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
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',justifyContent: 'center' }}>
        {/* ปุ่มดาวน์โหลด */}
        <Tooltip title={`Download: ${fileName}`}>
          <Button
            variant='contained'
            color='success'
            size={size}
            onClick={handleDownload}
            disabled={isDownloading}
            startIcon={isDownloading ? <CircularProgress size={16} color='inherit' /> : <DownloadIcon />}
          >
            {size === 'small' ? 'File' : 'Download'}
          </Button>
        </Tooltip>
        {/* ปุ่มอัพโหลดใหม่ */}
        {showUploadButton && onClickUpload && (
          <Tooltip title='Upload new file'>
            <Button
              variant='tonal'
              color='warning'
              size={size}
              onClick={onClickUpload}
              startIcon={<UploadIcon />}
            >
              {size === 'small' ? 'New' : 'Upload New'}
            </Button>
          </Tooltip>
        )}
      </Box>
    )
  }
  return (
    <Box>
      {showUploadButton && onClickUpload ? (
        <Tooltip title='Upload file'>
          <Button
            variant='tonal'
            color='warning'
            size={size}
            onClick={onClickUpload}
            startIcon={<UploadIcon />}
          >
            Upload
          </Button>
        </Tooltip>
      ) : (
        <Tooltip title='No file uploaded'>
          <Button
            variant='tonal'
            color='secondary'
            size={size}
            disabled
            startIcon={<InsertDriveFileIcon />}
          >
            No File
          </Button>
        </Tooltip>
      )}
    </Box>
  )
}
export default LeaveFileColumn
