/// Role of a signed-in user; drives navigation and permissions.
enum UserRole { citizen, municipality }

/// An authenticated user of the app.
class AppUser {
  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  final String id;
  final String name;
  final String email;
  final UserRole role;

  bool get isMunicipality => role == UserRole.municipality;

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
    id: json['id'] as String,
    name: json['name'] as String,
    email: json['email'] as String,
    role: UserRole.values.byName(json['role'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role.name,
  };

  @override
  bool operator ==(Object other) =>
      other is AppUser &&
      other.id == id &&
      other.email == email &&
      other.role == role;

  @override
  int get hashCode => Object.hash(id, email, role);
}
