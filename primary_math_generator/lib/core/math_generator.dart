import 'package:flutter/foundation.dart';
import 'src/models/generation_constraints.dart';
import 'src/models/math_problem.dart';
import 'src/models/operation_type.dart';
import 'src/services/formatting_service.dart';
import 'src/services/number_generator_service.dart';
import 'src/services/problem_generator_service.dart';

class MathGenerator {
  late final NumberGeneratorService _numberService;
  late final ProblemGeneratorService _problemService;
  late final FormattingService _formatter;

  MathGenerator() {
    _numberService = NumberGeneratorService();
    _formatter = FormattingService();
    _problemService = ProblemGeneratorService(
      numberService: _numberService,
      formatter: _formatter,
    );
  }

  Future<List<MathProblem>> generateProblems({
    required int problemCount,
    required Set<OperationType> operations,
    required GenerationConstraints constraints,
  }) async {
    return await _problemService.generateBatch(
      count: problemCount,
      operations: operations,
      constraints: constraints,
    );
  }
}
