import { useState, useEffect } from 'react'
import QRCodeDisplay from './components/QRCodeDisplay'
import URLInput from './components/URLInput'
import URLParamsEditor from './components/URLParamsEditor'
import ActionButtons from './components/ActionButtons'
import { getCurrentTabUrl } from '../utils/chrome'

export interface URLParam {
  key: string
  value: string
}

function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [params, setParams] = useState<URLParam[]>([])
  const [originalUrl, setOriginalUrl] = useState<string>('')

  // 获取当前标签页 URL
  useEffect(() => {
    getCurrentTabUrl().then((url) => {
      if (url) {
        setCurrentUrl(url)
        setOriginalUrl(url)
        parseURLParams(url)
      }
    })
  }, [])

  // 解析 URL 参数，支持自动 decode
  const parseURLParams = (url: string) => {
    try {
      const urlObj = new URL(url)
      const searchParams = urlObj.searchParams
      const paramsList: URLParam[] = []
      
      searchParams.forEach((value, key) => {
        try {
          // 尝试解码参数值，如果已经解码则保持原样
          const decodedValue = decodeURIComponent(value)
          paramsList.push({ 
            key: decodeURIComponent(key), 
            value: decodedValue 
          })
        } catch {
          // 如果解码失败，使用原始值
          paramsList.push({ key, value })
        }
      })
      
      setParams(paramsList)
    } catch (error) {
      console.error('Invalid URL:', error)
      setParams([])
    }
  }

  // 重新构建 URL，自动 encode 参数
  const rebuildURL = (newParams: URLParam[]) => {
    try {
      const urlObj = new URL(originalUrl)
      urlObj.search = ''
      
      newParams.forEach(param => {
        if (param.key.trim() && param.value.trim()) {
          // 自动编码参数键值
          urlObj.searchParams.append(
            encodeURIComponent(param.key.trim()), 
            encodeURIComponent(param.value.trim())
          )
        }
      })
      
      return urlObj.toString()
    } catch (error) {
      console.error('Error rebuilding URL:', error)
      return currentUrl
    }
  }

  // 更新 URL
  const handleUrlChange = (newUrl: string) => {
    setCurrentUrl(newUrl)
    parseURLParams(newUrl)
  }

  // 更新参数
  const handleParamsChange = (newParams: URLParam[]) => {
    setParams(newParams)
    const newUrl = rebuildURL(newParams)
    setCurrentUrl(newUrl)
  }

  // 恢复原始 URL
  const handleReset = () => {
    setCurrentUrl(originalUrl)
    parseURLParams(originalUrl)
  }

  return (
    <div className="w-96 bg-white">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800 mb-4">Smart QR Code Plus</h1>
        <QRCodeDisplay url={currentUrl} />
      </div>

      <div className="p-4">
        <URLInput 
          url={currentUrl}
          onChange={handleUrlChange}
        />
      </div>

      <div className="p-4 border-t border-gray-200">
        <URLParamsEditor 
          params={params}
          onChange={handleParamsChange}
        />
      </div>

      <div className="p-4 border-t border-gray-200">
        <ActionButtons 
          url={currentUrl}
          onReset={handleReset}
          hasChanges={currentUrl !== originalUrl}
        />
      </div>
    </div>
  )
}

export default App 
