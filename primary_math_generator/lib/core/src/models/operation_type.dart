part of '../../math_generator.dart';

enum OperationType {
  addition('+', true),
  subtraction('-', false),
  multiplication('×', true),
  division('÷', false);

  static OperationType fromSymbol(String symbol) {
    return values.firstWhere(
      (op) => op.symbol == symbol,
      orElse: () => throw ArgumentError('Invalid operator symbol: $symbol'),
    );
  }

  final String symbol;
  final bool isCommutative;

  const OperationType(this.symbol, this.isCommutative);

  double calculate(double a, double b) {
    switch (this) {
      case OperationType.addition:
        return a + b;
      case OperationType.subtraction:
        return a - b;
      case OperationType.multiplication:
        return a * b;
      case OperationType.division:
        if (b == 0) throw ArgumentError('Division by zero');
        return a / b;
    }
  }
}
