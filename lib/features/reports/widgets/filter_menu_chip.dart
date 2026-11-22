import 'package:material_ui/material_ui.dart';

/// A chip that opens a menu to choose one value (or "all" = null).
class FilterMenuChip<T> extends StatelessWidget {
  const FilterMenuChip({
    super.key,
    required this.label,
    required this.allLabel,
    required this.values,
    required this.value,
    required this.valueLabel,
    required this.onChanged,
  });

  final String label;
  final String allLabel;
  final List<T> values;
  final T? value;
  final String Function(T) valueLabel;
  final ValueChanged<T?> onChanged;

  @override
  Widget build(BuildContext context) {
    final current = value;
    return MenuAnchor(
      menuChildren: [
        MenuItemButton(
          onPressed: () => onChanged(null),
          leadingIcon: Icon(current == null ? Icons.check : null),
          child: Text(allLabel),
        ),
        for (final v in values)
          MenuItemButton(
            onPressed: () => onChanged(v),
            leadingIcon: Icon(v == current ? Icons.check : null),
            child: Text(valueLabel(v)),
          ),
      ],
      builder: (context, controller, _) => FilterChip(
        selected: current != null,
        label: Text(current == null ? label : '$label: ${valueLabel(current)}'),
        avatar: current == null ? const Icon(Icons.arrow_drop_down) : null,
        onSelected: (_) =>
            controller.isOpen ? controller.close() : controller.open(),
      ),
    );
  }
}
