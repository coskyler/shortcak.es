import 'package:flutter/material.dart';
import 'package:shortcakes/screens/HomeScreen.dart';
import 'package:shortcakes/screens/LoginScreen.dart';
import 'package:shortcakes/screens/SignUpScreen.dart';
import 'package:shortcakes/screens/VerificationScreen.dart';
import 'package:shortcakes/screens/Dashboard.dart';
//import 'package:shortcakes/screens/AnalyticsScreen.dart';

class Routes {
  static const String HOMESCREEN = '/';
  static const String LOGINSCREEN = '/login';
  static const String SIGNUPSCREEN = '/signup';
  static const String VERIFICATIONSCREEN = '/verification';
  static const String DASHBOARD = '/dashboard';
  //static const String ANALYTICSSCREEN = '/analytics';

  static Map<String, Widget Function(BuildContext)> get getroutes => {
    //'/': (context) => AnalyticsScreen(),
    HOMESCREEN: (context) => HomeScreen(),
    SIGNUPSCREEN: (context) => SignUpScreen(),
    LOGINSCREEN: (context) => LoginScreen(),
    VERIFICATIONSCREEN: (context) => VerificationScreen(),
    DASHBOARD: (context) => DashboardScreen(),
    //ANALYTICSSCREEN: (context) => AnalyticsScreen(),
  };
}
