enum UserRole { citizen, municipality, admin }

class UserModel {
  final String id;
  final String email;
  final String name;
  final String? photoUrl;
  final UserRole role;
  final String? phone;
  final DateTime createdAt;
  final bool isPremium;
  final int reportsSubmitted;
  final int parkingSessions;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.photoUrl,
    required this.role,
    this.phone,
    required this.createdAt,
    this.isPremium = false,
    this.reportsSubmitted = 0,
    this.parkingSessions = 0,
  });

  bool get isMunicipality =>
      role == UserRole.municipality || role == UserRole.admin;

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return name.isNotEmpty ? name[0].toUpperCase() : 'U';
  }

  UserModel copyWith({
    String? name,
    String? photoUrl,
    String? phone,
    bool? isPremium,
    int? reportsSubmitted,
    int? parkingSessions,
  }) =>
      UserModel(
        id: id,
        email: email,
        name: name ?? this.name,
        photoUrl: photoUrl ?? this.photoUrl,
        role: role,
        phone: phone ?? this.phone,
        createdAt: createdAt,
        isPremium: isPremium ?? this.isPremium,
        reportsSubmitted: reportsSubmitted ?? this.reportsSubmitted,
        parkingSessions: parkingSessions ?? this.parkingSessions,
      );

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'] as String,
        email: json['email'] as String,
        name: json['name'] as String,
        photoUrl: json['photoUrl'] as String?,
        role: UserRole.values.firstWhere(
          (r) => r.name == json['role'],
          orElse: () => UserRole.citizen,
        ),
        phone: json['phone'] as String?,
        createdAt: DateTime.parse(json['createdAt'] as String),
        isPremium: json['isPremium'] as bool? ?? false,
        reportsSubmitted: json['reportsSubmitted'] as int? ?? 0,
        parkingSessions: json['parkingSessions'] as int? ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'photoUrl': photoUrl,
        'role': role.name,
        'phone': phone,
        'createdAt': createdAt.toIso8601String(),
        'isPremium': isPremium,
        'reportsSubmitted': reportsSubmitted,
        'parkingSessions': parkingSessions,
      };
}
