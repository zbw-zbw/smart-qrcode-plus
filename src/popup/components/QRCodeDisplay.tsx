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
      <div className="bg-gray-50 rounded-lg p-6 w-full">
        <div className="text-center text-gray-500">
          <div className="w-32 h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm">无效的 URL</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 w-full">
      <div className="flex justify-center">
        <QRCodeSVG
          value={url}
          size={240}
          level="M"
          includeMargin={false}
          className="block"
        />
      </div>
    </div>
  )
}

export default QRCodeDisplay 
 