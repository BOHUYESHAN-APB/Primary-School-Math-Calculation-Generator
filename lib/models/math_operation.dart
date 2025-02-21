enum MathOperation {
  addition('+'),
  subtraction('-'),
  multiplication('×'),
  division('÷');

  final String symbol;
  const MathOperation(this.symbol);

  String get displayName {
    switch (this) {
      case MathOperation.addition:
        return '加法';
      case MathOperation.subtraction:
        return '减法';
      case MathOperation.multiplication:
        return '乘法';
      case MathOperation.division:
        return '除法';
    }
  }
}
