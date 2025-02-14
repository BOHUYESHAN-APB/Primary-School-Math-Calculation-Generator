library math_generator;

import 'dart:math';
import 'package:flutter/foundation.dart';

part 'src/models/math_problem.dart';
part 'src/models/operation_type.dart';
part 'src/services/problem_generator_service.dart';
part 'src/services/formatting_service.dart';
part 'src/utils/number_generator.dart';

class MathGenerator {
  final ProblemGeneratorService _generatorService;
  final FormattingService _formattingService;
  final Random _random;

  MathGenerator({
    Random? random,
    ProblemGeneratorService? generatorService,
    FormattingService? formattingService,
  })  : _random = random ?? Random(),
        _generatorService = generatorService ?? ProblemGeneratorService(),
        _formattingService = formattingService ?? FormattingService();

  List<MathProblem> generateProblems({
    required int count,
    required Set<OperationType> operations,
    required GenerationConstraints constraints,
  }) {
    final problems = <MathProblem>[];
    final seenHashes = <String>{};

    while (problems.length < count) {
      final operation = _getRandomOperation(operations);
      final numbers = _generatorService.generateNumbers(
        operation: operation,
        constraints: constraints,
        random: _random,
      );

      final problem = MathProblem(
        operand1: numbers.first,
        operand2: numbers.last,
        operation: operation,
        constraints: constraints,
      )..validate();

      if (!seenHashes.contains(problem.uniqueHash)) {
        problems.add(problem);
        seenHashes.add(problem.uniqueHash);
      }
    }

    return problems;
  }

  OperationType _getRandomOperation(Set<OperationType> operations) {
    return operations.elementAt(_random.nextInt(operations.length));
  }
}
