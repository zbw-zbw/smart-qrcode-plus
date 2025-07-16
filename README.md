# Smart QR Code Plus - 智能二维码生成浏览器扩展

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-red.svg)

一个基于 React + TypeScript + Tailwind CSS 开发的 Chrome 浏览器扩展，提供智能二维码生成和 URL 参数编辑功能。

## ✨ 功能特性

### 🎯 核心功能
- 🚀 **自动生成当前标签页二维码** - 打开即可看到当前页面二维码
- ✏️ **实时编辑 URL** - 默认编辑模式，自动聚焦，实时更新
- 🔧 **可视化参数编辑** - 智能解码显示，支持增删改
- 📋 **快捷操作** - 复制链接、复制/下载二维码、一键重置

### 🎨 用户体验
- ⚡ **实时预览** - 所有修改立即反映到二维码
- ⌨️ **键盘友好** - 支持 Enter、Esc 等快捷键操作
- 🔐 **智能编码** - 自动处理中文和特殊字符编码/解码
- 🎪 **流畅交互** - 紧凑布局，直观操作流程

## 🚀 快速开始

### 安装扩展

#### 方法一：直接使用（推荐）
1. **构建项目**：
   ```bash
   git clone https://github.com/your-username/smart-qrcode-plus.git
   cd smart-qrcode-plus
   npm install
   npm run build
   ```

2. **安装到Chrome**：
   - 打开 Chrome，访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `dist` 目录

#### 方法二：开发模式
```bash
npm run dev
```
然后在 Chrome 扩展页面加载项目根目录。

### 使用说明

1. **打开扩展**：点击 Chrome 工具栏中的扩展图标
2. **编辑 URL**：自动聚焦输入框，直接编辑当前页面链接
3. **管理参数**：
   - 点击参数进入编辑模式
   - 按 `Enter` 保存，`Esc` 取消
   - 点击 `+ 添加参数` 新增参数
4. **导出二维码**：使用底部按钮复制或下载二维码

### 键盘快捷键
- **URL 编辑**：打开即可编辑，实时生成二维码
- **参数编辑**：`Enter` 保存，`Esc` 取消，`Tab` 切换字段
- **添加参数**：`Enter` 快速添加，自动聚焦下一个字段

## 🛠 技术栈

- **前端框架**: React 18 + TypeScript
- **样式**: Tailwind CSS  
- **构建工具**: Vite + crxjs/vite-plugin
- **二维码生成**: qrcode + qrcode.react
- **扩展标准**: Chrome Manifest V3

## 📱 功能测试

安装后建议测试以下功能：
- [ ] 打开扩展弹窗，查看当前页面二维码
- [ ] 编辑 URL 地址，观察二维码实时更新
- [ ] 添加/修改/删除 URL 参数
- [ ] 复制链接和二维码到剪贴板
- [ ] 下载二维码图片
- [ ] 使用重置功能恢复原始 URL

## 🔧 开发指南

### 开发环境

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本  
npm run build

# 类型检查
npm run type-check
```

### 开发调试
- **开发模式**：代码修改后自动重新加载
- **构建模式**：需要重新构建后在扩展页面点击刷新

## 项目结构

```
smart-qrcode-plus/
├── src/
│   ├── popup/
│   │   ├── components/          # React 组件
│   │   │   ├── QRCodeDisplay.tsx
│   │   │   ├── URLInput.tsx
│   │   │   ├── URLParamsEditor.tsx
│   │   │   └── ActionButtons.tsx
│   │   ├── App.tsx             # 主应用组件
│   │   ├── index.tsx           # 入口文件
│   │   └── index.html          # HTML 模板
│   ├── utils/
│   │   └── chrome.ts           # Chrome API 工具函数
│   ├── styles/
│   │   └── index.css           # 全局样式
│   └── manifest.json           # 扩展配置文件
├── public/
│   └── icons/                  # 扩展图标
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 🔒 权限说明

此扩展仅请求最小必要权限：

- `activeTab`: 读取当前激活标签页的 URL
- `scripting`: 基础脚本执行权限  
- `storage`: 本地存储用户偏好设置

**隐私承诺**：所有操作均在本地完成，不涉及网络请求，保护您的隐私安全。

## 🐛 故障排除

### 常见问题

**Q: 扩展无法加载，提示"清单文件缺失"**
- A: 确保选择正确的目录（构建版本选择 `dist`，开发版本选择项目根目录）

**Q: Service Worker 注册失败**  
- A: 这是开发模式的正常现象，不影响扩展功能

**Q: TypeScript 编译错误**
- A: 运行 `npm run build` 确认是否有语法错误

**Q: 参数中文显示乱码**
- A: 已自动处理编码/解码，中文参数会正确显示和处理

### 图标配置（可选）

如需添加自定义图标：
1. 将 `public/icon.svg` 转换为 PNG（16、32、48、128px）
2. 保存到 `public/icons/` 目录
3. 在 `manifest.json` 中添加图标配置

## 🔮 开发计划

- [x] ✅ 项目架构搭建
- [x] ✅ 二维码基础功能  
- [x] ✅ URL 参数编辑功能
- [x] ✅ 用户体验优化 (v1.1.0)
- [ ] 🔄 设置页面和偏好配置
- [ ] 📚 历史记录和 URL 模板
- [ ] 🌐 国际化支持

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License 
