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
  const [cachedData, setCachedData] = useState<{ url: string; params: URLParam[] } | null>(null)
  const [showRestoreHint, setShowRestoreHint] = useState(false)

  // 智能加载：优先使用当前页面URL，检测缓存差异
  useEffect(() => {
    const smartLoad = async () => {
      try {
        // 1. 先获取当前标签页 URL
        const currentTabUrl = await getCurrentTabUrl()
        console.log('📍 当前页面URL:', currentTabUrl)

        // 2. 检查缓存
        let cachedUrl = ''
        let cachedParams: URLParam[] = []

        if (typeof chrome !== 'undefined' && chrome.storage) {
          const result = await chrome.storage.local.get(['cachedUrl', 'cachedParams'])
          console.log('📦 读取缓存:', result)

          if (result.cachedUrl) {
            cachedUrl = result.cachedUrl
            cachedParams = result.cachedParams || []
          }
        }

        // 3. 智能判断使用哪个URL
        if (currentTabUrl) {
          // 如果当前页面URL与缓存URL相同，使用缓存（保留编辑状态）
          if (cachedUrl && currentTabUrl === cachedUrl) {
            console.log('✅ 当前页面与缓存相同，使用缓存数据')
            setCurrentUrl(cachedUrl)
            setOriginalUrl(cachedUrl)
            setParams(cachedParams.length > 0 ? cachedParams : [])
            if (cachedParams.length === 0) {
              parseURLParams(cachedUrl)
            }
          } else {
            // 如果不同，优先使用当前页面URL
            console.log('🔄 使用当前页面URL')
            setCurrentUrl(currentTabUrl)
            setOriginalUrl(currentTabUrl)
            parseURLParams(currentTabUrl)

            // 如果有缓存且与当前页面不同，保存缓存数据并显示恢复提示
            if (cachedUrl && cachedUrl !== currentTabUrl) {
              console.log('💾 检测到不同的缓存，显示恢复提示')
              setCachedData({ url: cachedUrl, params: cachedParams })
              setShowRestoreHint(true)
            }
          }
        } else if (cachedUrl) {
          // 如果无法获取当前页面URL，使用缓存
          console.log('⚠️ 无法获取当前页面URL，使用缓存')
          setCurrentUrl(cachedUrl)
          setOriginalUrl(cachedUrl)
          setParams(cachedParams)
        }
      } catch (error) {
        console.error('❌ 智能加载失败:', error)
      }
    }

    smartLoad()
  }, [])

  // 缓存当前 URL 和参数
  useEffect(() => {
    if (currentUrl && typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({
        cachedUrl: currentUrl,
        cachedParams: params
      }).then(() => {
        console.log('✅ 缓存成功:', { url: currentUrl, paramsCount: params.length })
      }).catch((error) => {
        console.error('❌ 缓存失败:', error)
      })
    }
  }, [currentUrl, params])

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
      const urlObj = new URL(currentUrl)
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

  // 恢复上次编辑的内容
  const handleRestoreCached = () => {
    if (cachedData) {
      console.log('🔄 恢复缓存数据')
      setCurrentUrl(cachedData.url)
      setOriginalUrl(cachedData.url)
      setParams(cachedData.params)
      setShowRestoreHint(false)
      setCachedData(null)
    }
  }

  // 关闭恢复提示
  const handleDismissRestore = () => {
    setShowRestoreHint(false)
    setCachedData(null)
  }

  return (
    <div className="w-96 bg-white">
      {/* 顶部区域 - 模式切换和二维码 */}
      <div className="p-3">
        <ModeSwitch mode={mode} onChange={handleModeChange} />

        {mode === 'generate' && (
          <div className="mt-3">
            <QRCodeDisplay url={currentUrl} />
          </div>
        )}
      </div>

      {/* 生成模式内容 */}
      {mode === 'generate' && (
        <>
          {/* 恢复缓存提示 */}
          {showRestoreHint && cachedData && (
            <div className="mx-3 mb-3 p-2.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-purple-900 mb-1">检测到上次编辑的内容 Previous Edit Detected</p>
                  <p className="text-xs text-purple-700 break-all font-mono mb-2">{cachedData.url}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRestoreCached}
                      className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                      恢复编辑 Restore
                    </button>
                    <button
                      onClick={handleDismissRestore}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      忽略 Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-3 pb-3">
            <URLInput
              url={currentUrl}
              onChange={handleUrlChange}
            />
          </div>

          <div className="px-3 pb-3">
            <URLParamsEditor
              params={params}
              onChange={handleParamsChange}
            />
          </div>

          <div className="px-3 pb-3">
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
        <div className="p-3">
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

          {decodeResult && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setDecodeResult(null)}
                className="btn-decode-back"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-semibold">重新解码 Decode Again</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
