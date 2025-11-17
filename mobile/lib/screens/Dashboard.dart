// lib/screens/Dashboard.dart
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:shortcakes/screens/AnalyticsScreen.dart';
import 'package:shortcakes/utils/firebase.dart';
import 'package:shortcakes/routes/routes.dart';

/// ⛅ Same API base URL as web's VITE_API_URL
const String apiBaseUrl = "https://shortcak.es";

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

// ----------------------
//   Link model
// ----------------------
class LinkItem {
  final String id;
  final String name;
  final int clicks;
  final String shortUrl;
  final String target;
  final String date;

  LinkItem({
    required this.id,
    required this.name,
    required this.clicks,
    required this.shortUrl,
    required this.target,
    required this.date,
  });
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _loadingLinks = true;
  List<LinkItem> _links = [];

  // Sorting + search
  String _searchQuery = "";
  String _sortBy = "date";
  bool _sortAsc = false;

  // Create-link form controllers + state
  final TextEditingController _urlController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _aliasController = TextEditingController();
  bool _creatingLink = false;

  @override
  void initState() {
    super.initState();
    _fetchLinks();
  }

  @override
  void dispose() {
    _urlController.dispose();
    _nameController.dispose();
    _aliasController.dispose();
    super.dispose();
  }

  // ---------------------------------------------------
  // 🔥 Fetch user's saved links from backend (/api/links)
  // ---------------------------------------------------
  Future<void> _fetchLinks() async {
    try {
      setState(() => _loadingLinks = true);

      final headers = await FirebaseService.authHeaders();
      final uri = Uri.parse("$apiBaseUrl/api/links");

      final res = await http.get(uri, headers: headers);

      if (res.statusCode >= 400) {
        throw Exception("Failed to fetch links: ${res.statusCode}");
      }

      final List<dynamic> jsonList = jsonDecode(res.body);

      final loaded = jsonList.map<LinkItem>((raw) {
        final map = raw as Map<String, dynamic>;

        final id = map["_id"] ?? "";
        final name = map["name"] ?? "Untitled";
        final target = map["redirect"] ?? "";
        final clicks = (map["totalClicks"] ?? 0) as int;
        final date = map["createDate"] ?? "";

        return LinkItem(
          id: id,
          name: name,
          clicks: clicks,
          shortUrl: "$apiBaseUrl/r/$id",
          target: target,
          date: date,
        );
      }).toList();

      setState(() {
        _links = loaded;
      });
    } catch (e) {
      debugPrint("Error fetching links: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Failed to load links: $e")),
        );
      }
    } finally {
      if (mounted) setState(() => _loadingLinks = false);
    }
  }

  // ---------------------------------------------------
  // ✨ Create a new short link (/api/links)
  // ---------------------------------------------------
  Future<void> _createShortLink() async {
    final url = _urlController.text.trim();
    final name = _nameController.text.trim();
    final alias = _aliasController.text.trim();

    if (url.isEmpty || name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter both URL and Name.")),
      );
      return;
    }

    setState(() {
      _creatingLink = true;
    });

    try {
      final headers = await FirebaseService.authHeaders();
      final uri = Uri.parse("$apiBaseUrl/api/links");

      final body = <String, dynamic>{
        "redirect": url, // backend expects 'redirect' as long URL
        "name": name,
      };
      if (alias.isNotEmpty) {
        body["alias"] = alias;
      }

      final res = await http.post(
        uri,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: jsonEncode(body),
      );

      if (res.statusCode >= 400) {
        throw Exception("Failed to create link: ${res.body}");
      }

      // Success: clear fields, reload links
      _urlController.clear();
      _nameController.clear();
      _aliasController.clear();

      await _fetchLinks();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Short link created!")),
        );
      }
    } catch (e) {
      debugPrint("Error creating link: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error creating link: $e")),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _creatingLink = false;
        });
      }
    }
  }

  // ---------------------------
  // Search + sort local helpers
  //----------------------------
  List<LinkItem> get _filteredLinks {
    final q = _searchQuery.toLowerCase();

    final filtered = _links.where((l) {
      return l.name.toLowerCase().contains(q) ||
          l.shortUrl.toLowerCase().contains(q) ||
          l.target.toLowerCase().contains(q);
    }).toList();

    filtered.sort((a, b) {
      int cmp;

      switch (_sortBy) {
        case "name":
          cmp = a.name.toLowerCase().compareTo(b.name.toLowerCase());
          break;
        case "clicks":
          cmp = a.clicks.compareTo(b.clicks);
          break;
        case "shortUrl":
          cmp = a.shortUrl.toLowerCase().compareTo(b.shortUrl.toLowerCase());
          break;
        case "target":
          cmp = a.target.toLowerCase().compareTo(b.target.toLowerCase());
          break;
        case "date":
        default:
          cmp = a.date.compareTo(b.date);
      }

      return _sortAsc ? cmp : -cmp;
    });

    return filtered;
  }

  void _setSort(String key) {
    setState(() {
      if (_sortBy == key) {
        _sortAsc = !_sortAsc;
      } else {
        _sortBy = key;
        _sortAsc = true;
      }
    });
  }

  // ------------------------------------------------------------
  // UI BUILD
  // ------------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: Stack(
        children: [
          // Gradient background
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
              ),
            ),
          ),

          // SVG overlay
          Positioned(
            bottom: 0,
            right: 0,
            child: SizedBox(
              width: size.width * 0.9,
              height: size.height,
              child: SvgPicture.asset(
                "assets/svg/decor.svg",
                colorFilter: const ColorFilter.mode(
                  Color(0xFFFFF8E7),
                  BlendMode.srcIn,
                ),
              ),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        "Dashboard",
                        style: GoogleFonts.quicksand(
                          fontSize: 32,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFFFF8E7),
                        ),
                      ),
                      const Spacer(),

                      // LOG OUT BUTTON
                      TextButton.icon(
                        onPressed: () async {
                          await FirebaseService.auth.signOut();

                          if (!mounted) return;

                          Navigator.pushNamedAndRemoveUntil(
                            context,
                            Routes.LOGINSCREEN,
                                (route) => false,
                          );
                        },
                        icon: const Icon(
                          Icons.logout,
                          size: 18,
                          color: Color(0xFFFFF8E7),
                        ),
                        label: Text(
                          "Log out",
                          style: GoogleFonts.quicksand(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFFFFF8E7),
                          ),
                        ),
                        style: TextButton.styleFrom(
                          foregroundColor: const Color(0xFFFFF8E7),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // CREATE A SHORT LINK BOX
                  Container(
                    width: double.infinity,
                    padding:
                    const EdgeInsets.symmetric(vertical: 22, horizontal: 22),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.55),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: const Color(0xFFFF1D4D).withOpacity(0.6),
                        width: 1.4,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFFF1D4D).withOpacity(0.3),
                          blurRadius: 12,
                          spreadRadius: 1,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // TITLE
                        Center(
                          child: Text(
                            "Create a Short Link",
                            style: GoogleFonts.quicksand(
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFFFFF8E7),
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // URL LABEL
                        Text(
                          "Enter a URL to shorten",
                          style: GoogleFonts.quicksand(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFFFFF8E7),
                          ),
                        ),
                        const SizedBox(height: 8),

                        // URL FIELD
                        TextField(
                          controller: _urlController,
                          style: const TextStyle(color: Color(0xFFFFF8E7)),
                          decoration: InputDecoration(
                            hintText: "https://example.com",
                            hintStyle:
                            const TextStyle(color: Color(0xFF7A7A7A)),
                            filled: true,
                            fillColor: Colors.transparent,
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                            enabledBorder: OutlineInputBorder(
                              borderSide:
                              const BorderSide(color: Color(0xFFFFF8E7)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderSide:
                              const BorderSide(color: Color(0xFFEE5A76)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // NAME LABEL
                        Text(
                          "Name",
                          style: GoogleFonts.quicksand(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFFFFF8E7),
                          ),
                        ),
                        const SizedBox(height: 8),

                        // NAME FIELD
                        TextField(
                          controller: _nameController,
                          style: const TextStyle(color: Color(0xFFFFF8E7)),
                          decoration: InputDecoration(
                            hintText: "ex. My Site",
                            hintStyle:
                            const TextStyle(color: Color(0xFF7A7A7A)),
                            filled: true,
                            fillColor: Colors.transparent,
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                            enabledBorder: OutlineInputBorder(
                              borderSide:
                              const BorderSide(color: Color(0xFFFFF8E7)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderSide:
                              const BorderSide(color: Color(0xFFEE5A76)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // CUSTOM ALIAS LABEL
                        Text(
                          "Custom Alias (optional)",
                          style: GoogleFonts.quicksand(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFFFFF8E7),
                          ),
                        ),
                        const SizedBox(height: 8),

                        // CUSTOM ALIAS FIELD
                        TextField(
                          controller: _aliasController,
                          style: const TextStyle(color: Color(0xFFFFF8E7)),
                          decoration: InputDecoration(
                            hintText: "custom alias",
                            hintStyle:
                            const TextStyle(color: Color(0xFF7A7A7A)),
                            filled: true,
                            fillColor: Colors.transparent,
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                            enabledBorder: OutlineInputBorder(
                              borderSide:
                              const BorderSide(color: Color(0xFFFFF8E7)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderSide:
                              const BorderSide(color: Color(0xFFEE5A76)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // SHORTEN BUTTON
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed:
                            _creatingLink ? null : _createShortLink,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFF1D4D),
                              foregroundColor: const Color(0xFFFFF8E7),
                              padding:
                              const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              shadowColor:
                              const Color(0xFFFF1D4D).withOpacity(0.5),
                              elevation: 6,
                            ),
                            child: _creatingLink
                                ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation(
                                    Color(0xFFFFF8E7)),
                              ),
                            )
                                : Text(
                              "Shorten",
                              style: GoogleFonts.quicksand(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFFFFF8E7),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Search bar (matching neon box)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.55),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: const Color(0xFFFF1D4D).withOpacity(0.6),
                        width: 1.4,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFFF1D4D).withOpacity(0.3),
                          blurRadius: 12,
                          spreadRadius: 1,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: TextField(
                      onChanged: (v) => setState(() => _searchQuery = v),
                      style: const TextStyle(color: Color(0xFFFFF8E7)),
                      decoration: const InputDecoration(
                        hintText: "Search links...",
                        hintStyle: TextStyle(color: Color(0xFF7A7A7A)),
                        border: InputBorder.none,
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Loading
                  if (_loadingLinks)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20),
                        child: CircularProgressIndicator(),
                      ),
                    ),

                  // Link cards
                  if (!_loadingLinks)
                    ..._filteredLinks.map(_buildLinkCard).toList(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------
  // Link Card (tappable -> AnalyticsScreen)
  // -------------------------------------------------
  Widget _buildLinkCard(LinkItem item) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => AnalyticsScreen(
              slug: item.id,
              initialName: item.name,
              initialTarget: item.target,
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.6),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: const Color(0xFFFF1D4D).withOpacity(0.4),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _row("Name", item.name),
            const SizedBox(height: 4),
            _row("Clicks", item.clicks.toString()),
            const SizedBox(height: 4),
            _row("Short URL", item.shortUrl, highlight: true),
            const SizedBox(height: 4),
            _row("Target", item.target, small: true),
            const SizedBox(height: 4),
            _row("Created", item.date),
          ],
        ),
      ),
    );
  }

  Widget _row(
      String label,
      String value, {
        bool highlight = false,
        bool small = false,
      }) {
    return Row(
      children: [
        Text(
          "$label: ",
          style: GoogleFonts.quicksand(
            fontSize: small ? 11 : 13,
            color: Colors.white.withOpacity(0.7),
            fontWeight: FontWeight.w500,
          ),
        ),
        Expanded(
          child: Text(
            value,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.right,
            style: GoogleFonts.quicksand(
              fontSize: small ? 11 : 13,
              fontWeight: FontWeight.w600,
              color: highlight
                  ? const Color(0xFFFF7B9C)
                  : const Color(0xFFFFF8E7),
            ),
          ),
        ),
      ],
    );
  }
}
