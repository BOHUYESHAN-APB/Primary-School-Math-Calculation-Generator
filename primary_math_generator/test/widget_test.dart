import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:primary_math_generator/main.dart';
import 'package:primary_math_generator/core/math_generator.dart';

void main() {
  testWidgets('App launches and shows generator screen',
      (WidgetTester tester) async {
    // Load app widget
    await tester.pumpWidget(const MathGeneratorApp());

    // Wait for initial frame
    await tester.pumpAndSettle();

    // Verify core elements exist
    expect(find.text('Math Problem Generator'), findsOneWidget);
    expect(find.byType(GeneratorScreen), findsOneWidget);
    expect(find.byType(ElevatedButton), findsNWidgets(2));

    // Verify input controls
    expect(find.text('Number of Digits (1-6)'), findsOneWidget);
    expect(find.text('Number of Problems'), findsOneWidget);
    expect(find.byType(Slider), findsOneWidget);
    expect(find.byType(CheckboxListTile), findsNWidgets(4));
  });
}
