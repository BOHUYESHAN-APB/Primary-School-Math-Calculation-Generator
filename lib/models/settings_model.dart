import 'package:flutter/foundation.dart';
import 'math_operation.dart';

/// 显示格式枚举
enum DisplayFormat { 
  horizontal, // 横式
  vertical,   // 竖式
  both        // 两者
}

/// 应用设置数据模型
@immutable
class AppSettings {
  /// 题目数量
  final int questionCount;
  
  /// 数字范围最小值
  final int numberRangeMin;
  
  /// 数字范围最大值
  final int numberRangeMax;
  
  /// 小数位数
  final int decimalPlaces;
  
  /// 是否允许组合运算
  final bool allowCombination;
  
  /// 运算类型集合
  final Set<MathOperation> operations;
  
  /// 显示格式
  final DisplayFormat displayFormat;
  
  /// 是否显示计算过程
  final bool showProcess;
  
  /// 是否允许负数
  final bool allowNegative;
  
  /// 是否允许小数
  final bool allowDecimal;

  /// 构造函数
  const AppSettings({
    required this.questionCount,
    required this.numberRangeMin,
    required this.numberRangeMax,
    required this.decimalPlaces,
    required this.allowCombination,
    required this.operations,
    required this.displayFormat,
    required this.showProcess,
    required this.allowNegative,
    required this.allowDecimal,
  });

  /// 创建副本
  AppSettings copyWith({
    int? questionCount,
    int? numberRangeMin,
    int? numberRangeMax,
    int? decimalPlaces,
    bool? allowCombination,
    Set<MathOperation>? operations,
    DisplayFormat? displayFormat,
    bool? showProcess,
    bool? allowNegative,
    bool? allowDecimal,
  }) {
    return AppSettings(
      questionCount: questionCount ?? this.questionCount,
      numberRangeMin: numberRangeMin ?? this.numberRangeMin,
      numberRangeMax: numberRangeMax ?? this.numberRangeMax,
      decimalPlaces: decimalPlaces ?? this.decimalPlaces,
      allowCombination: allowCombination ?? this.allowCombination,
      operations: operations ?? this.operations,
      displayFormat: displayFormat ?? this.displayFormat,
      showProcess: showProcess ?? this.showProcess,
      allowNegative: allowNegative ?? this.allowNegative,
      allowDecimal: allowDecimal ?? this.allowDecimal,
    );
  }
}

/// 设置模型
class SettingsModel extends ChangeNotifier {
  /// 当前设置
  AppSettings _settings = const AppSettings(
    questionCount: 20,
    numberRangeMin: 10,
    numberRangeMax: 10000,
    decimalPlaces: 0,
    allowCombination: false,
    operations: {
      MathOperation.addition,
      MathOperation.subtraction,
      MathOperation.multiplication,
      MathOperation.division
    },
    displayFormat: DisplayFormat.vertical,
    showProcess: true,
    allowNegative: false,
    allowDecimal: false,
  );

  // Getters
  int get questionCount => _settings.questionCount;
  int get minNumber => _settings.numberRangeMin;
  int get maxNumber => _settings.numberRangeMax;
  Set<MathOperation> get operations => _settings.operations;
  bool get allowCombination => _settings.allowCombination;
  DisplayFormat get displayFormat => _settings.displayFormat;
  int get decimalPlaces => _settings.decimalPlaces;
  bool get showProcess => _settings.showProcess;
  bool get allowNegative => _settings.allowNegative;
  bool get allowDecimal => _settings.allowDecimal;

  /// 更新设置
  void updateSettings({
    int? questionCount,
    int? minNumber,
    int? maxNumber,
    Set<MathOperation>? operations,
    DisplayFormat? displayFormat,
    int? decimalPlaces,
    bool? showProcess,
    bool? allowNegative,
    bool? allowDecimal,
    bool? allowCombination,
  }) {
    final newSettings = _settings.copyWith(
      questionCount: questionCount,
      numberRangeMin: minNumber,
      numberRangeMax: maxNumber,
      operations: operations,
      displayFormat: displayFormat,
      decimalPlaces: decimalPlaces,
      showProcess: showProcess,
      allowNegative: allowNegative,
      allowDecimal: allowDecimal,
      allowCombination: allowCombination,
    );

    // 验证新设置
    if (newSettings.questionCount < 1 || newSettings.questionCount > 1000) {
      throw ArgumentError('题目数量必须在1到1000之间');
    }
    if (newSettings.numberRangeMin < 1 || newSettings.numberRangeMax > 999999) {
      throw ArgumentError('数字范围必须在1到999999之间');
    }
    if (newSettings.numberRangeMin >= newSettings.numberRangeMax) {
      throw ArgumentError('最小数字必须小于最大数字');
    }
    if (newSettings.operations.isEmpty) {
      throw ArgumentError('至少需要选择一种运算类型');
    }
    if (newSettings.allowDecimal &&
        (newSettings.decimalPlaces < 0 || newSettings.decimalPlaces > 4)) {
      throw ArgumentError('小数位数必须在0到4之间');
    }

    _settings = newSettings;
    notifyListeners();
  }
}