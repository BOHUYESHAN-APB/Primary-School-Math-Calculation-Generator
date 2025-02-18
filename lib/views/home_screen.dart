import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:docx_template/docx_template.dart' as docx;
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
              onPressed: () => questionGen.generateQuestions(settings),
              child: const Text('生成题目'),
            ),
            ElevatedButton(
              onPressed: questionGen.questions.isEmpty
                  ? null
                  : () => _exportQuestions(context),
              child: const Text('导出文档'),
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
            Text('数字范围: 10-${settings.numberRange}'),
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
      title: Text(question.expression),
      subtitle: question.process.isNotEmpty ? Text(question.process) : null,
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
        title: const Text('选择导出格式'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('PDF文档'),
              onTap: () {
                Navigator.pop(context);
                _exportToPDF(questionGen.questions);
              },
            ),
            ListTile(
              title: const Text('Word文档'),
              onTap: () {
                Navigator.pop(context);
                _exportToWord(questionGen.questions);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _exportToPDF(
      BuildContext context, List<MathQuestion> questions) async {
    final pdfDoc = pw.Document();
    pdfDoc.addPage(
      pw.Page(
        build: (pw.Context context) => pw.Column(
          children: questions.map((q) => pdf.Text(q.expression)).toList(),
        ),
      ),
    );

    final output = await getApplicationDocumentsDirectory();
    final file = File('${output.path}/math_questions.pdf');
    await file.writeAsBytes(await pdfDoc.save());

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('PDF已保存至: ${file.path}')),
    );
  }

  Future<void> _exportToWord(List<MathQuestion> questions) async {
    final docxDoc = docx.Document();
    docxDoc.addParagraph(docx.Paragraph()
      ..addText(questions.map((q) => q.expression).join('\n')));

    final output = await getApplicationDocumentsDirectory();
    final file = File('${output.path}/math_questions.docx');
    await file.writeAsBytes(await docxDoc.save());

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Word文档已保存至: ${file.path}')),
    );
  }
}
