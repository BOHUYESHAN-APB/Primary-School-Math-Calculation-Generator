part of '../../math_generator.dart';

class NumberGenerator {
  static double generate({
    required GenerationConstraints constraints,
    required Random random,
  }) {
    final base = constraints.minValue +
        random.nextInt(constraints.maxValue - constraints.minValue);
    return constraints.allowDecimals
        ? base + random.nextDouble()
        : base.toDouble();
  }
}
