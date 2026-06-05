import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/cart_provider.dart';

class OrderTypeScreen extends StatefulWidget {
  final VoidCallback onConfirmed;

  const OrderTypeScreen({super.key, required this.onConfirmed});

  @override
  State<OrderTypeScreen> createState() => _OrderTypeScreenState();
}

class _OrderTypeScreenState extends State<OrderTypeScreen> {
  String _type = 'dine_in';
  int? _selectedTable;
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  void _confirm() {
    final cart = context.read<CartProvider>();
    if (_type == 'dine_in') {
      if (_selectedTable == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a table'), backgroundColor: AppColors.error),
        );
        return;
      }
      cart.setDineIn(_selectedTable!);
    } else {
      if (!_formKey.currentState!.validate()) return;
      cart.setDelivery(
        name: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        address: _addressController.text.trim(),
      );
    }
    widget.onConfirmed();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('New Order'),
        backgroundColor: AppColors.surface,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Order Type', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            const SizedBox(height: 20),
            Row(
              children: [
                _typeCard('dine_in', Icons.table_restaurant, 'Dine In'),
                const SizedBox(width: 16),
                _typeCard('delivery', Icons.delivery_dining, 'Delivery'),
              ],
            ),
            const SizedBox(height: 32),
            Expanded(
              child: _type == 'dine_in' ? _buildDineIn() : _buildDelivery(),
            ),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _confirm,
                icon: const Icon(Icons.restaurant_menu),
                label: const Text('Continue to Menu'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _typeCard(String type, IconData icon, String label) {
    final selected = _type == type;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _type = type),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: selected ? AppColors.accent.withOpacity(0.15) : AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected ? AppColors.accent : AppColors.cardBorder,
              width: selected ? 2 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, size: 40, color: selected ? AppColors.accent : AppColors.textSecondary),
              const SizedBox(height: 10),
              Text(label, style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: selected ? AppColors.accent : AppColors.textPrimary,
              )),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDineIn() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Select Table', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
        const SizedBox(height: 12),
        Expanded(
          child: GridView.builder(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 5, crossAxisSpacing: 10, mainAxisSpacing: 10,
            ),
            itemCount: 20,
            itemBuilder: (_, i) {
              final table = i + 1;
              final selected = _selectedTable == table;
              return GestureDetector(
                onTap: () => setState(() => _selectedTable = table),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  decoration: BoxDecoration(
                    color: selected ? AppColors.accent : AppColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: selected ? AppColors.accent : AppColors.cardBorder),
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.table_restaurant, size: 22, color: selected ? Colors.white : AppColors.textSecondary),
                        const SizedBox(height: 4),
                        Text('$table', style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: selected ? Colors.white : AppColors.textPrimary,
                        )),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDelivery() {
    return Form(
      key: _formKey,
      child: ListView(
        children: [
          TextFormField(
            controller: _nameController,
            style: const TextStyle(color: AppColors.textPrimary),
            decoration: const InputDecoration(
              labelText: 'Customer Name *',
              prefixIcon: Icon(Icons.person_outline),
            ),
            validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _phoneController,
            style: const TextStyle(color: AppColors.textPrimary),
            decoration: const InputDecoration(
              labelText: 'Phone Number *',
              prefixIcon: Icon(Icons.phone_outlined),
            ),
            keyboardType: TextInputType.phone,
            validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _addressController,
            style: const TextStyle(color: AppColors.textPrimary),
            decoration: const InputDecoration(
              labelText: 'Address / Notes',
              prefixIcon: Icon(Icons.location_on_outlined),
            ),
            maxLines: 3,
          ),
        ],
      ),
    );
  }
}
