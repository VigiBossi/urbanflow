import 'package:material_ui/material_ui.dart';

import '../../../core/widgets/responsive.dart';

class ShellDestination {
  const ShellDestination({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.builder,
  });

  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final WidgetBuilder builder;
}

/// Bottom navigation on phones, navigation rail on tablets. Pages are built
/// lazily on first visit and then kept alive.
class AdaptiveShell extends StatefulWidget {
  const AdaptiveShell({
    super.key,
    required this.destinations,
    this.footer,
    this.overlay,
  });

  final List<ShellDestination> destinations;

  /// Optional widget below the page content, above the navigation bar
  /// (e.g. an active-session banner).
  final Widget? footer;

  /// Optional invisible widget that reacts to app-wide events.
  final Widget? overlay;

  @override
  State<AdaptiveShell> createState() => AdaptiveShellState();
}

class AdaptiveShellState extends State<AdaptiveShell> {
  int _index = 0;
  final Set<int> _visited = {0};

  int get index => _index;

  void select(int index) {
    if (index == _index) return;
    setState(() {
      _index = index;
      _visited.add(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    final destinations = widget.destinations;
    final pages = IndexedStack(
      index: _index,
      children: [
        for (var i = 0; i < destinations.length; i++)
          _visited.contains(i)
              ? destinations[i].builder(context)
              : const SizedBox.shrink(),
      ],
    );
    final body = Column(
      children: [
        Expanded(child: pages),
        ?widget.footer,
        ?widget.overlay,
      ],
    );

    if (Responsive.isMediumOrLarger(context)) {
      return Scaffold(
        body: SafeArea(
          child: Row(
            children: [
              NavigationRail(
                selectedIndex: _index,
                onDestinationSelected: select,
                labelType: NavigationRailLabelType.all,
                destinations: [
                  for (final d in destinations)
                    NavigationRailDestination(
                      icon: Icon(d.icon),
                      selectedIcon: Icon(d.selectedIcon),
                      label: Text(d.label),
                    ),
                ],
              ),
              const VerticalDivider(width: 1),
              Expanded(child: body),
            ],
          ),
        ),
      );
    }
    return Scaffold(
      body: body,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: select,
        destinations: [
          for (final d in destinations)
            NavigationDestination(
              icon: Icon(d.icon),
              selectedIcon: Icon(d.selectedIcon),
              label: d.label,
            ),
        ],
      ),
    );
  }
}
