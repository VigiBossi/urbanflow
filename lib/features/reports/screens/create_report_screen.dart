import 'package:latlong2/latlong.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/responsive.dart';
import '../../../data/mock/skopje_data.dart';
import '../../../data/models/city_report.dart';
import '../../../providers/location_provider.dart';
import '../../../providers/report_provider.dart';
import '../widgets/report_location_preview.dart';

/// Form for citizens to report an issue.
class CreateReportScreen extends StatefulWidget {
  const CreateReportScreen({super.key});

  @override
  State<CreateReportScreen> createState() => _CreateReportScreenState();
}

class _CreateReportScreenState extends State<CreateReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  ReportCategory _category = ReportCategory.pothole;
  LatLng? _location;
  bool _hasPhoto = false;
  bool _locating = false;
  bool _showLocationError = false;

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _useGps() async {
    setState(() => _locating = true);
    final location = context.read<LocationProvider>();
    await location.refresh();
    if (!mounted) return;
    setState(() {
      _locating = false;
      _location = location.position;
      _showLocationError = false;
    });
  }

  Future<void> _pickOnMap() async {
    final picked = await Navigator.of(context).pushNamed(
      AppRoutes.locationPicker,
      arguments: _location ?? context.read<LocationProvider>().position,
    );
    if (picked is LatLng && mounted) {
      setState(() {
        _location = picked;
        _showLocationError = false;
      });
    }
  }

  Future<void> _submit() async {
    final valid = _formKey.currentState?.validate() ?? false;
    setState(() => _showLocationError = _location == null);
    if (!valid || _location == null) return;
    final l10n = context.l10n;
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    try {
      await context.read<ReportProvider>().submit(
        ReportDraft(
          category: _category,
          description: _descriptionController.text,
          latitude: _location!.latitude,
          longitude: _location!.longitude,
          hasPhoto: _hasPhoto,
        ),
      );
      messenger.showSnackBar(SnackBar(content: Text(l10n.reportSubmitted)));
      navigator.pop();
    } on Exception {
      messenger.showSnackBar(SnackBar(content: Text(l10n.networkError)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final submitting = context.watch<ReportProvider>().isSubmitting;
    final location = _location;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.newReport)),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(Responsive.pagePadding(context)),
          children: [
            MaxWidthBox(
              maxWidth: 640,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(l10n.categoryLabel, style: theme.textTheme.titleSmall),
                  const SizedBox(height: Spacing.sm),
                  Wrap(
                    spacing: Spacing.sm,
                    runSpacing: Spacing.sm,
                    children: [
                      for (final c in ReportCategory.values)
                        ChoiceChip(
                          avatar: Icon(c.icon, size: 18),
                          label: Text(c.label(l10n)),
                          selected: _category == c,
                          onSelected: submitting
                              ? null
                              : (_) => setState(() => _category = c),
                        ),
                    ],
                  ),
                  const SizedBox(height: Spacing.xl),
                  TextFormField(
                    controller: _descriptionController,
                    enabled: !submitting,
                    minLines: 3,
                    maxLines: 6,
                    maxLength: 500,
                    decoration: InputDecoration(
                      labelText: l10n.descriptionLabel,
                      hintText: l10n.descriptionHint,
                      alignLabelWithHint: true,
                    ),
                    validator: (v) => switch (Validators.description(v)) {
                      ValidationError.required => l10n.descriptionRequired,
                      ValidationError.tooShort => l10n.descriptionTooShort,
                      _ => null,
                    },
                  ),
                  const SizedBox(height: Spacing.lg),
                  Text(l10n.locationLabel, style: theme.textTheme.titleSmall),
                  const SizedBox(height: Spacing.sm),
                  if (location != null) ...[
                    ReportLocationPreview(
                      position: location,
                      category: _category,
                      height: 160,
                    ),
                    const SizedBox(height: Spacing.xs),
                    Text(
                      SkopjeData.neighborhoodFor(location),
                      style: theme.textTheme.bodySmall,
                    ),
                  ] else
                    Text(
                      _showLocationError
                          ? l10n.locationRequired
                          : l10n.locationNotSet,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: _showLocationError
                            ? theme.colorScheme.error
                            : theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  const SizedBox(height: Spacing.sm),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: submitting || _locating ? null : _useGps,
                          icon: _locating
                              ? const SizedBox.square(
                                  dimension: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.my_location),
                          label: Text(
                            l10n.useMyLocation,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                      const SizedBox(width: Spacing.sm),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: submitting ? null : _pickOnMap,
                          icon: const Icon(Icons.map_outlined),
                          label: Text(
                            l10n.pickOnMap,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: Spacing.xl),
                  Text(l10n.photoLabel, style: theme.textTheme.titleSmall),
                  const SizedBox(height: Spacing.sm),
                  _PhotoPlaceholder(
                    attached: _hasPhoto,
                    enabled: !submitting,
                    onToggle: () => setState(() => _hasPhoto = !_hasPhoto),
                  ),
                  const SizedBox(height: Spacing.xxl),
                  FilledButton.icon(
                    onPressed: submitting ? null : _submit,
                    icon: submitting
                        ? const SizedBox.square(
                            dimension: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send),
                    label: Text(l10n.submitReport),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PhotoPlaceholder extends StatelessWidget {
  const _PhotoPlaceholder({
    required this.attached,
    required this.enabled,
    required this.onToggle,
  });

  final bool attached;
  final bool enabled;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        InkWell(
          onTap: enabled ? onToggle : null,
          borderRadius: BorderRadius.circular(16),
          child: Ink(
            height: 120,
            decoration: BoxDecoration(
              color: attached
                  ? scheme.primaryContainer
                  : scheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: scheme.outlineVariant),
            ),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    attached ? Icons.image : Icons.add_a_photo_outlined,
                    size: 36,
                    color: attached
                        ? scheme.onPrimaryContainer
                        : scheme.primary,
                  ),
                  const SizedBox(height: Spacing.xs),
                  Text(attached ? l10n.photoAttached : l10n.addPhoto),
                  if (attached)
                    Text(
                      l10n.removePhoto,
                      style: Theme.of(context).textTheme.labelSmall
                          ?.copyWith(color: scheme.error),
                    ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: Spacing.xs),
        Text(l10n.photoDemoNote, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}
