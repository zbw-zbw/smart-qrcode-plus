import React from 'react';

export type Mode = 'generate' | 'decode';

interface ModeSwitchProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const ModeSwitch: React.FC<ModeSwitchProps> = ({ mode, onChange }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
      <button
        onClick={() => onChange('generate')}
        className={`mode-tab ${mode === 'generate' ? 'active' : 'inactive'}`}
      >
        🔧 生成模式
      </button>
      <button
        onClick={() => onChange('decode')}
        className={`mode-tab ${mode === 'decode' ? 'active' : 'inactive'}`}
      >
        🔍 解码模式
      </button>
    </div>
  );
};

export default ModeSwitch;
