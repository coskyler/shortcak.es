// lib/utils/firebase.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

/// NOTE:
/// You can either (A) use FlutterFire's generated `firebase_options.dart`,
/// or (B) hard-code the config like in the web file.
/// Below I’ll show the hard-coded version to mirror frontend/firebase.ts.

const _firebaseConfig = FirebaseOptions(
  apiKey: "AIzaSyDNQEa_xZEqWSFozpoHK5Z3FAiIuiyNRQs",
  authDomain: "shortcak-es.firebaseapp.com",
  projectId: "shortcak-es",
  storageBucket: "shortcak-es.firebasestorage.app",
  messagingSenderId: "834175067279",
  appId: "1:834175067279:web:a9865537a51641cb423cfa",
  // measurementId is web-only; safe to omit on mobile
);

class FirebaseService {
  static bool _initialized = false;
  static String? _cachedToken;

  static FirebaseAuth get auth => FirebaseAuth.instance;
  static String? get cachedToken => _cachedToken;

  /// Call this once in `main()` *before* runApp.
  static Future<void> initialize() async {
    if (_initialized) return;

    await Firebase.initializeApp(options: _firebaseConfig);

    // Mirror `auth.onAuthStateChanged` from the web version
    auth.idTokenChanges().listen((user) async {
      if (user != null) {
        final token = await user.getIdToken(true);
        _cachedToken = token;
        debugPrint("[DEBUG] Firebase ID Token: $token");
      } else {
        _cachedToken = null;
        debugPrint("[DEBUG] Firebase: user signed out");
      }
    });

    _initialized = true;
  }

  /// Get a (fresh) ID token. Also updates the cache.
  static Future<String?> getIdToken({bool forceRefresh = false}) async {
    final user = auth.currentUser;
    if (user == null) return null;

    final token = await user.getIdToken(forceRefresh);
    _cachedToken = token;
    return token;
  }

  /// Convenience method for building auth headers for API calls.
  static Future<Map<String, String>> authHeaders() async {
    final token = await getIdToken();
    if (token == null) return {"Content-Type": "application/json"};
    return {
      "Content-Type": "application/json",
      "Authorization": "Bearer $token",
    };
  }
}
