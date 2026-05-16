import 'package:flutter/material.dart';
import 'core/constants/app_theme.dart';
import 'features/home/home_screen.dart';

class UrbanFlowApp extends StatelessWidget {
  const UrbanFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UrbanFlow AI',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const HomeScreen(),
    );
  }
}
