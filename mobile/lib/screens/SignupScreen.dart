import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'VerificationScreen.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  // --- Controllers ---
  final TextEditingController firstController = TextEditingController();
  final TextEditingController lastController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passController = TextEditingController();
  final TextEditingController confirmController = TextEditingController();

  bool isLoading = false;

  // --- Firebase Sign Up Function ---
  Future<void> signUp() async {
    final email = emailController.text.trim();
    final password = passController.text.trim();
    final confirm = confirmController.text.trim();

    if (email.isEmpty || password.isEmpty || confirm.isEmpty) {
      showMessage("Please fill out all fields.");
      return;
    }

    if (password != confirm) {
      showMessage("Passwords do not match.");
      return;
    }

    setState(() => isLoading = true);

    try {
      //create user in firebase
      UserCredential cred = await FirebaseAuth.instance
          .createUserWithEmailAndPassword(email: email, password: password);

      //send email verification
      await cred.user?.sendEmailVerification();

      showMessage("Account created! Please check your email to verify.");

      //navigate to verification screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const VerificationScreen()),
      );

    } on FirebaseAuthException catch (e) {
      showMessage(e.message ?? "Error creating account.");
    } finally {
      setState(() => isLoading = false);
    }
  }

  void showMessage(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg)),
    );
  }

  //input field builder
  Widget buildInput(
      String placeholder,
      TextEditingController controller, {
        bool obscure = false,
      }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          obscureText: obscure,
          style: const TextStyle(color: Color(0xFFFFF8E7)),
          decoration: InputDecoration(
            hintText: placeholder,
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

  //user interface
  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: Stack(
        children: [
          // BG gradient and SVG decoration (unchanged)
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.black.withOpacity(0.25),
                  const Color(0xFFFF1D4D).withOpacity(0.25),
                  Colors.black.withOpacity(0.25),
                ],
                stops: const [0.0, 0.5, 1.0],
              ),
            ),
          ),
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
                  colorFilter: const ColorFilter.mode(
                    Color(0xFFFFF8E7),
                    BlendMode.srcIn,
                  ),
                  fit: BoxFit.cover,
                ),
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

                    Text(
                      "Create Account",
                      style: GoogleFonts.quicksand(
                        fontSize: 36,
                        fontWeight: FontWeight.w700,
                        height: 1.2,
                        color: const Color(0xFFFFF8E7),
                      ),
                    ),

                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(
                            child:
                            buildInput("First Name", firstController)),
                        const SizedBox(width: 16),
                        Expanded(
                            child: buildInput("Last Name", lastController)),
                      ],
                    ),

                    const SizedBox(height: 16),

                    buildInput("Email", emailController),

                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(
                            child: buildInput(
                                "Password", passController,
                                obscure: true)),
                        const SizedBox(width: 16),
                        Expanded(
                          child: buildInput(
                            "Confirm Password",
                            confirmController,
                            obscure: true,
                          ),
                        )
                      ],
                    ),

                    const SizedBox(height: 32),

                    // ========= SIGN UP BUTTON =========
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
                        onPressed: isLoading ? null : signUp,
                        child: isLoading
                            ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Color(0xFFDD4363)),
                        )
                            : const Text(
                          "Sign Up",
                          style: TextStyle(
                              fontWeight: FontWeight.w500,
                              fontSize: 16),
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    Row(
                      children: [
                        const Text(
                          "Already have an account? ",
                          style: TextStyle(
                              color: Color(0xFFFFF8E7), fontSize: 13),
                        ),
                        GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, '/login');
                          },
                          child: const Text(
                            "Log in",
                            style: TextStyle(
                              color: Color(0xFFDD4363),
                              fontSize: 13,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        )
                      ],
                    )
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}