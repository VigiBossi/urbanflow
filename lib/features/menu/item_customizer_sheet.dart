import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/cart_provider.dart';
import '../../models/menu_item.dart';

class ItemCustomizerSheet extends StatefulWidget {
  final MenuItem item;

  const ItemCustomizerSheet({super.key, required this.item});

  @override
  State<ItemCustomizerSheet> createState() => _ItemCustomizerSheetState();
}

class _ItemCustomizerSheetState extends State<ItemCustomizerSheet> {
  int _quantity = 1;
  final List<String> _removedIngredients = [];
  final List<String> _selectedSauces = [];
  final _notesController = TextEditingController();

  static const _ingredients = ['Lettuce', 'Tomato', 'Onion', 'Pickles', 'Cheese', 'Sauce'];

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  double get _total => widget.item.price * _quantity;

  void _addToCart() {
    context.read<CartProvider>().addItem(
      widget.item,
      quantity: _quantity,
      removedIngredients: _removedIngredients,
      selectedSauces: _selectedSauces,
      specialInstructions: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
    );
    Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        left: 24, right: 24, top: 8,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Text(widget.item.emoji ?? '🍽️', style: const TextStyle(fontSize: 40)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.item.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                      Text(widget.item.category, style: const TextStyle(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                Text('${widget.item.price.toInt()} DEN', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.accent)),
              ],
            ),
            const SizedBox(height: 24),
            _sectionHeader('Quantity'),
            const SizedBox(height: 12),
            _quantitySelector(),
            const SizedBox(height: 20),
            _sectionHeader('Remove Ingredients'),
            const SizedBox(height: 10),
            _ingredientsToggle(),
            const SizedBox(height: 20),
            _sectionHeader('Choose Sauces'),
            const SizedBox(height: 10),
            _saucesToggle(),
            const SizedBox(height: 20),
            _sectionHeader('Special Instructions'),
            const SizedBox(height: 10),
            TextField(
              controller: _notesController,
              style: const TextStyle(color: AppColors.textPrimary),
              decoration: const InputDecoration(
                hintText: 'e.g. extra spicy, no onion...',
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _addToCart,
                child: Text('Add to Cart • ${_total.toInt()} DEN', style: const TextStyle(fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) =>
      Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 0.5));

  Widget _quantitySelector() {
    return Row(
      children: [
        _circleBtn(Icons.remove, () {
          if (_quantity > 1) setState(() => _quantity--);
        }),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Text('$_quantity', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        ),
        _circleBtn(Icons.add, () => setState(() => _quantity++)),
        const Spacer(),
        Text('Total: ${_total.toInt()} DEN', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.accent)),
      ],
    );
  }

  Widget _circleBtn(IconData icon, VoidCallback onTap) {
    return Material(
      color: AppColors.surfaceVariant,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Icon(icon, color: AppColors.textPrimary, size: 20),
        ),
      ),
    );
  }

  Widget _ingredientsToggle() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _ingredients.map((ing) {
        final removed = _removedIngredients.contains(ing);
        return GestureDetector(
          onTap: () => setState(() {
            if (removed) _removedIngredients.remove(ing);
            else _removedIngredients.add(ing);
          }),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: removed ? AppColors.error.withOpacity(0.15) : AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: removed ? AppColors.error : AppColors.cardBorder),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(removed ? Icons.close : Icons.check, size: 14, color: removed ? AppColors.error : AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(ing, style: TextStyle(color: removed ? AppColors.error : AppColors.textPrimary, fontSize: 13)),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _saucesToggle() {
    final sauces = widget.item.availableSauces;
    if (sauces.isEmpty) return const Text('No sauces available', style: TextStyle(color: AppColors.textSecondary));
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: sauces.map((sauce) {
        final selected = _selectedSauces.contains(sauce);
        return GestureDetector(
          onTap: () => setState(() {
            if (selected) _selectedSauces.remove(sauce);
            else _selectedSauces.add(sauce);
          }),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: selected ? AppColors.accent.withOpacity(0.15) : AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: selected ? AppColors.accent : AppColors.cardBorder),
            ),
            child: Text(sauce, style: TextStyle(color: selected ? AppColors.accent : AppColors.textPrimary, fontSize: 13, fontWeight: selected ? FontWeight.w600 : FontWeight.normal)),
          ),
        );
      }).toList(),
    );
  }
}
