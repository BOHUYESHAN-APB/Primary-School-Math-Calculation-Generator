import '../models/generation_constraints.dart';
import 'dart:math';

class NumberGeneratorService {
  final _random = Random();

  double generateNumber(GenerationConstraints constraints) {
    final range = constraints.max - constraints.min;
    final base = _random.nextDouble() * range + constraints.min;

    return constraints.allowDecimals
        ? double.parse(base.toStringAsFixed(1))
        : base.roundToDouble();
  }
}
