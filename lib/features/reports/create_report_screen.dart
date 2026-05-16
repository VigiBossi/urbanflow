import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../core/l10n/app_localizations.dart';
import '../../core/models/report_model.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/reports_provider.dart';
import '../../core/services/location_service.dart';
import '../../shared/widgets/gradient_button.dart';

class CreateReportScreen extends StatefulWidget {
  const CreateReportScreen({super.key});

  @override
  State<CreateReportScreen> createState() => _CreateReportScreenState();
}

class _CreateReportScreenState extends State<CreateReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  ReportCategory _category = ReportCategory.other;
  List<XFile> _images = [];
  double? _lat;
  double? _lng;
  String? _address;
  bool _locating = false;

  @override
  void initState() {
    super.initState();
    _detectLocation();
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _detectLocation() async {
    setState(() => _locating = true);
    final pos = await LocationService.getCurrentPosition();
    setState(() {
      _lat = pos?.latitude ?? AppConstants.defaultLat;
      _lng = pos?.longitude ?? AppConstants.defaultLng;
      _address = LocationService.mockAddressFromCoordinates(
          _lat!, _lng!);
      _locating = false;
    });
  }

  Future<void> _pickImages() async {
    if (_images.length >= AppConstants.maxImagesPerReport) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(
            'Maximum ${AppConstants.maxImagesPerReport} photos allowed'),
        backgroundColor: AppColors.warning,
        behavior: SnackBarBehavior.floating,
      ));
      return;
    }
    final picker = ImagePicker();
    final img = await picker.pickImage(source: ImageSource.gallery);
    if (img != null && mounted) {
      setState(() => _images.add(img));
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_lat == null || _lng == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Location not detected. Please retry.'),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ));
      return;
    }

    final auth = context.read<AuthProvider>();
    if (auth.user == null) return;

    final reports = context.read<ReportsProvider>();
    await reports.createReport(
      title: _titleCtrl.text.trim(),
      description: _descCtrl.text.trim(),
      category: _category,
      lat: _lat!,
      lng: _lng!,
      author: auth.user!,
      imageUrls: _images.map((f) => f.path).toList(),
    );

    auth.incrementReports();

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text('Report submitted successfully!'),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10)),
      ));
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final isLoading = context.watch<ReportsProvider>().isLoading;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.createReport),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      backgroundColor: const Color(0xFFF5F7FF),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildCategorySelector(l10n),
              const SizedBox(height: 16),
              _buildTextField(
                ctrl: _titleCtrl,
                label: l10n.reportTitle,
                hint: 'Briefly describe the issue',
                maxLines: 1,
                validator: (v) =>
                    (v == null || v.trim().length < 5)
                        ? 'Title too short (min 5 characters)'
                        : null,
              ),
              const SizedBox(height: 14),
              _buildTextField(
                ctrl: _descCtrl,
                label: l10n.description,
                hint: 'Provide more details about the issue...',
                maxLines: 4,
                validator: (v) =>
                    (v == null || v.trim().length < 10)
                        ? 'Please add more details'
                        : null,
              ),
              const SizedBox(height: 16),
              _buildLocationCard(l10n),
              const SizedBox(height: 16),
              _buildPhotoSection(l10n),
              const SizedBox(height: 24),
              GradientButton(
                label: l10n.submitReport,
                onPressed: isLoading ? null : _submit,
                isLoading: isLoading,
                icon: Icons.send,
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategorySelector(AppLocalizations l10n) {
    final categories = [
      (ReportCategory.traffic, Icons.traffic, l10n.traffic),
      (ReportCategory.pothole, Icons.warning_amber, l10n.pothole),
      (ReportCategory.streetLight, Icons.lightbulb_outline, l10n.streetLight),
      (ReportCategory.accident, Icons.car_crash, l10n.accident),
      (ReportCategory.waste, Icons.delete_outline, l10n.waste),
      (ReportCategory.illegalDumping, Icons.delete_forever, l10n.illegalDumping),
      (ReportCategory.flooding, Icons.water, l10n.flooding),
      (ReportCategory.noisePollution, Icons.volume_up, l10n.noisePollution),
      (ReportCategory.vandalism, Icons.construction, l10n.vandalism),
      (ReportCategory.other, Icons.more_horiz, l10n.other),
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.category,
              style: const TextStyle(
                  fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: categories.map((c) {
              final selected = _category == c.$1;
              return GestureDetector(
                onTap: () => setState(() => _category = c.$1),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: selected
                        ? AppColors.primary
                        : AppColors.primary.withOpacity(0.07),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: selected
                          ? AppColors.primary
                          : Colors.grey[300]!,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(c.$2,
                          size: 15,
                          color: selected
                              ? Colors.white
                              : AppColors.primary),
                      const SizedBox(width: 6),
                      Text(c.$3,
                          style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: selected
                                  ? Colors.white
                                  : AppColors.primary)),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController ctrl,
    required String label,
    required String hint,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: TextFormField(
        controller: ctrl,
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide.none),
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide.none),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(
                  color: AppColors.primary, width: 1.5)),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.all(16),
        ),
        validator: validator,
      ),
    );
  }

  Widget _buildLocationCard(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.location_on,
                  color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text(l10n.location,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 15)),
              const Spacer(),
              TextButton.icon(
                onPressed: _detectLocation,
                icon: const Icon(Icons.my_location, size: 14),
                label: const Text('Detect', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (_locating)
            const Row(
              children: [
                SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.primary)),
                SizedBox(width: 10),
                Text('Detecting location...',
                    style: TextStyle(
                        fontSize: 13, color: Colors.grey)),
              ],
            )
          else if (_address != null)
            Text(_address!,
                style: const TextStyle(
                    fontSize: 13, color: Colors.black87))
          else
            Text('Location not detected',
                style: TextStyle(
                    fontSize: 13, color: Colors.grey[500])),
        ],
      ),
    );
  }

  Widget _buildPhotoSection(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.photo_camera_outlined,
                  color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text(l10n.addPhoto,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 15)),
              const Spacer(),
              Text(
                '${_images.length}/${AppConstants.maxImagesPerReport}',
                style: TextStyle(
                    fontSize: 12, color: Colors.grey[500]),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                ..._images.map((img) => _ImageThumbnail(
                      file: File(img.path),
                      onRemove: () =>
                          setState(() => _images.remove(img)),
                    )),
                if (_images.length < AppConstants.maxImagesPerReport)
                  GestureDetector(
                    onTap: _pickImages,
                    child: Container(
                      width: 80,
                      height: 80,
                      margin: const EdgeInsets.only(right: 10),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.07),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: AppColors.primary.withOpacity(0.3),
                            style: BorderStyle.solid),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.add_photo_alternate,
                              color: AppColors.primary, size: 28),
                          const SizedBox(height: 4),
                          Text('Add',
                              style: TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 10)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ImageThumbnail extends StatelessWidget {
  final File file;
  final VoidCallback onRemove;

  const _ImageThumbnail({required this.file, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 80,
      height: 80,
      margin: const EdgeInsets.only(right: 10),
      child: Stack(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.file(file,
                width: 80, height: 80, fit: BoxFit.cover),
          ),
          Positioned(
            top: 2,
            right: 2,
            child: GestureDetector(
              onTap: onRemove,
              child: Container(
                width: 22,
                height: 22,
                decoration: const BoxDecoration(
                  color: Colors.red, shape: BoxShape.circle),
                child: const Icon(Icons.close,
                    color: Colors.white, size: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
