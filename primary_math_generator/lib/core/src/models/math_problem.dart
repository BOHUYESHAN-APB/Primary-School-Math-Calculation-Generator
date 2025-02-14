part of '../../math_generator.dart';

@immutable
class MathProblem {
  final double operand1;
  final double operand2;
  final OperationType operation;
  final GenerationConstraints constraints;
  final String verticalFormat;

  MathProblem({
    required this.operand1,
    required this.operand2,
    required this.operation,
    required this.constraints,
    required FormattingService formattingService,
  }) : verticalFormat = formattingService.formatVertical(MathProblem(
          operand1: operand1,
          operand2: operand2,
          operation: operation,
          constraints: constraints,
          formattingService: formattingService,
        ));

  String get uniqueHash {
    if (operation.isCommutative) {
      final numbers = [operand1, operand2];
      numbers.sort();
      return '${numbers[0]}${operation.symbol}${numbers[1]}';
    }
    return '$operand1${operation.symbol}$operand2';
  }

  double get calculatedAnswer => operation.calculate(operand1, operand2);

  String get formattedAnswer => constraints.allowDecimals
      ? calculatedAnswer.toStringAsFixed(2)
      : calculatedAnswer.toInt().toString();

  String get formattedQuestion => '$operand1 ${operation.symbol} $operand2 = ';

  void validate() {
    if (operand2 == 0 && operation == OperationType.division) {
      throw ArgumentError('Division by zero prevented');
    }
    if (calculatedAnswer < 0 && !constraints.allowNegatives) {
      throw StateError('Negative result generated against constraints');
    }
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MathProblem && uniqueHash == other.uniqueHash;

  @override
  int get hashCode => uniqueHash.hashCode;
}

class GenerationConstraints {
  final int minValue;
  final int maxValue;
  final bool allowNegatives;
  final bool allowDecimals;

  const GenerationConstraints({
    this.minValue = 10,
    this.maxValue = 10000,
    this.allowNegatives = false,
    this.allowDecimals = false,
  });
}
