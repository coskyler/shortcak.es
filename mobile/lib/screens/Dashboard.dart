// lib/screens/Dashboard.dart
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:shortcakes/screens/AnalyticsScreen.dart';
import 'package:shortcakes/utils/firebase.dart';

/// ⛅ Same API base URL as web's VITE_API_URL
const String apiBaseUrl = "https://YOUR_API_URL_HERE";

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

  // Sorting + search (same as before)
  String _searchQuery = "";
  String _sortBy = "date";
  bool _sortAsc = false;

  @override
  void initState() {
    super.initState();
    _fetchLinks();
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
        final target = map["target"] ?? "";
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
                  Text(
                    "Dashboard",
                    style: GoogleFonts.quicksand(
                      fontSize: 32,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFFFFF8E7),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Search bar
                  TextField(
                    onChanged: (v) => setState(() => _searchQuery = v),
                    style: const TextStyle(color: Color(0xFFFFF8E7)),
                    decoration: InputDecoration(
                      hintText: "Search links...",
                      hintStyle: TextStyle(
                        color: Colors.white.withOpacity(0.5),
                      ),
                      filled: true,
                      fillColor: Colors.black.withOpacity(0.6),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFFF1D4D)),
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

  Widget _row(String label, String value,
      {bool highlight = false, bool small = false}) {
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
