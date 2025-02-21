class MathQuestion {
  final String expression;
  final String answer;
  final String type;
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
