import 'dart:math';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';
import '../models/math_question.dart';
import '../models/math_operation.dart';
import '../models/settings_model.dart';

class QuestionGenerator extends ChangeNotifier {
  List<MathQuestion> _questions = [];
  List<MathQuestion> get questions => _questions;
  final Random _random = Random();
  final _numberFormatter = NumberFormat('#.##');

  void generateQuestions({
    required int count,
    required int minNumber,
    required int maxNumber,
    required Set<MathOperation> operations,
    required bool allowDecimal,
    required bool allowNegative,
    required DisplayFormat displayFormat,
    required bool showProcess,
  }) {
    // 添加showSteps参数的使用
    // Implementation remains the same
    _questions = [];

    for (int i = 0; i < count; i++) {
      final num1 = _random.nextInt(maxNumber - minNumber + 1) + minNumber;
      final num2 = _random.nextInt(maxNumber - minNumber + 1) + minNumber;
      final operation =
          operations.elementAt(_random.nextInt(operations.length));

      String expression;
      String answer;

      // Handle different display formats
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

      answer =
          _calculateAnswer(num1, num2, operation, allowNegative, allowDecimal);

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

  String _createHorizontalExpression(
      int num1, int num2, MathOperation operation) {
    return '$num1 ${operation.symbol} $num2 = ';
  }

  String _createVerticalExpression(
      int num1, int num2, MathOperation operation) {
    return '''
  $num1
${operation.symbol} $num2
――――
    ''';
  }

  String _calculateAnswer(int num1, int num2, MathOperation operation,
      bool allowNegative, bool allowDecimal) {
    // Handle negative results
    if (operation == MathOperation.subtraction && !allowNegative) {
      if (num1 < num2) {
        // Swap numbers to ensure non-negative result
        final temp = num1;
        num1 = num2;
        num2 = temp;
      }
    }

    // Handle decimal results
    if (operation == MathOperation.division && !allowDecimal) {
      // Adjust numbers to ensure whole number result
      num2 = num2 != 0 ? num2 : 1; // Prevent division by zero
      num1 = num1 - (num1 % num2); // Make num1 divisible by num2
    }

    switch (operation) {
      case MathOperation.addition:
        return '${num1 + num2}';
      case MathOperation.subtraction:
        return '${num1 - num2}';
      case MathOperation.multiplication:
        return '${num1 * num2}';
      case MathOperation.division:
        return _numberFormatter.format(num1 / num2);
      default:
        throw UnsupportedError('Unsupported operation: $operation');
    }
  }

  Future<void> exportToPDF(List<MathQuestion> questions) async {
    final PdfDocument pdf = PdfDocument();
    final PdfPage page = pdf.pages.add();
    
    // Load Chinese font from assets
    final ByteData fontData = await rootBundle.load('assets/fonts/Sunflower-Medium.ttf');
    final PdfFont chineseFont = PdfTrueTypeFont(pdf, fontData.buffer.asUint8List());

    // Draw title with Chinese font
    page.graphics.drawString('数学练习题', chineseFont,
        bounds: Rect.fromLTWH(0, 0, page.size.width, 30));

    double yPos = 40;
    for (var question in questions) {
      page.graphics.drawString(question.expression, chineseFont,
          bounds: Rect.fromLTWH(50, yPos, page.size.width - 100, 20));
      yPos += 24;
    }

    // Add answer page
    final PdfPage answerPage = pdf.pages.add();
    yPos = 40;
    answerPage.graphics.drawString('参考答案', chineseFont,
        bounds: Rect.fromLTWH(0, 0, page.size.width, 30));
    
    for (var question in questions) {
      answerPage.graphics.drawString(
          '${question.expression} 答案: ${question.answer}', 
