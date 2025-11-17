import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  //handle google sign in
  Future<void> _handleGoogleSignIn(BuildContext context) async {
    try {
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) return; // user cancelled

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      //attempt sign in with credentials
      await FirebaseAuth.instance.signInWithCredential(credential);

      Navigator.pushReplacementNamed(context, '/dashboard'); //move to next page after successful google sign in

      print("Signed in as ${FirebaseAuth.instance.currentUser!.displayName}"); //display account
    } catch (e) {
      print("Google sign-in failed: $e"); //display error code
    }
  }

  //user interface
  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      // Rough equivalent of a dark base behind the gradient (like neutral-950)
      backgroundColor: const Color(0xFF0A0A0A),
      body: Stack(
        children: [
          // === Background gradient (bg-gradient-to-br from-black/25 via-rose-500/25 to-black/25) ===
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,      // "to-br" in Tailwind
                end: Alignment.bottomRight,
                colors: [
                  Colors.black.withValues(alpha: 0.25),              // from-black/25
                  const Color(0xFFFF1D4D).withValues(alpha: 0.25),   // via-rose-500/25
                  Colors.black.withValues(alpha: 0.25),              // to-black/25
                ],
                stops: const [0.0, 0.5, 1.0],
              ),
            ),
          ),

          // === SVG decor (bottom-right, cream, like the <svg> in React) ===
          Positioned(
            bottom: 0,
            right: 0,
            child: Opacity(
              opacity: 0.9,
              child: SizedBox(
                width: size.width * 0.9,
                height: size.height,
                child: SvgPicture.asset(
                  'assets/svg/decor.svg',
                  // 'color' is deprecated, use colorFilter
                  colorFilter: const ColorFilter.mode(
                    Color(0xFFFFF8E7), // cream
                    BlendMode.srcIn,
                  ),
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),

          // === Foreground hero content (logo + HomeContent equivalent) ===
          Align(
            alignment: Alignment.centerLeft,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(40), // p-10
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Logo (favicon.svg equivalent)
                    SvgPicture.asset(
                      'assets/icons/favicon.svg',
                      width: 72,
                      height: 72,
                      colorFilter: const ColorFilter.mode(
                        Color(0xFFFFF8E7), // or cream, or rose gold
                        BlendMode.srcIn,
                      ),
                    ),

                    const SizedBox(height: 10),

                    // Headline: "Smarter Links. Deeper Insights. Shortcak.es"
                    Text(
                      "Smarter Links.\nDeeper Insights.",
                      style: GoogleFonts.quicksand(
                        fontSize: 36,
                        fontWeight: FontWeight.w700,
                        height: 1.2,
                        //letterSpacing: -0.5,
                        color: Color(0xFFFFF8E7), // cream
                      ),
                    ),
                    Text(
                      "Shortcak.es",
                      style: GoogleFonts.quicksand(
                        fontSize: 36,
                        fontWeight: FontWeight.w700,
                        height: 1.2,
                        //letterSpacing: -0.5,
                        color: Color(0xFFEE5A76), // cream
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Description paragraph
                    const Text(
                      "Transform every click into real data. "
                          "Track engagement, location, and growth—all in one dashboard.",
                      style: TextStyle(
                        color: Color(0xFFFFF8E7),
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Auth buttons: Sign Up + Sign In with Google
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Sign Up
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(
                                color: Color(0xFFDD4363), // like text-rose-400 0xFFF97373
                              ),
                              foregroundColor: const Color(0xFFDD4363),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 14,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () {
                              Navigator.pushNamed(context, '/signup');
                            },
                            child: const Text(
                              "Create Account",
                              style: TextStyle(
                                fontWeight: FontWeight.w500,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Sign In with Google
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(
                                color: Color(0xFFFFF8E7), // cream
                              ),
                              foregroundColor: const Color(0xFFFFF8E7),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 14,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () => _handleGoogleSignIn(context),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              mainAxisSize: MainAxisSize.min,
                              children: const [
                                Icon(Icons.g_mobiledata, size: 24),
                                SizedBox(width: 8),
                                Text(
                                  "Sign Up with Google",
                                  style: TextStyle(
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // "Already have an account? Log in"
                    Row(
                      children: [
                        const Text(
                          "Already have an account? ",
                          style: TextStyle(
                            color: Color(0xFFFFF8E7),
                            fontSize: 13,
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, '/login');
                          },
                          child: const Text(
                            "Log in",
                            style: TextStyle(
                              color: Color(0xFFDD4363), // rose-ish
                              fontSize: 13,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
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
