import 'math_operation.dart';

/// 数学题目数据模型
class MathQuestion {
  /// 题目表达式
  final String expression;

  /// 答案
  final String answer;

  /// 运算类型
  final MathOperation type;

  /// 计算步骤
  final List<String>? steps;

  /// 是否显示计算步骤
  final bool showSteps;

  /// 是否允许负数
  final bool showNegative;

  /// 是否允许小数
  final bool showDecimal;

  /// 构造函数
  const MathQuestion({
    required this.expression,
    required this.answer,
    required this.type,
    required this.showSteps,
    required this.showNegative,
    required this.showDecimal,
    this.steps,
  });
}