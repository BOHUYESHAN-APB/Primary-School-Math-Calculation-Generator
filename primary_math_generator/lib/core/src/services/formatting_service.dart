import '../models/math_problem.dart';
import '../models/operation_type.dart';
import '../models/generation_constraints.dart';

class FormattingService {
  String getOperatorSymbol(OperationType operation) {
    switch (operation) {
      case OperationType.addition:
        return '+';
      case OperationType.subtraction:
        return '-';
      case OperationType.multiplication:
        return '×';
      case OperationType.division:
        return '÷';
    }
  }

  FormattedProblem formatProblem({
    required double firstOperand,
    required double secondOperand,
    required OperationType operation,
    required double solution,
    required GenerationConstraints constraints,
  }) {
    final isVertical = constraints.verticalLayout;
    final showDecimal = constraints.allowDecimals;

    return FormattedProblem(
      question: _formatQuestion(
          firstOperand, secondOperand, operation, isVertical, showDecimal),
      answer: _formatNumber(solution, showDecimal),
      solutionSteps: _createSolutionSteps(
          firstOperand, secondOperand, operation, solution),
      isVertical: isVertical,
    );
  }

  String _formatQuestion(
      double a, double b, OperationType op, bool vertical, bool showDecimal) {
    final aStr = _formatNumber(a, showDecimal);
    final bStr = _formatNumber(b, showDecimal);

    if (vertical) {
      return '$aStr\n${getOperatorSymbol(op)} $bStr\n――――';
    }
    return '$aStr ${getOperatorSymbol(op)} $bStr = ';
  }

  String _formatNumber(double num, bool showDecimal) {
    return showDecimal ? num.toString() : num.toInt().toString();
  }

  String _createSolutionSteps(
      double a, double b, OperationType op, double result) {
    return 'Step 1: ${a} ${getOperatorSymbol(op)} ${b} = ${result}';
  }
}

class FormattedProblem {
  final String question;
  final String answer;
  final String solutionSteps;
  final bool isVertical;

  FormattedProblem({
    required this.question,
    required this.answer,
    required this.solutionSteps,
    required this.isVertical,
  });
}
