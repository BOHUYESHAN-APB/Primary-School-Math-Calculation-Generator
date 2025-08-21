# 小学数学题生成器

## 项目简介

小学数学题生成器是一个基于Flutter开发的跨平台应用程序，可以生成各种类型的数学练习题，包括整数和小数的加减乘除运算。该应用支持多种输出格式，并可以将生成的题目导出为PDF文件。

## 功能特性

- 支持生成1位数至6位数的整数运算题目
- 支持指定小数位数的小数运算题目
- 允许用户手动选择运算位数和运算类型
- 支持生成横式与竖式算式
- 能够汇总生成包含题目与对应答案的文档
- 具备题目自我纠错机制，避免出现除数为0等原则性错误
- 支持导出PDF格式文件
- 提供丰富的运算设置选项

## 技术架构

本项目采用Flutter框架开发，使用Dart语言编写，支持多端运行（PC、Mac、安卓、iOS）。

### 项目结构

```
lib/
├── main.dart                 # 应用入口
├── models/
│   ├── math_operation.dart   # 数学运算类型枚举
│   ├── math_question.dart    # 数学题目数据模型
│   └── settings_model.dart   # 设置数据模型
├── services/
│   └── question_generator.dart  # 题目生成服务
└── views/
    ├── home_screen.dart      # 主页界面
    └── settings_screen.dart  # 设置界面
```

## 开发环境

- Flutter 3.0+
- Dart 3.0+

## 安装依赖

在项目根目录下运行以下命令安装所有依赖：

```bash
flutter pub get
```

## 项目运行

连接设备或启动模拟器后，运行以下命令启动应用：

```bash
flutter run
```

## 项目结构

项目采用分层架构设计，各层职责如下：

- `lib/main.dart`: 应用入口点
- `lib/models/`: 数据模型层，包含数学运算类型、题目和设置模型
- `lib/services/`: 业务逻辑层，包含题目生成和导出服务
- `lib/views/`: UI层，包含主页和设置页面
- `lib/core/`: 核心工具和常量
- `lib/data/`: 数据访问层
- `lib/domain/`: 领域层，包含业务逻辑和用例
- `lib/presentation/`: 表示层，包含UI组件和状态管理

## 依赖库

- `flutter`: Google的UI工具包
- `pdf`: PDF生成库
- `path_provider`: 路径提供器
- `share_plus`: 分享功能支持

## 开发计划

详细的开发计划请参阅[项目开发计划.md](项目开发计划.md)文件。