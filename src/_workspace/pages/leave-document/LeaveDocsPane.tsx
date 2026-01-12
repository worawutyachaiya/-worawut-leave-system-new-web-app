import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Alert
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { useGetLeaveDocumentByTabPane, useDownloadLeaveDocument, downloadBlobAsFile } from '@/_workspace/react-query/hooks/useLeaveDocument'
import { ToastMessageError } from '@/components/ToastMessage'
import type { LeaveDocumentData } from '@/_workspace/types/leave-document/LeaveDocumentInterface'
interface LeaveDocsPaneProps {
  document: LeaveDocumentData | null
  tabIndex: number
}
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`leave-doc-tabpanel-${index}`}
      aria-labelledby={`leave-doc-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  )
}
const LeaveDocsPane = ({ document, tabIndex }: LeaveDocsPaneProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const { data: pdfData, isLoading: isPdfLoading, error: pdfError } = useGetLeaveDocumentByTabPane(
    { FILE_NAME: document?.LEAVE_REGULARITY_FILE_NAME || '' },
    undefined,
    undefined,
    !!document?.LEAVE_REGULARITY_FILE_NAME
  )
  const { mutateAsync: downloadFile, isPending: isDownloading } = useDownloadLeaveDocument(
    (data) => {
      if (data && document) {
        downloadBlobAsFile(data.data, `${document.LEAVE_REGULARITY_NAME}.pdf`)
      }
    },
    (error) => {
      ToastMessageError({ message: 'Download File: ' + error.message })
    }
  )
  useEffect(() => {
    if (pdfData?.data) {
      const blob = new Blob([pdfData.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [pdfData])
  const handleDownload = () => {
    if (document) {
      downloadFile({ FILE_NAME: document.LEAVE_REGULARITY_FILE_NAME })
    }
  }
  if (!document) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 4 }}>
        <Typography color='text.secondary'>กรุณาเลือกเอกสาร</Typography>
      </Box>
    )
  }
  if (isPdfLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color='text.secondary'>Loading Document...</Typography>
      </Box>
    )
  }
  if (pdfError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>
          ไม่สามารถโหลดเอกสารได้ กรุณาลองใหม่อีกครั้ง
        </Alert>
      </Box>
    )
  }
  return (
    <TabPanel value={tabIndex} index={tabIndex}>
      <Paper elevation={0} sx={{ p: 2 }}>
        {/* PDF Viewer */}
        <Box sx={{ mb: 2 }}>
          <object
            data={pdfUrl || ''}
            type='application/pdf'
            width='100%'
            height='650px'
            style={{ border: 'none' }}
          >
            <Typography>
              ไม่สามารถแสดง PDF ได้ กรุณาดาวน์โหลดไฟล์แทน
            </Typography>
          </object>
        </Box>
        {/* Download Section */}
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            If you can't see the document. Please download below.
          </Typography>
          <Button
            variant='contained'
            color='primary'
            startIcon={isDownloading ? <CircularProgress size={20} color='inherit' /> : <DownloadIcon />}
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download File'}
          </Button>
        </Box>
      </Paper>
    </TabPanel>
  )
}
export default LeaveDocsPane
