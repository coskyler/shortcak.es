import 'package:flutter/material.dart';
import 'package:shortcakes/screens/LoginScreen.dart';
import 'package:shortcakes/screens/CardsScreen.dart';

class Routes {
  static const String LOGINSCREEN = '/login';
  static const String CARDSSCREEN = '/cards';

  static Map<String, Widget Function(BuildContext)> get getroutes => {
    '/': (context) => LoginScreen(),
    LOGINSCREEN: (context) => LoginScreen(),
    CARDSSCREEN: (context) => CardsScreen(),
  };
}
