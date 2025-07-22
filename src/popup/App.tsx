import { useState, useEffect } from 'react'
import QRCodeDisplay from './components/QRCodeDisplay'
import URLInput from './components/URLInput'
import URLParamsEditor from './components/URLParamsEditor'
import ActionButtons from './components/ActionButtons'
import ModeSwitch, { Mode } from './components/ModeSwitch'
import QRCodeDecoder from './components/QRCodeDecoder'
import DecodeResult from './components/DecodeResult'
import { DecodeResult as DecodeResultType } from './components/QRCodeDecoder'
import { getCurrentTabUrl } from '../utils/chrome'

export interface URLParam {
  key: string
  value: string
}

function App() {
  const [mode, setMode] = useState<Mode>('generate')
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [params, setParams] = useState<URLParam[]>([])
  const [originalUrl, setOriginalUrl] = useState<string>('')
  const [decodeResult, setDecodeResult] = useState<DecodeResultType | null>(null)

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

  // 处理模式切换
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    // 切换到解码模式时清除之前的解码结果
    if (newMode === 'decode') {
      setDecodeResult(null)
    }
  }

  // 处理解码成功
  const handleDecodeSuccess = (result: DecodeResultType) => {
    setDecodeResult(result)
  }

  // 处理复制解码结果
  const handleCopyDecodeResult = () => {
    if (decodeResult) {
      navigator.clipboard.writeText(decodeResult.content)
    }
  }

  // 处理打开解码的链接
  const handleOpenDecodeLink = () => {
    if (decodeResult && decodeResult.type === 'url') {
      chrome.tabs.create({ url: decodeResult.content })
    }
  }

  // 处理编辑解码的URL参数
  const handleEditDecodeParams = () => {
    if (decodeResult && decodeResult.type === 'url') {
      // 切换到生成模式并设置URL
      setMode('generate')
      setCurrentUrl(decodeResult.content)
      setOriginalUrl(decodeResult.content)
      parseURLParams(decodeResult.content)
      // 清除解码结果
      setDecodeResult(null)
    }
  }

  return (
    <div className="w-96 bg-white">
      <div className="p-3 border-b border-gray-200">
        {/* 简化的模式切换 - 去掉冗余标题 */}
        <ModeSwitch mode={mode} onChange={handleModeChange} />

        {/* 生成模式 - 二维码区域 */}
        {mode === 'generate' && (
          <div className="mt-3">
            <QRCodeDisplay url={currentUrl} />
          </div>
        )}
      </div>

      {/* 生成模式内容 */}
      {mode === 'generate' && (
        <>
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
        </>
      )}

      {/* 解码模式内容 */}
      {mode === 'decode' && (
        <div className="p-4">
          {!decodeResult ? (
            <QRCodeDecoder onDecodeSuccess={handleDecodeSuccess} />
          ) : (
            <DecodeResult
              result={decodeResult}
              onCopy={handleCopyDecodeResult}
              onOpenLink={handleOpenDecodeLink}
              onEditParams={handleEditDecodeParams}
            />
          )}
          
          {/* 返回按钮 - 当有解码结果时显示 */}
          {decodeResult && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setDecodeResult(null)}
                className="btn-decode-back"
              >
                <span>🔄</span>
                <span>重新解码</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App 
 