import 'package:flutter/foundation.dart';

enum MathOperation {
  addition('+'),
  subtraction('-'),
  multiplication('×'),
  division('÷');

  final String symbol;
  const MathOperation(this.symbol);

  @override
  String toString() => symbol;
}

enum DisplayFormat { horizontal, vertical, both }

@immutable
class AppSettings {
  final int questionCount;
  final int numberRangeMin;
  final int numberRangeMax;
  final int decimalPlaces;
  final bool allowCombination;
  final Set<MathOperation> operations;
  final DisplayFormat displayFormat;
  final bool showProcess;
  final bool allowNegative;
  final bool allowDecimal;

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

class SettingsModel extends ChangeNotifier {
  AppSettings _settings = const AppSettings(
    questionCount: 20,
    numberRangeMin: 10,
    numberRangeMax: 10000,
    decimalPlaces: 2,
    allowCombination: false,
    operations: {
      MathOperation.addition,
      MathOperation.subtraction,
      MathOperation.multiplication,
      MathOperation.division
    },
    displayFormat: DisplayFormat.vertical,
    showProcess: true,
    allowNegative: true,
    allowDecimal: true,
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

    // Validate new settings
    if (newSettings.questionCount < 1 || newSettings.questionCount > 1000) {
      throw ArgumentError('Question count must be between 1 and 1000');
    }
    if (newSettings.numberRangeMin < 10 || newSettings.numberRangeMax > 10000) {
      throw ArgumentError('Number range must be between 10 and 10000');
    }
    if (newSettings.numberRangeMin >= newSettings.numberRangeMax) {
      throw ArgumentError('Minimum number must be less than maximum number');
    }
    if (newSettings.operations.isEmpty) {
      throw ArgumentError('At least one operation must be selected');
    }
    if (newSettings.allowDecimal &&
        (newSettings.decimalPlaces < 0 || newSettings.decimalPlaces > 4)) {
      throw ArgumentError('Decimal places must be between 0 and 4');
    }

    _settings = newSettings;
    notifyListeners();
  }
}
