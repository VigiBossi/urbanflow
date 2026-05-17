class Validators {
  static String? email(String? v) {
    if (v == null || v.trim().isEmpty) return 'Email is required';
    final re = RegExp(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$');
    if (!re.hasMatch(v.trim())) return 'Enter a valid email';
    return null;
  }

  static String? password(String? v) {
    if (v == null || v.isEmpty) return 'Password is required';
    if (v.length < 6) return 'Password must be at least 6 characters';
    return null;
  }

  static String? required(String? v, [String field = 'This field']) {
    if (v == null || v.trim().isEmpty) return '$field is required';
    return null;
  }

  static String? name(String? v) {
    if (v == null || v.trim().isEmpty) return 'Name is required';
    if (v.trim().length < 2) return 'Name must be at least 2 characters';
    return null;
  }

  static String? phone(String? v) {
    if (v == null || v.isEmpty) return null; // optional
    final re = RegExp(r'^\+?[\d\s\-\(\)]{7,15}$');
    if (!re.hasMatch(v)) return 'Enter a valid phone number';
    return null;
  }

  static String? licensePlate(String? v) {
    if (v == null || v.trim().isEmpty) return 'License plate is required';
    if (v.trim().length < 3) return 'Enter a valid license plate';
    return null;
  }

  static String? minLength(String? v, int min, [String field = 'Field']) {
    if (v == null || v.trim().length < min) {
      return '$field must be at least $min characters';
    }
    return null;
  }

  static String? maxLength(String? v, int max, [String field = 'Field']) {
    if (v != null && v.trim().length > max) {
      return '$field must not exceed $max characters';
    }
    return null;
  }

  static String? compose(String? v, List<String? Function(String?)> rules) {
    for (final rule in rules) {
      final result = rule(v);
      if (result != null) return result;
    }
    return null;
  }
}
