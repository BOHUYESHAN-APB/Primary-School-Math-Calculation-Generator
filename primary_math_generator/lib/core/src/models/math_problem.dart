class MathProblem {
  final String formattedQuestion;
  final String formattedAnswer;
  final String solutionSteps;
  final bool isVertical;
  final double firstOperand;
  final double secondOperand;
  final String operatorSymbol;

  const MathProblem({
    required this.formattedQuestion,
    required this.formattedAnswer,
    required this.solutionSteps,
    required this.isVertical,
    required this.firstOperand,
    required this.secondOperand,
    required this.operatorSymbol,
  });
}
