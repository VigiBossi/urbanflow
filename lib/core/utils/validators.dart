enum ValidationError { required, invalid, tooShort }

/// Pure form validators returning error codes (localized by the UI).
abstract final class Validators {
  static final RegExp _email = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
  static final RegExp _plate = RegExp(r'^[A-Z0-9]{4,10}$');

  static ValidationError? email(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return ValidationError.required;
    if (!_email.hasMatch(v)) return ValidationError.invalid;
    return null;
  }

  static ValidationError? password(String? value) {
    final v = value ?? '';
    if (v.isEmpty) return ValidationError.required;
    if (v.length < 6) return ValidationError.tooShort;
    return null;
  }

  /// License plate: 4-10 letters/digits, spaces and dashes ignored.
  static ValidationError? plate(String? value) {
    final v = (value ?? '').toUpperCase().replaceAll(RegExp(r'[\s-]'), '');
    if (v.isEmpty) return ValidationError.required;
    if (!_plate.hasMatch(v)) return ValidationError.invalid;
    return null;
  }

  static ValidationError? description(String? value, {int minLength = 10}) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return ValidationError.required;
    if (v.length < minLength) return ValidationError.tooShort;
    return null;
  }
}
