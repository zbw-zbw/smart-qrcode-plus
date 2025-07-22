import { useState } from 'react'
import { URLParam } from '../App'

interface URLParamsEditorProps {
  params: URLParam[]
  onChange: (params: URLParam[]) => void
}

const URLParamsEditor = ({ params, onChange }: URLParamsEditorProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newParam, setNewParam] = useState({ key: '', value: '' })
  const [showAddForm, setShowAddForm] = useState(false)

  const handleEditParam = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...params]
    newParams[index] = { ...newParams[index], [field]: value }
    onChange(newParams)
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      setEditingIndex(null) // 回车保存并退出编辑
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation() // 阻止ESC键事件冒泡，避免关闭插件
      setEditingIndex(null) // ESC 退出编辑
    }
  }

  const handleDeleteParam = (index: number) => {
    const newParams = params.filter((_, i) => i !== index)
    onChange(newParams)
  }

  const handleAddParam = () => {
    if (newParam.key.trim() && newParam.value.trim()) {
      onChange([...params, { key: newParam.key.trim(), value: newParam.value.trim() }])
      setNewParam({ key: '', value: '' })
      setShowAddForm(false)
    }
  }

  // 处理添加参数的键盘事件
  const handleAddKeyDown = (e: React.KeyboardEvent, field: 'key' | 'value') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      if (field === 'key' && newParam.key.trim()) {
        // 如果在键输入框按回车，聚焦到值输入框
        const valueInput = e.currentTarget.parentElement?.parentElement?.querySelector('input[placeholder="参数值"]') as HTMLInputElement
        valueInput?.focus()
      } else if (field === 'value' && newParam.key.trim() && newParam.value.trim()) {
        // 如果在值输入框按回车且都有内容，添加参数
        handleAddParam()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation() // 阻止ESC键事件冒泡，避免关闭插件
      handleCancelAdd()
    }
  }

  const handleCancelAdd = () => {
    setNewParam({ key: '', value: '' })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">URL 参数列表：</h3>
      
      {params.length === 0 && !showAddForm && (
        <div className="text-sm text-gray-500 text-center py-4">
          暂无参数
        </div>
      )}

      <div className="space-y-2">
        {params.map((param, index) => (
          <div key={index} className="p-2 bg-gray-50 rounded-md space-y-2">
            {editingIndex === index ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600 w-8">键:</label>
                    <input
                      type="text"
                      value={param.key}
                      onChange={(e) => handleEditParam(index, 'key', e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="参数名"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600 w-8">值:</label>
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => handleEditParam(index, 'value', e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="参数值"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  提示：按 Enter 保存，按 Esc 取消
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-gray-800 break-all">
                      {param.key}
                    </span>
                    <span className="text-gray-400">=</span>
                    <span className="text-xs font-mono text-gray-600 break-all">
                      {param.value}
                    </span>
                  </div>
                  {/* 显示解码后的值，如果不同的话 */}
                  {(() => {
                    try {
                      const decoded = decodeURIComponent(param.value)
                      return decoded !== param.value && (
                        <div className="mt-1 text-xs text-blue-600">
                          解码: {decoded}
                        </div>
                      )
                    } catch {
                      return null
                    }
                  })()}
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => setEditingIndex(index)}
                    className="p-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                    title="编辑"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteParam(index)}
                    className="p-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                    title="删除"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

        ))}
      </div>

      {showAddForm ? (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md space-y-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-600 w-8">键:</label>
              <input
                type="text"
                value={newParam.key}
                onChange={(e) => setNewParam({ ...newParam, key: e.target.value })}
                onKeyDown={(e) => handleAddKeyDown(e, 'key')}
                placeholder="参数名"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-600 w-8">值:</label>
              <input
                type="text"
                value={newParam.value}
                onChange={(e) => setNewParam({ ...newParam, value: e.target.value })}
                onKeyDown={(e) => handleAddKeyDown(e, 'value')}
                placeholder="参数值"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              提示：按 Enter 快速添加，按 Esc 取消
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleAddParam}
                disabled={!newParam.key.trim() || !newParam.value.trim()}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                添加
              </button>
              <button
                onClick={handleCancelAdd}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2 text-xs text-blue-600 border border-blue-300 border-dashed rounded-md hover:bg-blue-50"
        >
          + 添加参数
        </button>
      )}
    </div>
  )
}

export default URLParamsEditor 
 