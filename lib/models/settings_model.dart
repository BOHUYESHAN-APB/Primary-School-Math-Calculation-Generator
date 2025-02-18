import 'package:flutter/foundation.dart';

enum DisplayFormat { horizontal, vertical, both }

class SettingsModel extends ChangeNotifier {
  int _questionCount = 20;
  int _numberRange = 10000;
  int _decimalPlaces = 2;
  Set<String> _operations = {'+', '-'};
  DisplayFormat _displayFormat = DisplayFormat.vertical;
  bool _showProcess = true;
  bool _allowNegative = false;
  bool _allowDecimal = false;

  // Getters
  int get questionCount => _questionCount;
  int get numberRange => _numberRange;
  Set<String> get operations => _operations;
  DisplayFormat get displayFormat => _displayFormat;
  int get decimalPlaces => _decimalPlaces;
  bool get showProcess => _showProcess;
  bool get allowNegative => _allowNegative;
  bool get allowDecimal => _allowDecimal;

  // Setters
  void updateSettings({
    int? questionCount,
    int? numberRange,
    Set<String>? operations,
    DisplayFormat? displayFormat,
    int? decimalPlaces,
    bool? showProcess,
    bool? allowNegative,
    bool? allowDecimal,
  }) {
    _questionCount = questionCount ?? _questionCount;
    _numberRange = numberRange ?? _numberRange;
    _operations = operations ?? _operations;
    _displayFormat = displayFormat ?? _displayFormat;
    _decimalPlaces = decimalPlaces ?? _decimalPlaces;
    _showProcess = showProcess ?? _showProcess;
    _allowNegative = allowNegative ?? _allowNegative;
    _allowDecimal = allowDecimal ?? _allowDecimal;
    notifyListeners();
  }
}
