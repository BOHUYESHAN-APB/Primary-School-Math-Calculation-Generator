

class _Numbers {
  final dynamic num1;
  final dynamic num2;
  
  _Numbers(this.num1, this.num2);
}

class MathProblem {
  final dynamic num1;
  final dynamic num2;
  final String operator;
  final String question;
  final String answer;
  final String verticalFormat;

  MathProblem({
    required this.num1,
    required this.num2,
    required this.operator,
    required this.question,
    required this.answer,
    required this.verticalFormat,
  });
}

class MathGenerator {
  final Random _random = Random();
  final Set<String> _problemSet = {};

  List<MathProblem> generateProblems(int count, Set<String> operators, {
    bool allowNegatives = false,
    bool allowDecimals = false,
    int maxDigits = 6
  }) {
    List<MathProblem> problems = [];
    _problemSet.clear();

    int min = 10;
    int max = pow(10, maxDigits).toInt();
    max = max > 10000 ? 10000 : max;

    while (problems.length < count) {
      String op = operators.elementAt(_random.nextInt(operators.length
import 'dart:math';

class _Numbers {
  final dynamic num1;
  final dynamic num2;
  
  _Numbers(this.num1, this.num2);
}

class MathProblem {
  final dynamic num1;
  final dynamic num2;
  final String operator;
  final String question;
  final String answer;
  final String verticalFormat;

  MathProblem({
    required this.num1,
    required this.num2,
    required this.operator,
    required this.question,
    required this.answer,
    required this.verticalFormat,
  });
}

class MathGenerator {
  final Random _random = Random();
  final Set<String> _problemSet = {};

  List<MathProblem> generateProblems(int count, Set<String> operators, {
    bool allowNegatives = false,
    bool allowDecimals = false,
    int maxDigits = 6
  }) {
    List<MathProblem> problems = [];
    _problemSet.clear();

    int min = 10;
    int max = pow(10, maxDigits).toInt();
      max = max > 10000 ? 10000 : max;

    while (problems.length < count) {
      String operator = operators.elementAt(_random.nextInt(operators.length));
      var nums = _generateNumbers(operator, min, max, allowNegatives, allowDecimals);
      
      String problemHash = "${nums.num1}${operator}${nums.num2}";
      if (_problemSet.contains(problemHash)) continue;

      _problemSet.add(problemHash);
      problems.add(MathProblem(
        num1: nums.num1,
        num2: nums.num2,
        operator: operator,
        question: _buildQuestion(nums.num1, nums.num2, operator, allowDecimals),
        answer: _calculateAnswer(nums.num1, nums.num2, operator, allowDecimals),
        verticalFormat: _buildVerticalFormat(nums.num1, nums.num2, operator),
      ));
    }
    return problems;
  }
      
  _Numbers _generateNumbers(String operator, int min, int max, bool allowNegatives, bool allowDecimals) {
    dynamic num1 = _random.nextInt(max - min + 1) + min;
    dynamic num2 = _random.nextInt(max - min + 1) + min;

    if (allowDecimals) {
      num1 = (num1 + _random.nextDouble()).toStringAsFixed(2);
      num2 = (num2 + _random.nextDouble()).toStringAsFixed(2);
    }

    // 处理减法负数问题
    if (operator == '-' && !allowNegatives && num1 < num2) {
      var temp = num1;
      num1 = num2;
      num2 = temp;
    }

    // 处理除法分母为零问题
    if (operator == '÷' && num2 == 0) {
      num2 = _random.nextInt(max - min + 1) + 1; // 确保分母至少为1
    }

    return _Numbers(num1, num2);
  }

  String _buildQuestion(dynamic num1, dynamic num2, String operator, bool allowDecimals) {
    final opSymbol = _getOperatorSymbol(operator);
    return '$num1 $opSymbol $num2 = ';
  }

  String _calculateAnswer(dynamic num1, dynamic num2, String operator, bool allowDecimals) {
    final n1 = num1 is String ? double.parse(num1) : num1.toDouble();
    final n2 = num2 is String ? double.parse(num2) : num2.toDouble();
    
    switch (operator) {
      case '+':
        return (n1 + n2).toStringAsFixed(allowDecimals ? 2 : 0);
      case '-':
        return (n1 - n2).toStringAsFixed(allowDecimals ? 2 : 0);
      case '×':
        return (n1 * n2).toStringAsFixed(allowDecimals ? 2 : 0);
      case '÷':
        if (n2 == 0) return 'Error';
        final result = n1 / n2;
        return result.toStringAsFixed(result.truncateToDouble() == result ? 0 : 2);
      default:
        return '0';
    }


为了系统性地解决文件中的多个问题，我们需要分步骤进行修改。以下是最终的解决方案：

<replace_in_file>
<path>primary_math_generator/lib/core/math_generator.dart</path>
<diff>
import 'dart:math';

class _Numbers {
  final dynamic num1;
  final dynamic num2;
  
  _Numbers(this.num1, this.num2);
}

class MathProblem {
  final dynamic num1;
  final dynamic num2;
  final String operator;
  final String question;
  final String answer;
  final String verticalFormat;

  MathProblem({
    required this.num1,
    required this.num2,
    required this.operator,
    required this.question,
    required this.answer,
    required this.verticalFormat,
  });
}

class MathGenerator {
  final Random _random = Random();
  final Set<String> _problemSet = {};

  List<MathProblem> generateProblems(int count, Set<String> operators, {
    bool allowNegatives = false,
    bool allowDecimals = false,
    int maxDigits = 6
  }) {
    List<MathProblem> problems = [];
    _problemSet.clear();

    int min = 10;
    int max = pow(10, maxDigits).toInt();
    max = max > 10000 ? 10000 : max;

    while (problems.length < count) {
      String op = operators.elementAt(_random.nextInt(operators.length
import 'dart:math';

class _Numbers {
  final dynamic num1;
  final dynamic num2;
  
  _Numbers(this.num1, this.num2);
}

class MathProblem {
  final dynamic num1;
  final dynamic num2;
  final String operator;
  final String question;
  final String answer;
  final String verticalFormat;

  MathProblem({
    required this.num1,
    required this.num2,
    required this.operator,
    required this.question,
    required this.answer,
    required this.verticalFormat,
  });
}

class MathGenerator {
  final Random _random = Random();
  final Set<String> _problemSet = {};

  List<MathProblem> generateProblems(int count, Set<String> operators, {
    bool allowNegatives = false,
    bool allowDecimals = false,
    int maxDigits = 6
  }) {
    List<MathProblem> problems = [];
    _problemSet.clear();

    int min = 10;
    int max = pow(10, maxDigits).toInt();
      max = max > 10000 ? 10000 : max;

    while (problems.length < count) {
      String op = operators.elementAt(_random.nextInt(operators.length));
      var nums = _generateNumbers(op, min, max, allowNegatives, allowDecimals);
      
      String problemHash = "${nums.num1}${operator}${nums.num2}";
      if (_problemSet.contains(problemHash)) continue;

      _problemSet.add(problemHash);
      problems.add(MathProblem(
        num1: nums.num1,
        num2: nums.num2,
        operator: operator,
        question: _buildQuestion(nums.num1, nums.num2, operator, allowDecimals),
        answer: _calculateAnswer(nums.num1, nums.num2, operator, allowDecimals),
        verticalFormat: _buildVerticalFormat(nums.num1, nums.num2, operator),
      ));
    }
    return problems;
  }
      
  _Numbers _generateNumbers(String operator, int min, int max, bool allowNegatives, bool allowDecimals) {
    dynamic num1 = _random.nextInt(max - min + 1) + min;
    dynamic num2 = _random.nextInt(max - min + 1) + min;

    if (allowDecimals) {
      num1 = (num1 + _random.nextDouble()).toStringAsFixed(2);
      num2 = (num2 + _random.nextDouble()).toStringAsFixed(2);
    }

    // 处理减法负数问题
    if (operator == '-' && !allowNegatives && num1 < num2) {
      var temp = num1;
      num1 = num2;
      num2 = temp;
    }

    // 处理除法分母为零问题
    if (operator == '÷' && num2 == 0) {
      num2 = _random.nextInt(max - min + 1) + 1; // 确保分母至少为1
    }

    return _Numbers(num1, num2);
  }

  String _buildQuestion(dynamic num1, dynamic num2, String operator, bool allowDecimals) {
    final opSymbol = _getOperatorSymbol(operator);
    return '$num1 $opSymbol $num2 = ';
  }

  String _calculateAnswer(dynamic num1, dynamic num2, String operator, bool allowDecimals) {
    final n1 = num1 is String ? double.parse(num1) : num1.toDouble();
    final n2 = num2 is String ? double.parse(num2) : num2.toDouble();
    
    switch (operator) {
      case '+':
        return (n1 + n2).toStringAsFixed(allowDecimals ? 2 : 0);
      case '-':
        return (n1 - n2).toStringAsFixed(allowDecimals ? 2 : 0);
      case '×':
        return (n1 * n2).toStringAsFixed(allowDecimals ? 2 : 0);
      case '÷':
        if (n2 == 0) return 'Error';
        final result = n1 / n2;
        return result.toStringAsFixed(result.truncateToDouble() == result ? 0 : 2);
      default:
        return '0';
    }
import 'dart:math';

class MathProblem {
  final dynamic num1;
  final dynamic num2;
  final String operator;
  final String question;
  final String answer;
  final String verticalFormat;

  MathProblem({
    required this.num1,
    required this.num2,
    required this.operator,
    required this.question,
    required this.answer,
    required this.verticalFormat,
  });
}

class MathGenerator {
  final Random _random = Random();
  final Set<String> _problemSet = {};

  List<MathProblem> generateProblems(int count, Set<String> operators, {
    bool allowNegatives = false,
    bool allowDecimals = false,
    int maxDigits = 6
  }) {
    List<MathProblem> problems = [];
    _problemSet.clear();

    int min = 10;
    int max = pow(10, maxDigits).toInt();
    max = max > 10000 ? 10000 : max;

    while (problems.length < count) {
      String operator = operators.elementAt(_random.nextInt(operators.length));
      var nums = _generateNumbers(operator, min, max, allowNegatives, allowDecimals);
      
      String problemHash = "${nums.num1}${operator}${nums.num2}";
      if (_problemSet.contains(problemHash)) continue;

      _problemSet.add(problemHash);
      problems.add(MathProblem(
