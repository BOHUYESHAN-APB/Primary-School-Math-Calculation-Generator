# 数字芽算(MathBud) - 小学数学题目生成器

## 项目简介

数字芽算(MathBud)是一个基于React + Electron开发的跨平台桌面应用程序，可以生成各种类型的数学练习题，包括整数和小数的加减乘除运算。该应用支持多种输出格式，并可以将生成的题目导出为PDF文件。

## 功能特性

- 支持生成1位数至6位数的整数运算题目
- 支持指定小数位数的小数运算题目
- 允许用户手动选择运算位数和运算类型
- 支持生成横式与竖式算式
- 能够汇总生成包含题目与对应答案的文档
- 具备题目自我纠错机制，避免出现除数为0等原则性错误
- 支持导出PDF格式文件
- 提供丰富的运算设置选项
- 集成AI智能解答功能（需要配置API密钥）
- 支持中英文界面切换
- 响应式设计，适配桌面端和移动端

## 技术架构

本项目采用现代化的前端技术栈：

### 前端技术栈
- React 18 + TypeScript
- Vite构建工具
- Tailwind CSS样式框架
- shadcn/ui组件库
- Electron桌面应用框架

### 后端服务
- Python FastAPI MCP服务器
- SymPy数学计算库
- AI模型集成（DeepSeek、OpenAI等）

### 项目结构

```
.
├── math-question-generator/     # React前端应用
│   ├── src/
│   │   ├── components/          # React组件
│   │   ├── lib/                 # 核心库和工具
│   │   └── App.tsx              # 应用入口
│   └── vite.config.ts           # Vite配置
├── electron/                    # Electron主进程
│   ├── main.js                  # 主进程文件
│   └── preload.js               # 预加载脚本
├── mcp-server/                  # Python后端服务
│   ├── main.py                  # FastAPI服务器
│   └── requirements.txt         # Python依赖
├── config/                      # 配置文件
│   └── app.yaml                 # 应用配置
└── build/                       # 构建资源
    └── icon.ico                 # 应用图标
```

## 开发环境

- Node.js (>=18.x)
- Python (>=3.8)
- npm 或 yarn

## 安装依赖

在项目根目录下运行以下命令安装所有依赖：

```bash
# 安装前端依赖
cd math-question-generator
npm install
cd ..

# 安装Python后端依赖
cd mcp-server
pip install -r requirements.txt
cd ..
```

## 项目运行

### 开发模式运行

```bash
# 启动前端开发服务器
cd math-question-generator
npm run dev

# 在另一个终端启动MCP服务器
cd mcp-server
python main.py
```

### 本地测试环境运行

```bash
# 运行环境检查
.\测试本地环境.bat

# 一键启动完整环境
.\启动完整本地环境.bat

# 或分别启动
.\启动MCP服务器.bat
.\启动本地应用.bat
```

## 构建Windows应用

### 构建要求
- Node.js (>=18.x)
- Python (>=3.8)
- electron-builder

### 构建步骤

```bash
# 安装Electron和构建工具
npm install electron electron-builder --save-dev

# 构建Windows可执行文件 (EXE)
npm run windows:build

# 构建MSI安装包
npm run windows:build-msi
```

详细构建指南请参阅[Windows应用构建指南.md](Windows应用构建指南.md)文件。

## AI功能配置

要使用AI智能解答功能，需要配置AI服务提供商的API密钥：

1. 启动应用并进入设置页面
2. 点击"AI设置"标签页
3. 选择AI服务提供商（如DeepSeek、OpenAI等）
4. 输入API密钥并保存
5. 测试连接成功后即可使用AI功能

详细使用指南请参阅[AI解答功能使用指南.md](AI解答功能使用指南.md)文件。

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目。

## 联系方式

项目维护者：Astra Synergy Team