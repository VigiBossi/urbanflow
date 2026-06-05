import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/menu_provider.dart';
import '../../core/providers/cart_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../models/menu_item.dart';
import 'item_customizer_sheet.dart';
import '../cart/cart_screen.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MenuProvider>().loadItems();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openCustomizer(MenuItem item) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ItemCustomizerSheet(item: item),
    );
  }

  void _openCart() {
    Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<MenuProvider, CartProvider>(
      builder: (_, menu, cart, __) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('Menu'),
          backgroundColor: AppColors.surface,
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_cart_outlined),
                    onPressed: cart.itemCount > 0 ? _openCart : null,
                    color: cart.itemCount > 0 ? AppColors.accent : AppColors.textSecondary,
                  ),
                  if (cart.itemCount > 0)
                    Positioned(
                      right: 6, top: 6,
                      child: Container(
                        width: 18, height: 18,
                        decoration: const BoxDecoration(color: AppColors.accent, shape: BoxShape.circle),
                        child: Center(child: Text('${cart.itemCount}', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
        body: Column(
          children: [
            _buildSearch(menu),
            _buildCategories(menu),
            Expanded(child: _buildGrid(menu)),
          ],
        ),
        floatingActionButton: cart.itemCount > 0
            ? FloatingActionButton.extended(
                onPressed: _openCart,
                backgroundColor: AppColors.accent,
                icon: const Icon(Icons.shopping_cart, color: Colors.white),
                label: Text('${cart.itemCount} items • ${cart.total.toInt()} DEN', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              )
            : null,
      ),
    );
  }

  Widget _buildSearch(MenuProvider menu) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: TextField(
        controller: _searchController,
        style: const TextStyle(color: AppColors.textPrimary),
        decoration: InputDecoration(
          hintText: 'Search menu...',
          prefixIcon: const Icon(Icons.search, color: AppColors.textSecondary),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textSecondary),
                  onPressed: () {
                    _searchController.clear();
                    menu.setSearch('');
                  },
                )
              : null,
        ),
        onChanged: menu.setSearch,
      ),
    );
  }

  Widget _buildCategories(MenuProvider menu) {
    return SizedBox(
      height: 52,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        itemCount: menu.categories.length,
        itemBuilder: (_, i) {
          final cat = menu.categories[i];
          final selected = cat == menu.selectedCategory;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(cat),
              selected: selected,
              onSelected: (_) => menu.selectCategory(cat),
            ),
          );
        },
      ),
    );
  }

  Widget _buildGrid(MenuProvider menu) {
    final items = menu.filteredItems;
    if (items.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 60, color: AppColors.textSecondary),
            SizedBox(height: 12),
            Text('No items found', style: TextStyle(color: AppColors.textSecondary, fontSize: 16)),
          ],
        ),
      );
    }
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 220,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: 0.78,
      ),
      itemCount: items.length,
      itemBuilder: (_, i) => _buildItemCard(items[i]),
    );
  }

  Widget _buildItemCard(MenuItem item) {
    return GestureDetector(
      onTap: () => _openCustomizer(item),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 5,
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(13)),
                ),
                width: double.infinity,
                child: Center(child: Text(item.emoji ?? '🍽️', style: const TextStyle(fontSize: 54))),
              ),
            ),
            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
                    const Spacer(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('${item.price.toInt()} DEN', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.accent, fontSize: 14)),
                        Container(
                          decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(8)),
                          child: const Icon(Icons.add, color: Colors.white, size: 20),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
