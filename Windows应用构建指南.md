# Windows应用构建指南

本指南介绍如何将小学数学题目生成器打包为Windows桌面应用，生成EXE可执行文件和MSI安装包。

## 📋 构建要求

### 环境依赖
- Node.js (>=18.x)
- Python (>=3.8)
- npm 或 yarn

### 构建工具
- electron
- electron-builder

## 🛠️ 构建步骤

### 1. 安装构建依赖

```bash
# 进入项目根目录
cd "e:\CODE\Astra-Synergy\Primary-School-Math-Calculation-Generator"

# 安装Electron和构建工具
npm install electron electron-builder --save-dev

# 如果网络问题，使用国内镜像
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm config set electron_builder_binaries_mirror https://npmmirror.com/mirrors/electron-builder-binaries/
```

### 2. 构建前端应用

```bash
# 构建React前端
cd math-question-generator
npm run build
cd ..
```

### 3. 生成Windows可执行文件 (EXE)

```bash
# 生成Windows安装包 (NSIS格式)
npm run windows:build
```

输出文件位置：`dist/小学数学题目生成器 Setup *.exe`

### 4. 生成MSI安装包

```bash
# 生成MSI格式安装包
npm run windows:build-msi
```

输出文件位置：`dist/小学数学题目生成器 *.msi`

## 📁 构建配置

### package.json 配置说明

```json
{
  "main": "electron/main.js",
  "scripts": {
    "windows:prepare": "cd math-question-generator && npm run build",
    "windows:build": "npm run windows:prepare && electron-builder --win --x64",
    "windows:build-msi": "npm run windows:prepare && electron-builder --win --x64 --config.win.target=msi"
  },
  "build": {
    "appId": "com.astrasynergy.mathgenerator",
    "productName": "小学数学题目生成器",
    "directories": {
      "output": "dist"
    },
    "files": [
      "electron/**/*",
      "math-question-generator/dist/**/*",
      "mcp-server/**/*",
      "config/**/*",
      "package.json"
    ],
    "win": {
      "icon": "build/icon.ico",
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "msi": {
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

## 🎯 构建输出

### 生成的文件

1. **NSIS安装包** (默认)
   - 文件名：`小学数学题目生成器 Setup 1.0.0.exe`
   - 特点：体积较小，安装快速
   - 用途：一般用户安装

2. **MSI安装包**
   - 文件名：`小学数学题目生成器 1.0.0.msi`
   - 特点：企业级部署支持
   - 用途：企业环境或需要MSI部署的场景

### 文件位置
```
dist/
├── 小学数学题目生成器 Setup 1.0.0.exe  # NSIS安装包
├── 小学数学题目生成器 1.0.0.msi         # MSI安装包
└── win-unpacked/                        # 未打包的应用文件
    ├── 小学数学题目生成器.exe
    ├── resources/
    └── ...
```

## 🔧 故障排除

### 常见问题

1. **Electron下载失败**
   ```bash
   # 使用国内镜像
   npm config set electron_mirror https://npmmirror.com/mirrors/electron/
   ```

2. **构建失败 - Python依赖问题**
   ```bash
   # 确保Python环境正确
   cd mcp-server
   pip install -r requirements.txt
   ```

3. **图标文件问题**
   - 确保 `build/icon.ico` 文件存在
   - 图标格式：256x256 ICO格式

### 清理构建缓存

```bash
# 清理node_modules和构建缓存
rm -rf node_modules dist
npm install
```

## 📦 发布准备

### 版本管理

在 `package.json` 中更新版本号：
```json
{
  "version": "1.0.0"
}
```

### 代码签名（可选）

如需代码签名，在 `package.json` 中添加：
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "password"
    }
  }
}
```

## 🚀 快速构建

一键构建所有格式：

```bash
# 构建NSIS安装包
npm run windows:build

# 构建MSI安装包
npm run windows:build-msi
```

构建完成后，安装包文件将出现在 `dist/` 目录中，可直接分发给用户使用。