import 'math_operation.dart';

class MathQuestion {
  final String expression;
  final String answer;
  final MathOperation type;
  final List<String>? steps;
  final bool showSteps;
  final bool showNegative;
  final bool showDecimal;

  const MathQuestion({
    required this.expression,
    required this.answer,
    required this.type,
    required this.showSteps,
    required this.showNegative,
    required this.showDecimal,
    this.steps,
  });
}
