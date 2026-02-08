import { useState } from 'react'
import QRCode from 'qrcode'
import { copyToClipboard, downloadFile } from '../../utils/chrome'

interface ActionButtonsProps {
  url: string
  onReset: () => void
  hasChanges: boolean
}

const ActionButtons = ({ url, onReset, hasChanges }: ActionButtonsProps) => {
  const [copyStatus, setCopyStatus] = useState<{[key: string]: boolean}>({})

  const showCopyFeedback = (key: string) => {
    setCopyStatus(prev => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setCopyStatus(prev => ({ ...prev, [key]: false }))
    }, 2000)
  }

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(url)
    if (success) {
      showCopyFeedback('url')
    }
  }

  const handleCopyQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      const response = await fetch(dataUrl)
      const blob = await response.blob()

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ])

      showCopyFeedback('qrcode')
    } catch (error) {
      console.error('Error copying QR code:', error)
      try {
        const dataUrl = await QRCode.toDataURL(url)
        await copyToClipboard(dataUrl)
        showCopyFeedback('qrcode')
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
      }
    }
  }

  const handleDownloadQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      downloadFile(dataUrl, `qrcode_${timestamp}.png`)
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleCopyUrl}
          className="btn-copy btn-icon"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="font-semibold">{copyStatus.url ? '已复制 Copied!' : '复制链接 Copy URL'}</span>
        </button>

        <button
          onClick={handleCopyQRCode}
          className="btn-copy-qr btn-icon"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-semibold">{copyStatus.qrcode ? '已复制 Copied!' : '复制码图 Copy QR'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownloadQRCode}
          className="btn-download btn-icon"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="font-semibold">下载码图 Download</span>
        </button>

        <button
          onClick={onReset}
          disabled={!hasChanges}
          className="btn-reset btn-icon"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="font-semibold">重置 Reset</span>
        </button>
      </div>
    </div>
  )
}

export default ActionButtons 
 