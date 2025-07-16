import { QRCodeSVG } from 'qrcode.react'

interface QRCodeDisplayProps {
  url: string
}

const QRCodeDisplay = ({ url }: QRCodeDisplayProps) => {
  const isValidUrl = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  if (!url || !isValidUrl(url)) {
    return (
      <div className="flex justify-center">
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8">
          <div className="text-center text-gray-500">
            <div className="w-24 h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm">无效的 URL</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
        <QRCodeSVG
          value={url}
          size={180}
          level="M"
          includeMargin={false}
          className="block"
        />
      </div>
    </div>
  )
}

export default QRCodeDisplay 
