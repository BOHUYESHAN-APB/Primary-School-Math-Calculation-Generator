# Microsoft Store 发布指南

## 1. 准备工作

### 开发者账户
- 注册Microsoft合作伙伴中心账户
- 完成开发者身份验证
- 支付注册费用（个人$19，公司$99）

### 应用要求
- Windows 10/11兼容
- 通过Windows App Cert Kit测试
- 符合Microsoft Store政策

## 2. 应用打包

### 生成MSIX包
```powershell
# 安装依赖
npm install

# 构建应用
npm run build

# 生成MSIX包
npm run windows:build

# 验证包
# 运行Windows App Cert Kit
```

### 应用清单配置
```xml
<!-- Package.appxmanifest -->
<Package>
  <Identity Name="AstraSynergy.MathGenerator" 
           Publisher="CN=Astra Synergy" 
           Version="1.0.0.0" />
  
  <Properties>
    <DisplayName>小学数学题目生成器</DisplayName>
    <PublisherDisplayName>Astra Synergy</PublisherDisplayName>
    <Description>智能生成小学数学计算题的教育工具</Description>
  </Properties>
  
  <Applications>
    <Application Id="MathGenerator"
                 Executable="MathGenerator.exe"
                 EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements DisplayName="数学题目生成器"
                          Square150x150Logo="assets/Square150x150Logo.png"
                          Square44x44Logo="assets/Square44x44Logo.png"
                          BackgroundColor="transparent" />
    </Application>
  </Applications>
</Package>
```

## 3. 应用商店信息

### 应用描述
**标题**: 小学数学题目生成器  
**副标题**: 智能AI辅助的数学练习题生成工具

**描述**:
小学数学题目生成器是一款专为教师、家长和学生设计的智能教育工具。它能够自动生成各种类型的小学数学练习题，支持加减乘除、分数、百分数、混合运算等多种题型。

**主要功能**:
- 🎯 智能题目生成：支持8种运算类型，35个知识点
- 📊 难度分级：10级难度体系，适应不同学习阶段
- 🤖 AI解答指导：提供详细解题步骤和学习建议
- 📄 多格式导出：支持PDF、HTML、DOCX格式
- 🌍 国际化支持：中英文双语界面
- 📱 响应式设计：支持桌面和移动设备

### 分类和标签
- **类别**: 教育
- **子类别**: 学习工具
- **标签**: 数学, 教育, 小学, 练习题, AI, 学习

### 屏幕截图要求
- **数量**: 至少3张，最多10张
- **尺寸**: 1366x768 或更高分辨率
- **格式**: PNG或JPG
- **内容**: 展示主要功能界面

## 4. 隐私和合规

### 隐私政策
```markdown
# 隐私政策

## 数据收集
本应用不收集任何个人信息或使用数据。

## 本地存储
- 应用设置和偏好存储在本地设备
- API密钥使用加密存储在本地
- 不会向第三方服务器发送个人数据

## 第三方服务
- 可选择使用第三方AI服务进行题目分析
- 用户自主配置API，我们不存储任何API密钥
```

### 年龄分级
- **适合年龄**: 3+ (所有年龄)
- **内容描述**: 教育内容，无不当内容

## 5. 提交流程

### 步骤1: 创建应用
1. 登录合作伙伴中心
2. 点击"创建新应用"
3. 保留应用名称

### 步骤2: 应用包
1. 上传MSIX文件
2. 系统自动验证包
3. 确认应用功能和权限

### 步骤3: 商店信息
1. 填写应用描述
2. 上传屏幕截图
3. 设置价格和可用性

### 步骤4: 提交审核
1. 完成所有必填项
2. 点击"提交到商店"
3. 等待审核（通常1-3个工作日）

## 6. 审核要点

### 技术要求
- ✅ 应用启动时间 < 5秒
- ✅ 内存使用合理
- ✅ 无崩溃和严重错误
- ✅ 响应式界面

### 内容要求
- ✅ 功能描述准确
- ✅ 界面截图清晰
- ✅ 无版权问题
- ✅ 符合教育内容标准

### 政策合规
- ✅ 隐私政策完整
- ✅ 数据处理透明
- ✅ 无广告或内购
- ✅ 适合目标年龄群体

## 7. 发布后维护

### 更新发布
```bash
# 更新版本号
# 构建新版本
npm run windows:build

# 在合作伙伴中心上传新包
# 填写更新说明
# 提交更新审核
```

### 用户反馈
- 监控应用评分和评论
- 及时响应用户问题
- 根据反馈改进功能

### 分析数据
- 查看下载量和使用数据
- 分析用户行为模式
- 优化应用性能和功能

---

**注意**: 发布到Microsoft Store需要时间和耐心，确保应用质量是成功的关键。