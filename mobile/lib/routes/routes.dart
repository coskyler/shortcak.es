import 'package:flutter/material.dart';
import 'package:shortcakes/screens/LoginScreen.dart';
import 'package:shortcakes/screens/SignUpScreen.dart';
import 'package:shortcakes/screens/Dashboard.dart';

class Routes {
  static const String LOGINSCREEN = '/login';
  static const String SIGNUPSCREEN = '/signup';
  static const String DASHBOARD = '/dashboard';

  static Map<String, Widget Function(BuildContext)> get getroutes => {
    '/': (context) => LoginScreen(),
    LOGINSCREEN: (context) => LoginScreen(),
    SIGNUPSCREEN: (context) => SignUpScreen(),
    DASHBOARD: (context) => DashboardScreen(),
  };
}
