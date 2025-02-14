part of '../../math_generator.dart';

class FormattingService {
  String formatVertical(MathProblem problem) {
    final op1 = problem.operand1;
    final op2 = problem.operand2;
    final symbol = problem.operation.symbol;

    switch (problem.operation) {
      case OperationType.multiplication:
        return _formatMultiplication(op1, op2);
      case OperationType.division:
        return _formatDivision(op1, op2);
      default:
        return _formatBasic(op1, op2, symbol);
    }
  }

  String _formatBasic(num op1, num op2, String symbol) {
    final maxDigits = max(op1.toString().length, op2.toString().length);
    return '''
${op1.toString().padLeft(maxDigits + 2)}
$symbol ${op2.toString().padLeft(maxDigits)}
${'-' * (maxDigits + 2)}''';
  }

  String _formatMultiplication(num op1, num op2) {
    final steps = _getMultiplicationSteps(op1, op2);
    final maxDigits = steps.last.toString().length;
    final buffer = StringBuffer();

    buffer.writeln('  ${op1.toString()}');
    buffer.writeln('× ${op2.toString()}');
    buffer.writeln('${'-' * (maxDigits + 2)}');

    if (op2.toString().length > 1) {
      steps.sublist(0, steps.length - 1).asMap().forEach((i, step) {
        buffer.writeln(step.toString().padLeft(maxDigits + 2 - i));
      });
      buffer.writeln('${'-' * (maxDigits + 2)}');
    }

    buffer.write(steps.last.toString().padLeft(maxDigits + 2));
    return buffer.toString();
  }

  List<num> _getMultiplicationSteps(num op1, num op2) {
    final steps = <num>[];
    final strOp2 = op2.toString().split('').reversed.toList();

    for (var i = 0; i < strOp2.length; i++) {
      steps.add(op1 * int.parse(strOp2[i]) * pow(10, i));
    }
    steps.add(op1 * op2);
    return steps;
  }

  String _formatDivision(num dividend, num divisor) {
    final quotient = dividend ~/ divisor;
    final remainder = dividend % divisor;
    final buffer = StringBuffer();

    buffer.writeln('  $quotient');
    buffer.writeln('${'-' * (divisor.toString().length + 1)}');
    buffer.writeln('$divisor)${dividend}');
    buffer.writeln('  ${divisor * quotient}');
    buffer.writeln('  ${'-' * (dividend.toString().length)}');
    buffer.write('   $remainder');

    return buffer.toString();
  }

  String formatHorizontal(MathProblem problem) {
    return '${problem.operand1} ${problem.operation.symbol} ${problem.operand2} = ';
  }
}
