import 'package:flutter/material.dart';
import 'package:primary_math_generator/core/math_generator.dart';
import 'package:primary_math_generator/core/src/models/generation_constraints.dart';
import 'package:primary_math_generator/core/src/models/math_problem.dart';
import 'package:primary_math_generator/core/src/models/operation_type.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Math Generator',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const MathGeneratorScreen(),
    );
  }
}

class MathGeneratorScreen extends StatefulWidget {
  const MathGeneratorScreen({super.key});

  @override
  State<MathGeneratorScreen> createState() => _MathGeneratorScreenState();
}

class _MathGeneratorScreenState extends State<MathGeneratorScreen> {
  final _mathGenerator = MathGenerator();
  List<MathProblem> _problems = [];

  final _constraints = GenerationConstraints(
    min: 10,
    max: 100,
    allowNegativeResults: false,
    allowDecimals: false,
    verticalLayout: true,
  );

  Future<void> _generateProblems() async {
    final problems = await _mathGenerator.generateProblems(
      problemCount: 10,
      operations: {
        OperationType.addition,
        OperationType.subtraction,
        OperationType.multiplication,
        OperationType.division
      },
      constraints: _constraints,
    );
    setState(() => _problems = problems);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Math Problems')),
      body: ListView.builder(
        itemCount: _problems.length,
        itemBuilder: (context, index) => ProblemCard(_problems[index]),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _generateProblems,
        child: const Icon(Icons.refresh),
      ),
    );
  }
}

class ProblemCard extends StatelessWidget {
  final MathProblem problem;

  const ProblemCard(this.problem, {super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(problem.formattedQuestion,
                style: const TextStyle(fontSize: 24)),
            const SizedBox(height: 8),
            Text('Answer: ${problem.formattedAnswer}',
                style: const TextStyle(color: Colors.green)),
          ],
        ),
      ),
    );
  }
}
