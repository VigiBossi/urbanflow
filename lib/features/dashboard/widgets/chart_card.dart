import 'package:material_ui/material_ui.dart';

import '../../../core/constants/app_constants.dart';

class ChartCard extends StatelessWidget {
  const ChartCard({
    super.key,
    required this.title,
    required this.child,
    this.height = 220,
  });

  final String title;
  final Widget child;
  final double height;

  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(Spacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: Spacing.lg),
          SizedBox(height: height, child: child),
        ],
      ),
    ),
  );
}
