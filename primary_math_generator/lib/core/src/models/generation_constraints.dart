class GenerationConstraints {
  final int min;
  final int max;
  final bool allowNegativeResults;
  final bool allowDecimals;
  final bool verticalLayout;

  const GenerationConstraints({
    required this.min,
    required this.max,
    this.allowNegativeResults = false,
    this.allowDecimals = false,
    this.verticalLayout = true,
  });
}
