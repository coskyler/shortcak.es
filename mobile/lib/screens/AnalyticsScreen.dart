import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;

/// TODO: set this to the same API base URL you use on the web (VITE_API_URL)
const String apiBaseUrl = 'https://YOUR_API_URL_HERE';

class AnalyticsScreen extends StatefulWidget {
  /// Slug of the link, e.g. "my-alias" (what your web app gets from /analytics/:slug)
  final String? slug;

  /// Optional: pass link name/target in when you navigate, to avoid refetching
  final String? initialName;
  final String? initialTarget;

  const AnalyticsScreen({
    super.key,
    this.slug,
    this.initialName,
    this.initialTarget,
  });

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  bool _loading = true;
  String? _error;

  // Metrics
  String _name = '';
  String _target = '';
  String _slug = '';
  int _totalClicks = 0;
  int _uniqueClicks = 0;

  // Timeseries: [{date, clicks}]
  List<Map<String, dynamic>> _timeseries = [];

  // Geographics: [{country, clicks}]
  List<Map<String, dynamic>> _geographics = [];

  // Devices: [{device, clicks}]
  List<Map<String, dynamic>> _devices = [];

  // Referrers: [{referrer, clicks}]
  List<Map<String, dynamic>> _referrers = [];

  // Click logs: [{ipAddress, userAgent, country, device, referrer, timeStamp}]
  List<Map<String, dynamic>> _clickLogs = [];

  @override
  void initState() {
    super.initState();
    // If no slug is provided, just show demo data so the UI works
    _slug = widget.slug ?? 'demo-slug';
    if (widget.initialName != null) _name = widget.initialName!;
    if (widget.initialTarget != null) _target = widget.initialTarget!;

    if (widget.slug == null) {
      _seedDemoData();
    } else {
      _fetchAnalytics();
    }
  }

  void _seedDemoData() {
    setState(() {
      _name = _name.isNotEmpty ? _name : 'repo';
      _target = _target.isNotEmpty ? _target : 'https://example.com/demo';
      _totalClicks = 1234;
      _uniqueClicks = 987;

      _timeseries = [
        {'date': '2024-11-01', 'clicks': 12},
        {'date': '2024-11-02', 'clicks': 25},
        {'date': '2024-11-03', 'clicks': 40},
        {'date': '2024-11-04', 'clicks': 28},
      ];

      _geographics = [
        {'country': 'United States', 'clicks': 800},
        {'country': 'Canada', 'clicks': 200},
        {'country': 'United Kingdom', 'clicks': 150},
      ];

      _devices = [
        {'device': 'Desktop', 'clicks': 600},
        {'device': 'Mobile', 'clicks': 500},
        {'device': 'Tablet', 'clicks': 134},
      ];

      _referrers = [
        {'referrer': 'Direct', 'clicks': 700},
        {'referrer': 'Google', 'clicks': 300},
        {'referrer': 'Twitter', 'clicks': 234},
      ];

      _clickLogs = [
        {
          'ipAddress': '192.168.0.1',
          'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
          'country': 'United States',
          'device': 'Desktop',
          'referrer': 'Direct',
          'timeStamp': DateTime.now().toIso8601String(),
        },
        {
          'ipAddress': '10.0.0.2',
          'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS)',
          'country': 'Canada',
          'device': 'Mobile',
          'referrer': 'Google',
          'timeStamp': DateTime.now()
              .subtract(const Duration(hours: 5))
              .toIso8601String(),
        },
      ];

      _loading = false;
      _error = null;
    });
  }

  Future<void> _fetchAnalytics() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final slug = _slug;

      // TODO: add Authorization header like the web (Firebase token)
      final headers = {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
      };

      final metricsRes = await http.get(
        Uri.parse('$apiBaseUrl/api/analytics/$slug/metrics'),
        headers: headers,
      );
      final timeseriesRes = await http.get(
        Uri.parse('$apiBaseUrl/api/analytics/$slug/clicksbyday'),
        headers: headers,
      );
      final geoRes = await http.get(
        Uri.parse('$apiBaseUrl/api/analytics/$slug/clicksbycountry'),
        headers: headers,
      );
      final devRes = await http.get(
        Uri.parse('$apiBaseUrl/api/analytics/$slug/clicksbydevice'),
        headers: headers,
      );
      final refRes = await http.get(
        Uri.parse('$apiBaseUrl/api/analytics/$slug/clicksbyreferrer'),
        headers: headers,
      );
      final logsRes = await http.get(
        Uri.parse('$apiBaseUrl/api/analytics/$slug/clicks'),
        headers: headers,
      );

      if (metricsRes.statusCode >= 400) {
        throw Exception('Failed to load metrics: ${metricsRes.body}');
      }

      final metricsJson = jsonDecode(metricsRes.body) as Map<String, dynamic>;
      final timeseriesJson =
          jsonDecode(timeseriesRes.body) as List<dynamic>? ?? [];
      final geoJson = jsonDecode(geoRes.body) as Map<String, dynamic>? ?? {};
      final devJson = jsonDecode(devRes.body) as Map<String, dynamic>? ?? {};
      final refJson = jsonDecode(refRes.body) as Map<String, dynamic>? ?? {};
      final logsJson = jsonDecode(logsRes.body) as List<dynamic>? ?? [];

      setState(() {
        _name = metricsJson['name'] ?? _name;
        _target = metricsJson['target'] ?? _target;
        _slug = metricsJson['slug'] ?? slug;
        _totalClicks = (metricsJson['totalClicks'] ?? 0) as int;
        _uniqueClicks = (metricsJson['uniqueClicks'] ?? 0) as int;

        _timeseries = timeseriesJson
            .map<Map<String, dynamic>>((e) => {
          'date': e['date'] ?? '',
          'clicks': (e['clicks'] ?? 0) as int,
        })
            .toList();

        _geographics = geoJson.entries
            .map<Map<String, dynamic>>(
              (e) => {'country': e.key, 'clicks': (e.value ?? 0) as int},
        )
            .toList();

        _devices = devJson.entries
            .map<Map<String, dynamic>>(
              (e) => {'device': e.key, 'clicks': (e.value ?? 0) as int},
        )
            .toList();

        _referrers = refJson.entries
            .map<Map<String, dynamic>>(
              (e) => {'referrer': e.key, 'clicks': (e.value ?? 0) as int},
        )
            .toList();

        _clickLogs = logsJson
            .map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e))
            .toList();

        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.month}/${dt.day}/${dt.year}';
    } catch (_) {
      return iso;
    }
  }

  String _formatDateTime(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.month}/${dt.day}/${dt.year} '
          '${dt.hour.toString().padLeft(2, '0')}:'
          '${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return iso;
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: Stack(
        children: [
          // Background gradient (same vibe as Login/Dashboard)
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

          // SVG decor on the right (same as Login)
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

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding:
                const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 700),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Text(
                        _name.isNotEmpty ? _name : 'Link Analytics',
                        style: GoogleFonts.quicksand(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFFFF8E7),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _target.isNotEmpty
                            ? 'redirects to: $_target'
                            : 'View detailed performance for this link.',
                        style: GoogleFonts.quicksand(
                          fontSize: 13,
                          fontWeight: FontWeight.w400,
                          color: const Color(0xFFFFF8E7).withOpacity(0.8),
                        ),
                      ),
                      const SizedBox(height: 2),
                      if (_slug.isNotEmpty)
                        Text(
                          'alias: /r/$_slug',
                          style: GoogleFonts.quicksand(
                            fontSize: 13,
                            fontWeight: FontWeight.w400,
                            color: const Color(0xFFFFF8E7).withOpacity(0.8),
                          ),
                        ),

                      const SizedBox(height: 20),

                      if (_loading)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(24.0),
                            child: CircularProgressIndicator(),
                          ),
                        )
                      else if (_error != null)
                        Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Text(
                            'Error loading analytics:\n$_error',
                            style: GoogleFonts.quicksand(
                              color: Colors.redAccent,
                            ),
                          ),
                        )
                      else ...[
                          // Row: Total / Unique clicks
                          Row(
                            children: [
                              Expanded(
                                child: _statCard(
                                  title: 'Total Clicks',
                                  value: _totalClicks.toString(),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _statCard(
                                  title: 'Unique Clicks',
                                  value: _uniqueClicks.toString(),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 16),

                          // Row: Top countries / devices / referrers
                          _tripletRow(),

                          const SizedBox(height: 16),

                          // Clicks over time (simplified, list-style)
                          _timeseriesCard(),

                          const SizedBox(height: 16),

                          // Click log table
                          _logsTable(),
                        ],
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

  Widget _statCard({required String title, required String value}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.6),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFFF1D4D).withOpacity(0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.quicksand(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: const Color(0xFFFFF8E7),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: GoogleFonts.quicksand(
              fontSize: 30,
              fontWeight: FontWeight.w700,
              color: const Color(0xFFFFF8E7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tripletRow() {
    return Column(
      children: [
        // On mobile, easier to stack instead of 3-column grid
        _listCard(
          title: 'Top Countries',
          items: _geographics,
          labelKey: 'country',
        ),
        const SizedBox(height: 10),
        _listCard(
          title: 'Top Devices',
          items: _devices,
          labelKey: 'device',
        ),
        const SizedBox(height: 10),
        _listCard(
          title: 'Top Referrers',
          items: _referrers,
          labelKey: 'referrer',
        ),
      ],
    );
  }

  Widget _listCard({
    required String title,
    required List<Map<String, dynamic>> items,
    required String labelKey,
  }) {
    return Container(
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
          Text(
            title,
            style: GoogleFonts.quicksand(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: const Color(0xFFFFF8E7),
            ),
          ),
          const SizedBox(height: 8),
          if (items.isEmpty)
            Text(
              'No data available',
              style: GoogleFonts.quicksand(
                fontSize: 12,
                color: const Color(0xFFFFF8E7).withOpacity(0.6),
              ),
            )
          else
            Column(
              children: items.take(5).map((row) {
                final label = row[labelKey]?.toString() ?? '';
                final clicks = row['clicks']?.toString() ?? '0';
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          label,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.quicksand(
                            fontSize: 12,
                            color: const Color(0xFFFFF8E7),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '$clicks clicks',
                        style: GoogleFonts.quicksand(
                          fontSize: 12,
                          color: const Color(0xFFFF7B9C),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _timeseriesCard() {
    return Container(
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
          Text(
            'Clicks Over Time',
            style: GoogleFonts.quicksand(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: const Color(0xFFFFF8E7),
            ),
          ),
          const SizedBox(height: 8),
          if (_timeseries.isEmpty)
            Text(
              'No data available',
              style: GoogleFonts.quicksand(
                fontSize: 12,
                color: const Color(0xFFFFF8E7).withOpacity(0.6),
              ),
            )
          else
            Column(
              children: _timeseries.map((p) {
                final date = p['date']?.toString() ?? '';
                final clicks = p['clicks']?.toString() ?? '0';
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatDate(date),
                        style: GoogleFonts.quicksand(
                          fontSize: 12,
                          color: const Color(0xFFFFF8E7),
                        ),
                      ),
                      Text(
                        '$clicks clicks',
                        style: GoogleFonts.quicksand(
                          fontSize: 12,
                          color: const Color(0xFFFF7B9C),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _logsTable() {
    return Container(
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
          Text(
            'Recent Clicks',
            style: GoogleFonts.quicksand(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: const Color(0xFFFFF8E7),
            ),
          ),
          const SizedBox(height: 8),
          if (_clickLogs.isEmpty)
            Text(
              'No click logs available',
              style: GoogleFonts.quicksand(
                fontSize: 12,
                color: const Color(0xFFFFF8E7).withOpacity(0.6),
              ),
            )
          else
            Column(
              children: _clickLogs.take(20).map((log) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _logRow('IP', log['ipAddress'] ?? ''),
                      _logRow('Country', log['country'] ?? ''),
                      _logRow('Device', log['device'] ?? ''),
                      _logRow('Referrer', log['referrer'] ?? ''),
                      _logRow('User Agent',
                          (log['userAgent'] ?? '').toString(), small: true),
                      _logRow('Time',
                          _formatDateTime(log['timeStamp'] ?? ''), small: true),
                      const Divider(
                        color: Colors.white24,
                        height: 16,
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _logRow(String label, String value, {bool small = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$label: ',
          style: GoogleFonts.quicksand(
            fontSize: small ? 11 : 12,
            fontWeight: FontWeight.w600,
            color: const Color(0xFFFFF8E7).withOpacity(0.8),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: GoogleFonts.quicksand(
              fontSize: small ? 11 : 12,
              color: const Color(0xFFFFF8E7),
            ),
          ),
        ),
      ],
    );
  }
}
