import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:path_provider/path_provider.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';
import '../models/math_question.dart';
import '../views/settings_screen.dart';
import '../models/settings_model.dart';
import '../services/question_generator.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final settings = Provider.of<SettingsModel>(context);
    final questionGen = Provider.of<QuestionGenerator>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('小学数学题生成器'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => _navigateToSettings(context),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildSettingsPanel(settings),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => questionGen.generateQuestions(
                count: settings.questionCount,
                minNumber: settings.minNumber,
                maxNumber: settings.maxNumber,
                operations: settings.operations.toSet(),
                allowDecimal: settings.allowDecimal,
                allowNegative: settings.allowNegative,
                displayFormat: settings.displayFormat,
                showProcess: settings.showProcess,
              ),
              child: const Text('生成题目'),
            ),
            ElevatedButton(
              onPressed: questionGen.questions.isEmpty
                  ? null
                  : () => _exportQuestions(context),
              child: const Text('导出PDF'),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: questionGen.questions.length,
                itemBuilder: (context, index) =>
                    _buildQuestionItem(questionGen.questions[index]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsPanel(SettingsModel settings) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('当前设置:', style: TextStyle(fontWeight: FontWeight.bold)),
            Text('题目数量: ${settings.questionCount}'),
            Text('数字范围: ${settings.minNumber}-${settings.maxNumber}'),
            Text('运算类型: ${settings.operations.join(', ')}'),
            Text('输出格式: ${_getDisplayFormatText(settings.displayFormat)}'),
          ],
        ),
      ),
    );
  }

  String _getDisplayFormatText(DisplayFormat format) {
    switch (format) {
      case DisplayFormat.horizontal:
        return '横式';
      case DisplayFormat.vertical:
        return '竖式';
      case DisplayFormat.both:
        return '两者';
    }
  }

  Widget _buildQuestionItem(MathQuestion question) {
    return ListTile(
      title: Text('${question.expression}'),
      trailing: Text(question.answer),
    );
  }

  void _navigateToSettings(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const SettingsScreen()),
    );
  }

  void _exportQuestions(BuildContext context) {
    final questionGen = Provider.of<QuestionGenerator>(context, listen: false);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('导出PDF'),
        content: const Text('确认要导出题目到PDF吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _exportToPDF(context, questionGen.questions);
            },
            child: const Text('确认'),
          ),
        ],
      ),
    );
  }

  Future<void> _exportToPDF(
      BuildContext context, List<MathQuestion> questions) async {
    final PdfDocument pdfDoc = PdfDocument();
    final PdfPage page = pdfDoc.pages.add();
    final PdfFont font = PdfStandardFont(PdfFontFamily.helvetica, 12);

    // 添加标题
    page.graphics.drawString(
      '小学数学练习题',
      font,
      bounds: const Rect.fromLTWH(0, 0, 500, 30),
    );

    // 添加题目
    final PdfFont titleFont = PdfStandardFont(PdfFontFamily.helvetica, 16);
    final PdfFont expressionFont = PdfStandardFont(PdfFontFamily.helvetica, 14);
    page.graphics.drawString('小学数学练习题', titleFont,
        bounds: Rect.fromLTWH(0, 20, page.size.width, 30),
        format: PdfStringFormat(lineAlignment: PdfVerticalAlignment.middle));

    double yPos = 60;
    for (var question in questions) {
      final lines = question.expression.split('\n');
      double lineHeight = 0;

      for (var line in lines) {
        final Size textSize = expressionFont.measureString(line);
        final textWidth = textSize.width;
        page.graphics.drawString(
          line,
          expressionFont,
          bounds: Rect.fromLTWH(
              (page.size.width - textWidth) / 2, yPos, textWidth, 20),
        );
        yPos += 24;
        lineHeight += 24;
      }

      // 添加题目标号
      final index = questions.indexOf(question) + 1;
      page.graphics.drawString(
        '$index.',
        expressionFont,
        bounds: Rect.fromLTWH(30, yPos - lineHeight, 20, 20),
      );

      yPos += 16; // 题目间距
    }

    // 添加答案页（智能分栏版）
    PdfPage answerPage = pdfDoc.pages.add();
    final PdfFont answerTitleFont =
        PdfStandardFont(PdfFontFamily.helvetica, 20, style: PdfFontStyle.bold);
    final PdfFont answerFont = PdfStandardFont(PdfFontFamily.helvetica, 14);
    final PdfFont stepFont = PdfStandardFont(PdfFontFamily.helvetica, 12);
    final PdfPen borderPen = PdfPen(PdfColor(200, 200, 200), width: 0.5);

    // 绘制页眉
    answerPage.graphics.drawRectangle(
      brush: PdfSolidBrush(PdfColor(240, 240, 240)),
      bounds: Rect.fromLTWH(0, 0, answerPage.size.width, 40),
    );
    answerPage.graphics.drawString(
      '参考答案',
      answerTitleFont,
      bounds: Rect.fromLTWH(0, 10, answerPage.size.width, 30),
      format: PdfStringFormat(alignment: PdfTextAlignment.center),
    );

    // 分栏参数
    const int columns = 2;
    final double contentWidth = answerPage.size.width - 100;
    final double columnWidth = contentWidth / columns;
    double currentY = 60;
    int currentColumn = 0;

    // 遍历题目
    for (var question in questions) {
      final index = questions.indexOf(question) + 1;
      final answerContent = StringBuffer()
        ..writeln('第 $index 题')
        ..writeln('答案：${question.answer}');

      if (question.steps?.isNotEmpty ?? false) {
        answerContent.writeln('计算步骤：');
        for (var step in question.steps!) {
          answerContent.writeln('• $step');
        }
      }

      // 测量内容高度
      final textElement = PdfTextElement(
        text: answerContent.toString(),
        font: answerFont,
        format: PdfStringFormat(lineSpacing: 5.0),
      );

      final PdfLayoutResult layoutResult = textElement.draw(
        page: answerPage,
        bounds: Rect.fromLTWH(0, 0, columnWidth, double.infinity),
      )!;

      final textHeight = layoutResult.bounds.height;

      // 换页判断
      if (currentY + textHeight > answerPage.size.height - 50) {
        if (currentColumn < columns - 1) {
          // 换列
          currentColumn++;
          currentY = 60;
        } else {
          // 新建页面
          final newAnswerPage = pdfDoc.pages.add();
          newAnswerPage.graphics.drawRectangle(
            brush: PdfSolidBrush(PdfColor(240, 240, 240)),
            bounds: Rect.fromLTWH(0, 0, newAnswerPage.size.width, 40),
          );
          currentColumn = 0;
          currentY = 60;
          answerPage = newAnswerPage;
        }
      }

      // 绘制答案区块
      final answerBounds = Rect.fromLTWH(
        50 + currentColumn * columnWidth,
        currentY,
        columnWidth - 20,
        textHeight + 10,
      );

      // 绘制背景和边框
      answerPage.graphics.drawRectangle(
        brush: PdfSolidBrush(PdfColor(255, 255, 255)),
        pen: borderPen,
        bounds: answerBounds,
      );

      // 绘制答案内容
      textElement.draw(
        page: answerPage,
        bounds: Rect.fromLTWH(
          answerBounds.left + 5,
          answerBounds.top + 5,
          answerBounds.width - 10,
          answerBounds.height - 10,
        ),
      );

      currentY += textHeight + 20;
    }

    // 添加页脚
    final PdfFont footerFont = PdfStandardFont(PdfFontFamily.helvetica, 10);
    final String footerText = '生成时间：${DateTime.now().toLocal()}';
    answerPage.graphics.drawString(
      footerText,
      footerFont,
      bounds: Rect.fromLTWH(
        50,
        answerPage.size.height - 30,
        answerPage.size.width - 100,
        20,
      ),
      format: PdfStringFormat(alignment: PdfTextAlignment.right),
    );

    // 保存文件
    final output = await getApplicationDocumentsDirectory();
    final file = File(
        '${output.path}/math_questions_${DateTime.now().millisecondsSinceEpoch}.pdf');
    final List<int> bytes = await pdfDoc.save();
    await file.writeAsBytes(bytes, mode: FileMode.writeOnly);
    pdfDoc.dispose();

    // 使用新的context显示提示
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('PDF已保存至: ${file.path}')),
      );
    }
  }
}
