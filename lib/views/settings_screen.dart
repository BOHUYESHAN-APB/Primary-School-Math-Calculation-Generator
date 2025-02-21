import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/settings_model.dart';

typedef ValueChanged2<T1, T2> = void Function(T1 value1, T2 value2);

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final settings = Provider.of<SettingsModel>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('设置')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildRangeSetting(
              '题目数量',
              settings.questionCount,
              settings.questionCount,
              (min, max) => settings.updateSettings(questionCount: max),
              min: 10,
              max: 1000),
          _buildRangeSetting(
              '数值范围',
              settings.minNumber,
              settings.maxNumber,
              (min, max) =>
                  settings.updateSettings(minNumber: min, maxNumber: max),
              min: 10,
              max: 10000),
          _buildDecimalPlacesSetting(settings),
          _buildFormatSetting(settings),
          _buildOperationTypes(settings),
          _buildCheckboxSetting('显示计算过程', settings.showProcess,
              (value) => settings.updateSettings(showProcess: value)),
          _buildCheckboxSetting('允许负数结果', settings.allowNegative,
              (value) => settings.updateSettings(allowNegative: value)),
          _buildCheckboxSetting('允许小数结果', settings.allowDecimal,
              (value) => settings.updateSettings(allowDecimal: value)),
        ],
      ),
    );
  }

  Widget _buildRangeSetting(String title, int minValue, int maxValue,
      ValueChanged2<int, int> onChanged,
      {required int min, required int max}) {
    return ListTile(
      title: Text('$title: $minValue-$maxValue'),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 120,
            child: TextField(
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: '最小值',
                hintText: '$minValue',
              ),
              onChanged: (value) => onChanged(int.parse(value), maxValue),
            ),
          ),
          SizedBox(width: 20),
          SizedBox(
            width: 120,
            child: TextField(
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: '最大值',
                hintText: '$maxValue',
              ),
              onChanged: (value) => onChanged(minValue, int.parse(value)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDecimalPlacesSetting(SettingsModel settings) {
    return ListTile(
      title: const Text('小数位数'),
      trailing: DropdownButton<int>(
        value: settings.decimalPlaces,
        items: const [
          DropdownMenuItem(value: 1, child: Text('1位')),
          DropdownMenuItem(value: 2, child: Text('2位')),
          DropdownMenuItem(value: 3, child: Text('3位')),
        ],
        onChanged: (value) => settings.updateSettings(decimalPlaces: value),
      ),
    );
  }

  Widget _buildFormatSetting(SettingsModel settings) {
    return ListTile(
      title: const Text('输出格式'),
      trailing: DropdownButton<DisplayFormat>(
        value: settings.displayFormat,
        items: const [
          DropdownMenuItem(
            value: DisplayFormat.horizontal,
            child: Text('横式'),
          ),
          DropdownMenuItem(
            value: DisplayFormat.vertical,
            child: Text('竖式'),
          ),
          DropdownMenuItem(
            value: DisplayFormat.both,
            child: Text('两者'),
          ),
        ],
        onChanged: (value) => settings.updateSettings(displayFormat: value),
      ),
    );
  }

  Widget _buildOperationTypes(SettingsModel settings) {
    const operations = {'+': '加法', '-': '减法', '×': '乘法', '÷': '除法'};
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.all(16),
          child: Text('运算类型:', style: TextStyle(fontSize: 16)),
        ),
        Wrap(
          children: operations.entries.map((entry) {
            return FilterChip(
              label: Text(entry.value),
              selected: settings.operations.contains(entry.key),
              onSelected: (selected) {
                final newOps = Set<String>.from(settings.operations);
                selected ? newOps.add(entry.key) : newOps.remove(entry.key);
                settings.updateSettings(operations: newOps.toList());
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildCheckboxSetting(
      String title, bool value, ValueChanged<bool> onChanged) {
    return CheckboxListTile(
      title: Text(title),
      value: value,
      onChanged: (val) => onChanged(val ?? false),
    );
  }
}
