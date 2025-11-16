import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';

class SignupScreen extends StatelessWidget {
  const SignupScreen({super.key});

  // TODO: hook this up to your real Google sign-in flow.
  Future<void> _handleGoogleSignIn(BuildContext context) async {
    // Implement your Google sign-in logic here.
    // For example, call your auth service then navigate to '/dashboard'.
    // Navigator.pushNamed(context, '/dashboard');
  }

  Widget buildInput(String label, String placeholder, {bool obscure = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFFFFF8E7),
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          obscureText: obscure,
          style: const TextStyle(color: Color(0xFFFFF8E7)),
          decoration: InputDecoration(
            hintText: placeholder,
            hintStyle: const TextStyle(color: Color(0xFFFFF8E7)),
            filled: true,
            fillColor: Colors.transparent,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
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

                    // Headline: "Create Account"
                    Text(
                      "Create Account",
                      style: GoogleFonts.quicksand(
                        fontSize: 36,
                        fontWeight: FontWeight.w700,
                        height: 1.2,
                        //letterSpacing: -0.5,
                        color: Color(0xFFFFF8E7), // cream
                      ),
                    ),

                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(child: buildInput("First Name", "Enter your first name")),
                        const SizedBox(width: 16),
                        Expanded(child: buildInput("Last Name", "Enter your last name")),
                        ],
                    ),

                    const SizedBox(height: 16),

                    buildInput("Email", "Enter your email"),

                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(child: buildInput("Password", "Enter your password", obscure: true)),
                        const SizedBox(width: 16),
                        Expanded(child: buildInput("Verify Password", "Verify your password", obscure: true))
                      ],
                    ),


                    const SizedBox(height: 32),

                    // Auth buttons: Sign Up with Google
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
                              "Sign Up",
                              style: TextStyle(
                                fontWeight: FontWeight.w500,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 8),
                        Row(
                          children: const[
                            Expanded(child: Divider(color: Color(0xFFFFF8E7))),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 16),
                              child: Text(
                                "OR",
                                style: TextStyle(
                                  color: Color(0xFFFFF8E7),
                                  fontSize: 14,
                                ),
                              ),
                            ),
                            Expanded(child: Divider(color: Color(0xFFFFF8E7))),
                          ],
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
