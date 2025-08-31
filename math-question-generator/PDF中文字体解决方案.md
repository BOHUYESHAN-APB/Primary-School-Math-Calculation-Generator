# PDF导出中文字体解决方案

## 当前状态
- ✅ 修复了jsPDF字体编码错误
- ✅ 临时使用英文标题和表格头避免中文显示问题
- ✅ 确保PDF导出功能正常工作

## 问题原因
jsPDF默认不支持中文字体，直接添加`SimSun`字体会导致：
```
Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.
```

## 临时解决方案
1. 使用默认的`helvetica`字体
2. 标题和表格头使用英文
3. 数学表达式和数字可以正常显示

## 完整中文支持方案（未来实现）

### 方案1：使用字体文件
```javascript
import { jsPDF } from 'jspdf';
import fontBase64 from './fonts/simhei-font'; // 需要将字体转为base64

doc.addFileToVFS('simhei.ttf', fontBase64);
doc.addFont('simhei.ttf', 'simhei', 'normal');
doc.setFont('simhei');
```

### 方案2：使用在线字体服务
```javascript
// 使用Google Fonts或其他CDN
await loadGoogleFont('Noto Sans SC');
```

### 方案3：切换到其他库
- 使用`pdfmake`库，对中文支持更好
- 使用`puppeteer`生成PDF（需要服务器端）

## 当前功能
- ✅ 生成题目页面
- ✅ 生成答案页面（可选）
- ✅ 表格格式化
- ✅ 自动分页
- ✅ 文件下载

## 注意事项
- 数学表达式中的数字、运算符等可以正常显示
- 中文文字暂时不支持，显示为空白或方块
- 建议用户在需要中文内容时使用HTML导出功能