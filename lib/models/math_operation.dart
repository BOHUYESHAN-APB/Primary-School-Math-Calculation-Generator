/// 数学运算类型枚举
enum MathOperation {
  addition, // 加法
  subtraction, // 减法
  multiplication, // 乘法
  division, // 除法
}

/// 数学运算类型扩展
extension MathOperationExtension on MathOperation {
  /// 获取运算符号
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

  /// 获取显示名称
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