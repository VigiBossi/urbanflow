import 'package:flutter/widgets.dart';

import '../constants/app_constants.dart';

/// Window size helpers based on Material 3 breakpoints.
abstract final class Responsive {
  static double width(BuildContext context) => MediaQuery.sizeOf(context).width;

  static bool isCompact(BuildContext context) =>
      width(context) < Breakpoints.medium;

  static bool isMediumOrLarger(BuildContext context) =>
      width(context) >= Breakpoints.medium;

  static bool isExpanded(BuildContext context) =>
      width(context) >= Breakpoints.expanded;

  /// Horizontal page padding for the current width.
  static double pagePadding(BuildContext context) =>
      isCompact(context) ? Spacing.lg : Spacing.xl;
}

/// Centers [child] and limits its width on large screens.
class MaxWidthBox extends StatelessWidget {
  const MaxWidthBox({super.key, required this.child, this.maxWidth = 720});

  final Widget child;
  final double maxWidth;

  @override
  Widget build(BuildContext context) => Align(
    alignment: Alignment.topCenter,
    child: ConstrainedBox(
      constraints: BoxConstraints(maxWidth: maxWidth),
      child: child,
    ),
  );
}
