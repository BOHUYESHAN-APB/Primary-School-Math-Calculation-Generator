import 'dart:math';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import '../models/math_question.dart';
import '../models/math_operation.dart';
import '../models/settings_model.dart';

/// 题目生成服务
class QuestionGenerator extends ChangeNotifier {
  /// 题目列表
  List<MathQuestion> _questions = [];
  
  /// 获取题目列表
  List<MathQuestion> get questions => _questions;
  
  /// 随机数生成器
  final Random _random = Random();
  
  /// 数字格式化器
  final _numberFormatter = NumberFormat('#.####');

  /// 生成题目
  void generateQuestions({
    required int count,
    required int minNumber,
    required int maxNumber,
    required Set<MathOperation> operations,
    required bool allowDecimal,
    required bool allowNegative,
    required DisplayFormat displayFormat,
    required bool showProcess,
    required int decimalPlaces,
  }) {
    _questions = [];

    for (int i = 0; i < count; i++) {
      // 生成数字
      final num1 = _generateNumber(minNumber, maxNumber, allowDecimal, decimalPlaces);
      final num2 = _generateNumber(minNumber, maxNumber, allowDecimal, decimalPlaces);
      
      // 选择运算类型
      final operation = operations.elementAt(_random.nextInt(operations.length));

      // 创建表达式
      String expression;
      switch (displayFormat) {
        case DisplayFormat.horizontal:
          expression = _createHorizontalExpression(num1, num2, operation);
          break;
        case DisplayFormat.vertical:
          expression = _createVerticalExpression(num1, num2, operation);
          break;
        case DisplayFormat.both:
          expression = _createHorizontalExpression(num1, num2, operation) +
              '\n' +
              _createVerticalExpression(num1, num2, operation);
          break;
      }

      // 计算答案
      final answer = _calculateAnswer(num1, num2, operation, allowNegative, allowDecimal);

      // 添加到题目列表
      _questions.add(MathQuestion(
        expression: expression,
        answer: answer,
        type: operation,
        showSteps: showProcess,
        showNegative: allowNegative,
        showDecimal: allowDecimal,
      ));
    }
    notifyListeners();
  }

  /// 生成数字
  num _generateNumber(int min, int max, bool allowDecimal, int decimalPlaces) {
    if (allowDecimal) {
      // 生成小数
      final intValue = _random.nextInt(max - min + 1) + min;
      final decimalValue = _random.nextInt(10^decimalPlaces) / (10^decimalPlaces);
      return (intValue + decimalValue);
    } else {
      // 生成整数
      return _random.nextInt(max - min + 1) + min;
    }
  }

  /// 创建横式表达式
  String _createHorizontalExpression(num num1, num num2, MathOperation operation) {
    return '$num1 ${operation.symbol} $num2 = ';
  }

  /// 创建竖式表达式
  String _createVerticalExpression(num num1, num num2, MathOperation operation) {
    return '''
  $num1
${operation.symbol} $num2
――――
    ''';
  }

  /// 计算答案
  String _calculateAnswer(num num1, num num2, MathOperation operation,
      bool allowNegative, bool allowDecimal) {
    // 处理负数结果
    if (operation == MathOperation.subtraction && !allowNegative) {
      if (num1 < num2) {
        // 交换数字以确保非负结果
        final temp = num1;
        num1 = num2;
        num2 = temp;
      }
    }

    // 处理小数结果
    if (operation == MathOperation.division && !allowDecimal) {
      // 调整数字以确保整数结果
      num2 = num2 != 0 ? num2 : 1; // 防止除零
      num1 = num1 - (num1 % num2); // 使num1能被num2整除
    }

    switch (operation) {
      case MathOperation.addition:
        return _numberFormatter.format(num1 + num2);
      case MathOperation.subtraction:
        return _numberFormatter.format(num1 - num2);
      case MathOperation.multiplication:
        return _numberFormatter.format(num1 * num2);
      case MathOperation.division:
        if (num2 == 0) return '未定义'; // 处理除零情况
        return _numberFormatter.format(num1 / num2);
      default:
        throw UnsupportedError('不支持的运算类型: $operation');
    }
  }

  /// 导出为PDF
  Future<void> exportToPDF(List<MathQuestion> questions) async {
    final pdf = pw.Document();
    
    // 添加题目页
    pdf.addPage(
      pw.Page(
        build: (pw.Context context) {
          return pw.Column(
            children: [
              pw.Header(
                level: 1,
                child: pw.Text(
                  '小学数学练习题',
                  style: pw.TextStyle(fontSize: 24),
                ),
              ),
              pw.SizedBox(height: 20),
              pw.Column(
                children: [
                  for (int i = 0; i < questions.length; i++)
                    pw.Padding(
                      padding: const pw.EdgeInsets.only(bottom: 10),
                      child: pw.Row(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text('${i + 1}.'),
                          pw.SizedBox(width: 10),
                          pw.Expanded(
                            child: pw.Text(
                              questions[i].expression,
                              style: const pw.TextStyle(fontSize: 14),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ],
          );
        },
      ),
    );

    // 添加答案页
    pdf.addPage(
      pw.Page(
        build: (pw.Context context) {
          return pw.Column(
            children: [
              pw.Header(
                level: 1,
                child: pw.Text(
                  '参考答案',
                  style: pw.TextStyle(fontSize: 24),
                ),
              ),
              pw.SizedBox(height: 20),
              pw.Column(
                children: [
                  for (int i = 0; i < questions.length; i++)
                    pw.Padding(
                      padding: const pw.EdgeInsets.only(bottom: 10),
                      child: pw.Text(
                        '${i + 1}. ${questions[i].answer}',
                        style: const pw.TextStyle(fontSize: 12),
                      ),
                    ),
                ],
              ),
            ],
          );
        },
      ),
    );

    // 保存PDF文件
    final output = await getTemporaryDirectory();
    final file = File('${output.path}/math_questions.pdf');
    await file.writeAsBytes(await pdf.save());
  }
}