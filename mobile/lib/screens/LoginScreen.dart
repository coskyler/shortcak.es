import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../utils/firebase.dart';
// import 'package:google_sign_in/google_sign_in.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  LoginScreenState createState() => LoginScreenState();
}

class LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _loading = false;

  Future<void> _handleEmailLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      _showMessage("Please enter email and password.");
      return;
    }

    setState(() => _loading = true);

    try {
      await FirebaseService.auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = FirebaseService.auth.currentUser;
      /*
      if (user != null && !user.emailVerified) {
        _showMessage("Please verify your email before logging in.");
        setState(() => _loading = false);
        return;
      }*/

      //fetch and store ID token
      // await FirebaseService.getIdToken();

      FirebaseAuth.instance.authStateChanges().listen((user) async {
        if (user != null && user.emailVerified) {
          await user.getIdToken(); //update user token id
        }
      });

      Navigator.pushReplacementNamed(context, '/dashboard');
    } on FirebaseAuthException catch (e) {
      _showMessage(e.message ?? "Login failed.");
    }

    setState(() => _loading = false);
  }

  Future<void> _handlePasswordReset() async {
    final email = _emailController.text.trim();

    if (email.isEmpty) {
      _showMessage("Enter your email to reset your password.");
      return;
    }

    try {
      await FirebaseService.auth.sendPasswordResetEmail(email: email);
      _showMessage("Password reset email sent to $email");
    } on FirebaseAuthException catch (e) {
      _showMessage(e.message ?? "Error sending reset email.");
    }
  }

  Future<void> _handleGoogleSignIn() async {}
  //   try {
  //     final googleUser = await GoogleSignIn().signIn();
  //     if (googleUser == null) return; // User cancelled

  //     final googleAuth = await googleUser.authentication;

  //     final credential = GoogleAuthProvider.credential(
  //       accessToken: googleAuth.accessToken,
  //       idToken: googleAuth.idToken,
  //     );

  //     await FirebaseService.auth.signInWithCredential(credential);

  //     await FirebaseService.getIdToken();

  //     Navigator.pushReplacementNamed(context, '/dashboard');
  //   } catch (e) {
  //     _showMessage("Google sign-in failed.");
  //   }
  // }

  void _showMessage(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg)),
    );
  }

  Widget buildInput(String label, TextEditingController controller,
      {bool obscure = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(color: Color(0xFFFFF8E7), fontSize: 14)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          obscureText: obscure,
          style: const TextStyle(color: Color(0xFFFFF8E7)),
          decoration: InputDecoration(
            hintText: label,
            hintStyle: const TextStyle(color: Color(0xFFFFF8E7)),
            filled: true,
            fillColor: Colors.transparent,
            contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            enabledBorder: OutlineInputBorder(
              borderSide: const BorderSide(color: Color(0xFFFFF8E7)),
              borderRadius: BorderRadius.circular(12),
            ),
            focusedBorder: OutlineInputBorder(
              borderSide: const BorderSide(color: Color(0xFFEE5A76)),
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: Stack(
        children: [
          // gradient background
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.black.withOpacity(0.25),
                  const Color(0xFFFF1D4D).withOpacity(0.25),
                  Colors.black.withOpacity(0.25),
                ],
              ),
            ),
          ),

          Positioned(
            bottom: 0,
            right: 0,
            child: SizedBox(
              width: size.width * 0.9,
              height: size.height,
              child: SvgPicture.asset(
                'assets/svg/decor.svg',
                colorFilter: const ColorFilter.mode(
                  Color(0xFFFFF8E7),
                  BlendMode.srcIn,
                ),
                fit: BoxFit.cover,
              ),
            ),
          ),

          Align(
            alignment: Alignment.centerLeft,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(40),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SvgPicture.asset(
                      'assets/icons/favicon.svg',
                      width: 72,
                      height: 72,
                      colorFilter: const ColorFilter.mode(
                        Color(0xFFFFF8E7),
                        BlendMode.srcIn,
                      ),
                    ),

                    const SizedBox(height: 10),

                    Text("Log In",
                        style: GoogleFonts.quicksand(
                          fontSize: 36,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFFFF8E7),
                        )),

                    const SizedBox(height: 16),

                    buildInput("Email", _emailController),

                    const SizedBox(height: 16),

                    buildInput("Password", _passwordController, obscure: true),

                    const SizedBox(height: 8),

                    // === Forgot password button ===
                    TextButton(
                      onPressed: _handlePasswordReset,
                      child: const Text(
                        "Forgot password?",
                        style: TextStyle(
                          color: Color(0xFFFFF8E7),
                          fontSize: 14,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Login button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFDD4363)),
                          foregroundColor: const Color(0xFFDD4363),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: _loading ? null : _handleEmailLogin,
                        child: _loading
                            ? const CircularProgressIndicator(
                          color: Color(0xFFFFF8E7),
                        )
                            : const Text(
                          "Log in",
                          style: TextStyle(
                              fontWeight: FontWeight.w500, fontSize: 16),
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    Row(
                      children: const [
                        Expanded(
                            child: Divider(color: Color(0xFFFFF8E7))),
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 16),
                          child: Text("OR",
                              style: TextStyle(
                                  color: Color(0xFFFFF8E7), fontSize: 14)),
                        ),
                        Expanded(
                            child: Divider(color: Color(0xFFFFF8E7))),
                      ],
                    ),

                    const SizedBox(height: 12),

                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          side:
                          const BorderSide(color: Color(0xFFFFF8E7)),
                          foregroundColor: const Color(0xFFFFF8E7),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: _handleGoogleSignIn,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.g_mobiledata, size: 24),
                            SizedBox(width: 8),
                            Text("Log in with Google",
                                style: TextStyle(fontSize: 16)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}