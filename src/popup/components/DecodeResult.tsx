import React from 'react';
import { DecodeResult as DecodeResultType } from './QRCodeDecoder';

interface DecodeResultProps {
  result: DecodeResultType;
  onCopy: () => void;
  onOpenLink: () => void;
  onEditParams: () => void;
}

const DecodeResult: React.FC<DecodeResultProps> = ({
  result,
  onCopy,
  onOpenLink,
  onEditParams,
}) => {
  const { content, type } = result;

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="text-green-600 text-lg">✅</div>
          <h3 className="text-sm font-medium text-green-800">解码成功</h3>
        </div>

        <div className="space-y-3">
          {/* 内容类型 */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-500">类型：</span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                type === 'url'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {type === 'url' ? '🔗 网址链接' : '📝 纯文本'}
            </span>
          </div>

          {/* 解码内容 */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-500">内容：</span>
            <div className="p-3 bg-white border border-gray-200 rounded-md">
              <div className="text-sm text-gray-800 break-all font-mono">
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* 复制按钮 */}
          <button onClick={onCopy} className="btn-decode-copy">
            <span>📋</span>
            <span>复制内容</span>
          </button>

          {/* 打开链接按钮 - 仅对URL显示 */}
          {type === 'url' && (
            <button onClick={onOpenLink} className="btn-decode-open">
              <span>🔗</span>
              <span>打开链接</span>
            </button>
          )}
        </div>

        {/* 编辑参数按钮 - 仅对URL显示 */}
        {type === 'url' && (
          <button onClick={onEditParams} className="btn-decode-edit">
            <span>⚙️</span>
            <span>编辑URL参数</span>
          </button>
        )}
      </div>

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 text-center">
        {type === 'url'
          ? '点击"编辑URL参数"可切换到生成模式继续编辑'
          : '纯文本内容已解码完成'}
      </div>
    </div>
  );
};

export default DecodeResult;
