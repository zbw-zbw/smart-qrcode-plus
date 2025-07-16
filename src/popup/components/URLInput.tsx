import { useEffect, useRef } from 'react'

interface URLInputProps {
  url: string
  onChange: (url: string) => void
}

const URLInput = ({ url, onChange }: URLInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isValidUrl = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  // 实时更新URL
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newUrl = e.target.value
    onChange(newUrl)
  }

  // 自动聚焦
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      // 将光标移到末尾
      const length = inputRef.current.value.length
      inputRef.current.setSelectionRange(length, length)
    }
  }, [])

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        编辑链接：
      </label>
      
      <textarea
        ref={inputRef}
        value={url}
        onChange={handleChange}
        className={`w-full p-3 text-sm border rounded-md resize-none transition-colors ${
          !url || isValidUrl(url) 
            ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
            : 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
        }`}
        rows={3}
        placeholder="请输入完整的 URL..."
      />
      
      {url && !isValidUrl(url) && (
        <p className="text-xs text-red-600 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          无效的 URL 格式
        </p>
      )}
    </div>
  )
}

export default URLInput 
