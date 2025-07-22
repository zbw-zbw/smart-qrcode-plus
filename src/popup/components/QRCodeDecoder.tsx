import React, { useState, useRef, useCallback } from 'react'
import jsQR from 'jsqr'

export interface DecodeResult {
  content: string
  type: 'url' | 'text'
}

interface QRCodeDecoderProps {
  onDecodeSuccess: (result: DecodeResult) => void
}

const QRCodeDecoder: React.FC<QRCodeDecoderProps> = ({ onDecodeSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 解码图片函数
  const decodeImage = useCallback((imageElement: HTMLImageElement) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = imageElement.width
    canvas.height = imageElement.height
    ctx.drawImage(imageElement, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      const content = code.data
      const type = isValidUrl(content) ? 'url' : 'text'
      onDecodeSuccess({ content, type })
      setError('')
    } else {
      setError('未识别到二维码，请确保图片清晰且包含有效二维码')
    }
  }, [onDecodeSuccess])

  // 验证是否为有效URL
  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  // 处理文件上传
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择有效的图片文件')
      return
    }

    setIsLoading(true)
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        decodeImage(img)
        setIsLoading(false)
      }
      img.onerror = () => {
        setError('图片加载失败')
        setIsLoading(false)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [decodeImage])

  // 处理点击上传
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // 处理粘贴事件
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          handleFileUpload(file)
          e.preventDefault()
        }
      }
    }
  }, [handleFileUpload])

  // 验证URL格式
  const validateImageUrl = (url: string) => {
    // Base64格式检查
    if (url.startsWith('data:image/')) {
      return { valid: true, type: 'base64' }
    }
    
    // SVG格式检查
    if (url.startsWith('data:image/svg+xml')) {
      return { valid: true, type: 'svg' }
    }
    
    // URL格式检查
    try {
      const urlObj = new URL(url)
      const extension = urlObj.pathname.split('.').pop()?.toLowerCase()
      const supportedFormats = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']
      
      if (extension && supportedFormats.includes(extension)) {
        return { valid: true, type: 'url' }
      } else {
        return { valid: false, message: '请确保URL指向图片文件（支持png、jpg、gif、webp、svg等格式）' }
      }
    } catch {
      return { valid: false, message: '请输入有效的URL地址或Base64数据' }
    }
  }

  // 处理SVG转位图
  const convertSvgToCanvas = (svgData: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('SVG加载失败'))
      
      // 如果是data URL，直接使用
      if (svgData.startsWith('data:')) {
        img.src = svgData
      } else {
        // 如果是SVG代码，转换为data URL
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' })
        img.src = URL.createObjectURL(svgBlob)
      }
    })
  }

  // 处理网络图片URL解码
  const handleUrlDecode = () => {
    if (!imageUrl.trim()) {
      setError('请输入图片URL或Base64数据')
      return
    }

    // 验证URL格式
    const validation = validateImageUrl(imageUrl.trim())
    if (!validation.valid) {
      setError(validation.message || '格式错误')
      return
    }

    setIsLoading(true)
    setError('')

    // 检查是否为SVG格式
    if (imageUrl.startsWith('data:image/svg+xml')) {
      try {
        convertSvgToCanvas(imageUrl)
          .then((img) => {
            decodeImage(img)
            setIsLoading(false)
          })
          .catch(() => {
            setError('SVG格式二维码处理失败')
            setIsLoading(false)
          })
      } catch (error) {
        setError('SVG数据格式错误')
        setIsLoading(false)
      }
    } 
    // 检查是否为Base64格式
    else if (imageUrl.startsWith('data:image/')) {
      const img = new Image()
      img.onload = () => {
        decodeImage(img)
        setIsLoading(false)
      }
      img.onerror = () => {
        setError('Base64图片数据格式错误或不是有效的图片')
        setIsLoading(false)
      }
      img.src = imageUrl
    } else {
      // 普通URL处理
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        decodeImage(img)
        setIsLoading(false)
      }
      img.onerror = () => {
        setError('图片加载失败：可能是URL错误、图片不存在、或不支持跨域访问')
        setIsLoading(false)
      }
      img.src = imageUrl
    }
  }

  // 绑定粘贴事件
  React.useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        选择一种方式来解码二维码：
      </div>

      {/* 文件上传 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="space-y-2">
          <div className="text-2xl">📁</div>
          <button
            onClick={handleUploadClick}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
          >
            点击上传图片
          </button>
          <div className="text-xs text-gray-500">
            支持 PNG、JPG、JPEG、GIF、WebP、SVG 格式
          </div>
        </div>
      </div>

      {/* 粘贴提示 */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="text-lg">📋</div>
          <div className="text-sm text-gray-600">
            <strong>快捷粘贴：</strong>
            <br />
            截图后直接按 Ctrl+V 粘贴图片进行解码
          </div>
        </div>
      </div>

      {/* 网络图片URL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          🌐 输入图片地址：
        </label>
        <div className="text-xs text-gray-500 mb-2">
          支持格式：图片直链URL、Base64数据（图片需包含二维码）
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://a.com/qrcode.png 或 data:image/png;base64,..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleUrlDecode}
            disabled={isLoading || !imageUrl}
            className="btn-primary btn-sm"
          >
            解码
          </button>
        </div>
        
        {/* 使用说明 */}
        <div className="text-xs text-gray-400 space-y-1">
          <div>• 图片URL：如 https://cdn.example.com/qrcode.png</div>
          <div>• Base64位图：如 data:image/png;base64,iVBORw0...</div>
          <div>• SVG二维码：如 data:image/svg+xml;utf8,%3Csvg...</div>
          <div>• 图片必须包含可识别的二维码内容</div>
        </div>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">解码中...</span>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-600">❌ {error}</div>
        </div>
      )}

      {/* 隐藏的canvas用于图片处理 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default QRCodeDecoder 
 