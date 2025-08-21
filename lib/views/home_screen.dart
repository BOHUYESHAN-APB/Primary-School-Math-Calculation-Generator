import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import 'package:share_plus/share_plus.dart';
import '../models/math_question.dart';
import '../views/settings_screen.dart';
import '../models/settings_model.dart';
import '../services/question_generator.dart';
import '../models/math_operation.dart';

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
                operations: settings.operations,
                allowDecimal: settings.allowDecimal,
                allowNegative: settings.allowNegative,
                displayFormat: settings.displayFormat,
                showProcess: settings.showProcess,
                decimalPlaces: settings.decimalPlaces,
              ),
              child: const Text('生成题目'),
            ),
            ElevatedButton(
              onPressed: questionGen.questions.isEmpty
                  ? null
                  : () => _exportQuestions(context),
              child: const Text('导出PDF'),
            ),
            const SizedBox(height: 20),
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

  /// 构建设置面板
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
            Text('小数位数: ${settings.decimalPlaces}'),
            Text('运算类型: ${settings.operations.map((op) => op.displayName).join(', ')}'),
            Text('输出格式: ${_getDisplayFormatText(settings.displayFormat)}'),
            Text('显示计算过程: ${settings.showProcess ? '是' : '否'}'),
            Text('允许负数: ${settings.allowNegative ? '是' : '否'}'),
            Text('允许小数: ${settings.allowDecimal ? '是' : '否'}'),
          ],
        ),
      ),
    );
  }

  /// 获取显示格式文本
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

  /// 构建题目项
  Widget _buildQuestionItem(MathQuestion question) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4.0),
      child: ListTile(
        title: Text(question.expression),
        trailing: Text(question.answer),
      ),
    );
  }

  /// 导航到设置页面
  void _navigateToSettings(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const SettingsScreen()),
    );
  }

  /// 导出题目
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

  /// 导出为PDF
  Future<void> _exportToPDF(
      BuildContext context, List<MathQuestion> questions) async {
    try {
      final questionGen = Provider.of<QuestionGenerator>(context, listen: false);
      await questionGen.exportToPDF(questions);
      
      // 获取保存的PDF文件路径
      final output = await getTemporaryDirectory();
      final file = File('${output.path}/math_questions.pdf');
      
      // 分享PDF文件
      if (await file.exists()) {
        await Share.shareFiles([file.path], text: '小学数学练习题');
      }
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('PDF导出成功')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('PDF导出失败: $e')),
        );
      }
    }
  }
}