import 'dart:math';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';
import '../models/math_question.dart';
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
    required bool allowDecimals,
    required bool allowNegatives,
    required DisplayFormat displayFormat,
    required bool showSteps,
  }) {
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

      answer = _calculateAnswer(num1, num2, operation);

      _questions.add(MathQuestion(
        expression: expression,
        answer: answer,
        type: operation,
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

  String _calculateAnswer(int num1, int num2, MathOperation operation) {
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
    final PdfFont font = PdfStandardFont(PdfFontFamily.helvetica, 12);

    page.graphics.drawString('数学练习题', font,
        bounds: Rect.fromLTWH(0, 0, page.size.width, 30));

    double yPos = 40;
    for (var question in questions) {
      page.graphics.drawString(question.expression, font,
          bounds: Rect.fromLTWH(50, yPos, page.size.width - 100, 20));
      yPos += 24;
    }

    // 保存文件逻辑（需要实现）
    // final List<int> bytes = await pdf.save();
    // pdf.dispose();
  }
}
