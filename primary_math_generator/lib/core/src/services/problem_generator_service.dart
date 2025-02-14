part of '../../math_generator.dart';

class ProblemGeneratorService {
  List<double> generateNumbers({
    required OperationType operation,
    required GenerationConstraints constraints,
    required Random random,
  }) {
    double num1 = _generateNumber(constraints, random);
    double num2 = _generateNumber(constraints, random);

    // Handle division zero case
    if (operation == OperationType.division) {
      while (num2 == 0) {
        num2 = _generateNumber(constraints, random);
      }
    }

    // Ensure non-negative results for subtraction
    if (operation == OperationType.subtraction && !constraints.allowNegatives) {
      if (num1 < num2) {
        final temp = num1;
        num1 = num2;
        num2 = temp;
      }
    }

    return [num1, num2];
  }

  double _generateNumber(GenerationConstraints constraints, Random random) {
    final baseValue = constraints.minValue +
        random.nextInt(constraints.maxValue - constraints.minValue);
    return constraints.allowDecimals
        ? baseValue + random.nextDouble()
        : baseValue.toDouble();
  }
}
