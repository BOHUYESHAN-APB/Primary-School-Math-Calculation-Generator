import 'dart:math';
import '../models/math_problem.dart';
import '../models/operation_type.dart';
import '../models/generation_constraints.dart';
import 'number_generator_service.dart';
import 'formatting_service.dart';

class ProblemGeneratorService {
  final NumberGeneratorService numberService;
  final FormattingService formatter;
  final _random = Random();

  ProblemGeneratorService({
    required this.numberService,
    required this.formatter,
  });

  List<MathProblem> generateBatch({
    required int count,
    required Set<OperationType> operations,
    required GenerationConstraints constraints,
  }) {
    return List.generate(
        count, (_) => _generateProblem(operations, constraints));
  }

  MathProblem _generateProblem(
      Set<OperationType> operations, GenerationConstraints constraints) {
    final operation = _getRandomOperation(operations);
    var a = numberService.generateNumber(constraints);
    var b = numberService.generateNumber(constraints);
    double result;

    // Ensure valid operations
    switch (operation) {
      case OperationType.addition:
        result = a + b;
      case OperationType.subtraction:
        // Ensure non-negative results if required
        if (!constraints.allowNegativeResults && a < b) {
          (a, b) = (b, a);
        }
        result = a - b;
      case OperationType.multiplication:
        result = a * b;
      case OperationType.division:
        // Ensure valid division
        if (b == 0) b = 1;
        result = a / b;
        if (!constraints.allowDecimals) {
          result = result.toInt().toDouble();
          a = result * b; // Ensure whole number division
        }
    }

    final formatted = formatter.formatProblem(
      firstOperand: a,
      secondOperand: b,
      operation: operation,
      solution: result,
      constraints: constraints,
    );

    return MathProblem(
      formattedQuestion: formatted.question,
      formattedAnswer: formatted.answer,
      solutionSteps: formatted.solutionSteps,
      isVertical: formatted.isVertical,
      firstOperand: a,
      secondOperand: b,
      operatorSymbol: formatter.getOperatorSymbol(operation),
    );
  }

  OperationType _getRandomOperation(Set<OperationType> operations) {
    return operations.elementAt(_random.nextInt(operations.length));
  }
}
