import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../utils/firebase.dart';

class VerificationScreen extends StatefulWidget {
  const VerificationScreen({super.key});

  @override
  VerificationScreenState createState() => VerificationScreenState();
}

class VerificationScreenState extends State<VerificationScreen> {
  User? user;
  Timer? timer;
  bool isVerified = false;
  bool canResend = true;

  @override
  void initState() {
    super.initState();
    user = FirebaseAuth.instance.currentUser;

    //start a timer to check email verification every 3 seconds
    timer = Timer.periodic(const Duration(seconds: 3), (_) => checkVerification());
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  Future<void> checkVerification() async {
    timer = Timer.periodic(const Duration(seconds: 6), (_) async {
      await FirebaseAuth.instance.currentUser?.reload();
      final freshUser = FirebaseAuth.instance.currentUser;
      if (freshUser?.emailVerified ?? false) { //verification successful
        //final token = await FirebaseService.getIdToken(forceRefresh: true);
        FirebaseService.getIdToken(forceRefresh: true); //this should refresh the global file's token, if not use above line

        timer?.cancel();
        Navigator.pushReplacementNamed(context, '/dashboard');
      }
    });
  }

  Future<void> resendVerification() async {
    if (canResend) {
      await user?.sendEmailVerification();
      setState(() => canResend = false);

      // cooldown before allowing resend
      Future.delayed(const Duration(seconds: 10), () {
        setState(() => canResend = true);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.email_outlined, size: 80, color: Colors.white),
              const SizedBox(height: 24),
              Text(
                'Verification Email Sent!',
                style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Text(
                'Please verify your email: ${user?.email}',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white70, fontSize: 16),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: canResend ? resendVerification : null,
                child: Text(canResend ? 'Resend Email' : 'Wait before resending'),
              ),
              const SizedBox(height: 16),
              Text(
                'This screen will automatically update once verified.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white54, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
