// lib/screens/DashboardScreen.dart
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shortcakes/screens/AnalyticsScreen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class LinkItem {
  final String id;
  final String name;
  final int clicks;
  final String shortUrl;
  final String target;
  final String date; // ISO-ish string for now

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
  // Form controllers
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _urlController = TextEditingController();
  final TextEditingController _aliasController = TextEditingController();
  final TextEditingController _searchController = TextEditingController();

  // Sort state
  String _sortBy = 'date'; // name | clicks | shortUrl | target | date
  bool _sortAsc = false;   // false = desc

  // For now: dummy data, like the web dashboard example
  final List<LinkItem> _links = [
    LinkItem(
      id: "home",
      name: "Homepage",
      clicks: 1234,
      shortUrl: "shortcak.es/r/home",
      target: "https://example.com",
      date: "2024-11-01",
    ),
    LinkItem(
      id: "docs",
      name: "Docs",
      clicks: 456,
      shortUrl: "shortcak.es/r/docs",
      target: "https://example.com/docs",
      date: "2024-10-15",
    ),
    LinkItem(
      id: "blog",
      name: "Blog",
      clicks: 789,
      shortUrl: "shortcak.es/r/blog",
      target: "https://example.com/blog",
      date: "2024-09-30",
    ),
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _urlController.dispose();
    _aliasController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _handleCreateLink() {
    final name = _nameController.text.trim();
    final url = _urlController.text.trim();
    final alias = _aliasController.text.trim();

    if (url.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter a URL to shorten.")),
      );
      return;
    }

    // TODO: Replace this with a real API call (e.g. POST /api/links)
    // using your existing backend / auth story.
    final slug = alias.isNotEmpty ? alias : "new-link-${DateTime.now().millisecondsSinceEpoch}";
    final shortUrl = "shortcak.es/r/$slug";

    final newItem = LinkItem(
      id: slug,
      name: name.isNotEmpty ? name : "New Link",
      clicks: 0,
      shortUrl: shortUrl,
      target: url,
      date: DateTime.now().toIso8601String().substring(0, 10),
    );

    setState(() {
      _links.insert(0, newItem);
      _nameController.clear();
      _urlController.clear();
      _aliasController.clear();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Link created: $shortUrl")),
    );
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

  List<LinkItem> get _filteredAndSortedLinks {
    final query = _searchController.text.trim().toLowerCase();

    List<LinkItem> filtered = _links.where((link) {
      if (query.isEmpty) return true;
      return link.name.toLowerCase().contains(query) ||
          link.shortUrl.toLowerCase().contains(query) ||
          link.target.toLowerCase().contains(query);
    }).toList();

    int compare(LinkItem a, LinkItem b) {
      int cmp;
      switch (_sortBy) {
        case 'name':
          cmp = a.name.toLowerCase().compareTo(b.name.toLowerCase());
          break;
        case 'clicks':
          cmp = a.clicks.compareTo(b.clicks);
          break;
        case 'shortUrl':
          cmp = a.shortUrl.toLowerCase().compareTo(b.shortUrl.toLowerCase());
          break;
        case 'target':
          cmp = a.target.toLowerCase().compareTo(b.target.toLowerCase());
          break;
        case 'date':
        default:
          cmp = a.date.compareTo(b.date);
          break;
      }
      return _sortAsc ? cmp : -cmp;
    }

    filtered.sort(compare);
    return filtered;
  }

  Widget _buildSortChip(String label, String key) {
    final isActive = _sortBy == key;
    final arrow = !isActive
        ? ''
        : _sortAsc
        ? ' ▲'
        : ' ▼';

    return GestureDetector(
      onTap: () => _setSort(key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        margin: const EdgeInsets.only(right: 8),
        decoration: BoxDecoration(
          color: isActive
              ? const Color(0xFFFF1D4D).withOpacity(0.9)
              : Colors.black.withOpacity(0.4),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: const Color(0xFFFF1D4D).withOpacity(0.4),
          ),
        ),
        child: Text(
          label + arrow,
          style: GoogleFonts.quicksand(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: const Color(0xFFFFF8E7),
          ),
        ),
      ),
    );
  }

  Widget _buildLinkCard(LinkItem item) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => AnalyticsScreen(
              slug: item.id,          // this matches web: /analytics/:id
              initialName: item.name,
              initialTarget: item.target,
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
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
            _row("Link", item.shortUrl, highlight: true),
            const SizedBox(height: 4),
            _row("Redirects To", item.target, small: true),
            const SizedBox(height: 4),
            _row("Date", item.date),
          ],
        ),
      ),
    );
  }


  Widget _row(String label, String value,
      {bool highlight = false, bool small = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "$label: ",
          style: GoogleFonts.quicksand(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: const Color(0xFFFFF8E7).withOpacity(0.7),
          ),
        ),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: GoogleFonts.quicksand(
              fontSize: small ? 11 : 13,
              fontWeight: FontWeight.w500,
              color: highlight
                  ? const Color(0xFFFF7B9C)
                  : const Color(0xFFFFF8E7),
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
          // === Background gradient (same vibe as Login/Signup) ===
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.black.withValues(alpha: 0.25),
                  const Color(0xFFFF1D4D).withValues(alpha: 0.25),
                  Colors.black.withValues(alpha: 0.25),
                ],
                stops: const [0.0, 0.5, 1.0],
              ),
            ),
          ),

          // === SVG decor (bottom-right, cream), like web ===
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
                ),
              ),
            ),
          ),

          // === Main content ===
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding:
                const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 600),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Text(
                        "Dashboard",
                        style: GoogleFonts.quicksand(
                          fontSize: 32,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFFFF8E7),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "Create short links and manage your redirects.",
                        style: GoogleFonts.quicksand(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: const Color(0xFFFFF8E7).withOpacity(0.8),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Create Link Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: const Color(0xFFFF1D4D).withOpacity(0.4),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Create a Short Link",
                              style: GoogleFonts.quicksand(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFFFFF8E7),
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Name
                            Text(
                              "Enter a Name for this URL",
                              style: GoogleFonts.quicksand(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: const Color(0xFFFFF8E7),
                              ),
                            ),
                            const SizedBox(height: 6),
                            TextField(
                              controller: _nameController,
                              style: GoogleFonts.quicksand(
                                color: const Color(0xFFFFF8E7),
                              ),
                              decoration: _inputDecoration(
                                hint: "ex. Dashboard",
                              ),
                            ),
                            const SizedBox(height: 12),

                            // URL
                            Text(
                              "Enter a URL to shorten",
                              style: GoogleFonts.quicksand(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: const Color(0xFFFFF8E7),
                              ),
                            ),
                            const SizedBox(height: 6),
                            TextField(
                              controller: _urlController,
                              keyboardType: TextInputType.url,
                              style: GoogleFonts.quicksand(
                                color: const Color(0xFFFFF8E7),
                              ),
                              decoration: _inputDecoration(
                                hint:
                                "ex. https://example.com/your-long-url-here",
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Alias + Button
                            Text(
                              "Enter Custom Alias",
                              style: GoogleFonts.quicksand(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: const Color(0xFFFFF8E7),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: _aliasController,
                                    style: GoogleFonts.quicksand(
                                      color: const Color(0xFFFFF8E7),
                                    ),
                                    decoration: _inputDecoration(
                                      hint: "custom alias (optional)",
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                ElevatedButton(
                                  onPressed: _handleCreateLink,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor:
                                    const Color(0xFFFF1D4D).withOpacity(0.95),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                  ),
                                  child: Text(
                                    "Shorten",
                                    style: GoogleFonts.quicksand(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFFFFF8E7),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Search
                      TextField(
                        controller: _searchController,
                        onChanged: (_) => setState(() {}),
                        style: GoogleFonts.quicksand(
                          color: const Color(0xFFFFF8E7),
                        ),
                        decoration: _inputDecoration(
                          hint: "Search links...",
                        ),
                      ),

                      const SizedBox(height: 10),

                      // Sort chips (mimics table headers)
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _buildSortChip("Name", "name"),
                            _buildSortChip("Clicks", "clicks"),
                            _buildSortChip("Link", "shortUrl"),
                            _buildSortChip("Redirects To", "target"),
                            _buildSortChip("Date", "date"),
                          ],
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Links list
                      ListView.builder(
                        itemCount: _filteredAndSortedLinks.length,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemBuilder: (context, index) {
                          final item = _filteredAndSortedLinks[index];
                          return _buildLinkCard(item);
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration({required String hint}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.quicksand(
        color: const Color(0xFFFFF8E7).withOpacity(0.5),
        fontSize: 13,
      ),
      filled: true,
      fillColor: Colors.black.withOpacity(0.6),
      contentPadding:
      const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(
          color: const Color(0xFFFF1D4D).withOpacity(0.5),
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: Color(0xFFFF1D4D),
          width: 2,
        ),
      ),
    );
  }
}
