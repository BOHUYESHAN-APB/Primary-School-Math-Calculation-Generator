enum MathOperation {
  addition,
  subtraction,
  multiplication,
  division,
}

extension MathOperationExtension on MathOperation {
  String get symbol {
    switch (this) {
      case MathOperation.addition:
        return '+';
      case MathOperation.subtraction:
        return '-';
      case MathOperation.multiplication:
        return '×';
      case MathOperation.division:
        return '÷';
    }
  }

  String get displayName {
    switch (this) {
      case MathOperation.addition:
        return 'Addition';
      case MathOperation.subtraction:
        return 'Subtraction';
      case MathOperation.multiplication:
        return 'Multiplication';
      case MathOperation.division:
        return 'Division';
    }
  }
}
