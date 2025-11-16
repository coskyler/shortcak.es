import 'package:flutter/material.dart';
import 'package:shortcakes/screens/LoginScreen.dart';
import 'package:shortcakes/screens/SignUpScreen.dart';

class Routes {
  static const String LOGINSCREEN = '/login';
  static const String SIGNUPSCREEN = '/signup';

  static Map<String, Widget Function(BuildContext)> get getroutes => {
    '/': (context) => LoginScreen(),
    LOGINSCREEN: (context) => LoginScreen(),
    SIGNUPSCREEN: (context) => SignUpScreen(),
  };
}
