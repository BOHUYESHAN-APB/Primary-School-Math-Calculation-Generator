import 'dart:math';

class MathProblem {
  final String question;
  final String answer;
  final String equation;

  MathProblem({required this.question, required this.answer, required this.equation});
}

class MathGenerator {
  final Random _random = Random();
  final int _maxDigits;
  final bool allowDecimals;
  final bool allowNegatives;
  final Set<String> _generatedProblems = {};

  final Set<String> _operators;
  
  MathGenerator({
    required int maxDigits,
    required this.allowDecimals,
    required this.allowNegatives,
    required Set<String> operators,
  }) : _maxDigits = maxDigits.clamp(1, 6),
       _operators = operators {
    if (operators.isEmpty) {
      throw ArgumentError('至少需要选择一个运算符');
    }
  }

  List<MathProblem> generateProblems(int count, Set<String> operators) {
    final problems = <MathProblem>[];
    final maxAttempts = count * 2;
    int attempts = 0;

    while (problems.length < count && attempts < maxAttempts) {
      attempts++;
      final operator = _getRandomOperator(operators);
      if (operator == null) continue;
      final problem = _generateProblem(operator);

      if (problem != null && _generatedProblems.add(problem.equation)) {
        problems.add(problem);
      }
    }

    return problems;
  }

  String? _getRandomOperator(Set<String> operators) {
    if (operators.isEmpty) return null;
    return operators.elementAt(_random.nextInt(operators.length));
  }

  MathProblem? _generateProblem(String? operator) {
    if (operator == null) return null;
    final num1 = _generateNumber();
    final num2 = _generateNumber();
    
    try {
      switch (operator) {
        case '+':
          return _createAddition(num1, num2);
        case '-':
          return _createSubtraction(num1, num2);
        case '×':
          return _createMultiplication(num1, num2);
        case '÷':
          return _createDivision(num1, num2);
        default:
          return null;
      }
    } catch (_) {
      return null;
    }
  }

  double _generateNumber() {
    final digits = _random.nextInt(_maxDigits) + 1;
    final number = _random.nextDouble() * pow(10, digits);
    return allowDecimals ? number : number.roundToDouble();
  }

  MathProblem _createAddition(double a, double b) {
    final result = a + b;
    return MathProblem(
      question: '${_formatNumber(a)} + ${_formatNumber(b)} =',
      answer: _formatNumber(result),
      equation: '${_normalize(a)}+${_normalize(b)}',
    );
  }

  MathProblem _createSubtraction(double a, double b) {
    if (!allowNegatives && a < b) {
      final temp = a;
      a = b;
      b = temp;
    }
    final result = a - b;
    return MathProblem(
      question: '${_formatNumber(a)} - ${_formatNumber(b)} =',
      answer: _formatNumber(result),
      equation: '${_normalize(a)}-${_normalize(b)}',
    );
  }

  MathProblem _createMultiplication(double a, double b) {
    final result = a * b;
    return MathProblem(
      question: '${_formatNumber(a)} × ${_formatNumber(b)} =',
      answer: _formatNumber(result),
      equation: '${_normalize(a)}×${_normalize(b)}',
    );
  }

  MathProblem? _createDivision(double a, double b) {
    if (b == 0) return null;
    if (!allowDecimals && a % b != 0) return null;
    
    final result = a / b;
    return MathProblem(
      question: '${_formatNumber(a)} ÷ ${_formatNumber(b)} =',
      answer: _formatNumber(result),
      equation: '${_normalize(a)}÷${_normalize(b)}',
    );
  }

  String _formatNumber(double num) {
    if (num % 1 == 0 || !allowDecimals) {
      return num.toInt().toString();
    }
    return num.toStringAsFixed(2).replaceAll(RegExp(r'0+$'), '').replaceAll(RegExp(r'\.$'), '');
  }

  String _normalize(double num) {
    return num.toStringAsFixed(allowDecimals ? 2 : 0);
  }
}
