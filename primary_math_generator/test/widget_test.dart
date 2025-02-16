import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:primary_math_generator/main.dart';

void main() {
  testWidgets('App launches and shows generator screen', (WidgetTester tester) async {
    // Build our app and trigger a frame
    await tester.pumpWidget(const MyApp());

    // Wait for initial layout and animations to complete
    await tester.pumpAndSettle();

    // Verify AppBar title exists
    expect(find.text('Math Problems'), findsOneWidget);

    // Verify FloatingActionButton exists
    expect(find.byType(FloatingActionButton), findsOneWidget);

    // Verify initial empty state
    expect(find.byType(ListView), findsOneWidget);
    expect(find.byType(ProblemCard), findsNothing);
  });

    // Verify input controls
    expect(find.text('Number of Digits (1-6)'), findsOneWidget);
    expect(find.text('Number of Problems'), findsOneWidget);
    expect(find.byType(Slider), findsOneWidget);
    expect(find.byType(CheckboxListTile), findsNWidgets(4));
  });
}
