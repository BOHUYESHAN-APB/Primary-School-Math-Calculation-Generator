import 'settings_model.dart';
import 'math_operation.dart';

class MathQuestion {
  final String expression;
  final String answer;
  final MathOperation type;
  final List<String>? steps;
  final bool showSteps;

  MathQuestion({
    required this.expression,
    required this.answer,
    required this.type,
    required this.showSteps,
    this.steps,
  });
}
