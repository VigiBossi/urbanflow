/// Municipal departments that handle reports.
enum Department { roads, lighting, sanitation, publicSpaces }

/// A municipality employee that reports can be assigned to.
class StaffMember {
  const StaffMember({
    required this.id,
    required this.name,
    required this.department,
  });

  final String id;
  final String name;
  final Department department;

  factory StaffMember.fromJson(Map<String, dynamic> json) => StaffMember(
    id: json['id'] as String,
    name: json['name'] as String,
    department: Department.values.byName(json['department'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'department': department.name,
  };
}
