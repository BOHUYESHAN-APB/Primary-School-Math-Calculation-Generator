import 'package:flutter/foundation.dart';
import 'package:primary_school_math_calculation_generator/models/settings_model.dart';
import 'dart:math';

class MathQuestion {
  final String expression;
  final String process;
  final String answer;

  MathQuestion({
    required this.expression,
    required this.process,
    required this.answer,
  });
}

class QuestionGenerator extends ChangeNotifier {
  final Random _random = Random();
  final List<MathQuestion> _generatedQuestions = [];
  final Set<String> _questionHashes = {};

  List<MathQuestion> get questions => _generatedQuestions;

  void generateQuestions(SettingsModel settings) {
    _generatedQuestions.clear();
    _questionHashes.clear();

    while (_generatedQuestions.length < settings.questionCount) {
      // 生成10-10000范围内的随机数（包含边界值）
      final num1 = _random.nextInt(settings.numberRange - 10 + 1) + 10;
      final num2 = _random.nextInt(settings.numberRange - 10 + 1) + 10;
      // 验证数值范围
      if (num1 < 10 ||
          num1 > settings.numberRange ||
          num2 < 10 ||
          num2 > settings.numberRange) {
        continue;
      }
      final operation = settings.operations
          .elementAt(_random.nextInt(settings.operations.length));

      final question = _createQuestion(num1, num2, operation, settings);
      // 处理交换律重复问题
      final (orderedA, orderedB) = _orderOperands(num1, num2, operation);
      final hash = '${orderedA}_${operation}_${orderedB}';

      if (!_questionHashes.contains(hash)) {
        _generatedQuestions.add(question);
        _questionHashes.add(hash);
      }
    }
    notifyListeners();
  }

  (int, int) _orderOperands(int a, int b, String op) {
    if (op == '+' || op == '×') {
      return a <= b ? (a, b) : (b, a);
    }
    return (a, b);
  }

  String _buildExpression(int a, int b, String op, DisplayFormat format) {
    switch (op) {
      case '+':
        return format == DisplayFormat.vertical
            ? '  $a\n+ $b\n――――'
            : '$a + $b = ';
      case '-':
        return format == DisplayFormat.vertical
            ? '  $a\n- $b\n――――'
            : '$a - $b = ';
      case '×':
        return format == DisplayFormat.vertical
            ? '  $a\n× $b\n――――'
            : '$a × $b = ';
      case '÷':
        return format == DisplayFormat.vertical
            ? '  $a\n÷ $b\n――――'
            : '$a ÷ $b = ';
      default:
        return '';
    }
  }

  MathQuestion _createQuestion(
      int a, int b, String op, SettingsModel settings) {
    final displayFormat = settings.displayFormat;
    switch (op) {
      case '+':
        return MathQuestion(
          expression: _buildExpression(a, b, op, displayFormat),
          process: settings.showProcess ? '$a + $b = ${a + b}' : '',
          answer: '${a + b}',
        );
      case '-':
        final result = a - b;
        return MathQuestion(
          expression: displayFormat == DisplayFormat.vertical
              ? '  $a\n- $b\n――――'
              : '$a - $b = ',
          process: settings.showProcess
              ? (result >= 0 || settings.allowNegative
                  ? '$a - $b = $result'
                  : '$b - $a = ${b - a}')
              : '',
          answer: settings.allowNegative ? '$result' : '${(a - b).abs()}',
        );
      case '×':
        return MathQuestion(
          expression: displayFormat == DisplayFormat.vertical
              ? '  $a\n× $b\n――――'
              : '$a × $b = ',
          process: settings.showProcess ? '$a × $b = ${a * b}' : '',
          answer: '${a * b}',
        );
      case '÷':
        final divisor = b != 0 ? b : 1;
        final quotient = a ~/ divisor;
        final remainder = a % divisor;
        return MathQuestion(
          expression: displayFormat == DisplayFormat.vertical
              ? '  $a\n÷ $divisor\n――――'
              : '$a ÷ $divisor = ',
          process: settings.showProcess
              ? (remainder == 0
                  ? '$a ÷ $divisor = $quotient'
                  : '$a ÷ $divisor = $quotient 余 $remainder')
              : '',
          answer: remainder == 0
              ? '$quotient'
              : settings.allowDecimal
                  ? '${(a / divisor).toStringAsFixed(settings.decimalPlaces)}'
                  : '$quotient 余 $remainder',
        );
      default:
        throw UnsupportedError('不支持的运算符: $op');
    }
  }

  void clearQuestions() {
    _generatedQuestions.clear();
    _questionHashes.clear();
    notifyListeners();
  }
}
