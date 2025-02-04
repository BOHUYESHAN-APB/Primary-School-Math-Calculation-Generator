import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'core/math_generator.dart';

void main() => runApp(const MathGeneratorApp());

class MathGeneratorApp extends StatelessWidget {
  const MathGeneratorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '小学数学题生成器',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const GeneratorScreen(),
    );
  }
}

class GeneratorScreen extends StatefulWidget {
  const GeneratorScreen({super.key});

  @override
  _GeneratorScreenState createState() => _GeneratorScreenState();
}

class _GeneratorScreenState extends State<GeneratorScreen> {
  final _formKey = GlobalKey<FormState>();
  int _digitCount = 2;
  int _problemCount = 10;
  bool _allowDecimals = false;
  bool _allowNegatives = false;
  bool _showAnswers = false;
  final Set<String> _selectedOperators = {'+', '-'};
  List<MathProblem> _problems = [];
  final pdf = pw.Document();

  final Map<String, String> operatorNames = {
    '+': '加法',
    '-': '减法',
    '×': '乘法',
    '÷': '除法'
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('数学题生成器'),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf),
            onPressed: _generatePdf,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildNumberInput('计算位数（1-6）', _digitCount, (value) {
                _digitCount = int.parse(value);
              }),
              _buildNumberInput('题目数量', _problemCount, (value) {
                _problemCount = int.parse(value);
              }),
              _buildOperatorSelector(),
              _buildSwitch('允许小数', _allowDecimals, (value) {
                setState(() => _allowDecimals = value);
              }),
              _buildSwitch('允许负数', _allowNegatives, (value) {
                setState(() => _allowNegatives = value);
              }),
              _buildSwitch('显示答案', _showAnswers, (value) {
                setState(() => _showAnswers = value);
              }),
              Center(
                child: ElevatedButton(
                  onPressed: _generateProblems,
                  child: const Text('生成题目'),
                ),
              ),
              const SizedBox(height: 20),
              ..._buildProblemsList(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNumberInput(String label, int value, Function(String) onSaved) {
    return TextFormField(
      initialValue: value.toString(),
      decoration: InputDecoration(labelText: label),
      keyboardType: TextInputType.number,
      validator: (value) {
        if (value == null || int.tryParse(value) == null) return '请输入有效数字';
        final numValue = int.parse(value);
        if (label.contains('位数') && (numValue < 1 || numValue > 6)) {
          return '请输入1-6之间的数字';
        }
        return null;
      },
      onSaved: (value) => onSaved(value!),
    );
  }

  Widget _buildOperatorSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('选择运算符：'),
        Wrap(
          spacing: 8,
          children: operatorNames.entries.map((entry) {
            return FilterChip(
              label: Text(entry.value),
              selected: _selectedOperators.contains(entry.key),
              onSelected: (selected) {
                setState(() {
                  selected
                      ? _selectedOperators.add(entry.key)
                      : _selectedOperators.remove(entry.key);
                });
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildSwitch(String label, bool value, Function(bool) onChanged) {
    return SwitchListTile(
      title: Text(label),
      value: value,
      onChanged: onChanged,
    );
  }

  void _generateProblems() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      final generator = MathGenerator(
        maxDigits: _digitCount,
        allowDecimals: _allowDecimals,
        allowNegatives: _allowNegatives,
      );
      setState(() {
        _problems = generator.generateProblems(_problemCount, _selectedOperators);
      });
    }
  }

  List<Widget> _buildProblemsList() {
    return _problems.map((problem) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(problem.question, style: const TextStyle(fontSize: 18)),
            if (_showAnswers)
              Text('答案：${problem.answer}', 
                   style: TextStyle(color: Colors.green[700])),
          ],
        ),
      );
    }).toList();
  }

  Future<void> _generatePdf() async {
    pdf.addPage(
      pw.Page(
