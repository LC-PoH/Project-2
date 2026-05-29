import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  runApp(const HostelFlutterApp());
}

class HostelFlutterApp extends StatelessWidget {
  const HostelFlutterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AVM Hostel',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4338CA)),
        scaffoldBackgroundColor: const Color(0xFFF1F5FF),
      ),
      home: const HostelWebViewScreen(),
    );
  }
}

class HostelWebViewScreen extends StatefulWidget {
  const HostelWebViewScreen({super.key});

  @override
  State<HostelWebViewScreen> createState() => _HostelWebViewScreenState();
}

class _HostelWebViewScreenState extends State<HostelWebViewScreen> {
  static const String _hostelUrl =
      'http://192.168.0.8/Hostel-Management-System/login.html?app=mobile';

  late final WebViewController _controller;
  double _progress = 0;
  String? _errorText;

  @override
  void initState() {
    super.initState();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() {
              _progress = progress / 100;
            });
          },
          onPageStarted: (_) {
            setState(() {
              _errorText = null;
            });
          },
          onWebResourceError: (WebResourceError error) {
            setState(() {
              _errorText =
                  'Unable to load app. Check Wi-Fi, XAMPP Apache, and server URL.';
            });
          },
        ),
      )
      ..loadRequest(Uri.parse(_hostelUrl));
  }

  Future<void> _reload() async {
    setState(() {
      _errorText = null;
    });
    await _controller.loadRequest(Uri.parse(_hostelUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: const Text('AVM Hostel'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _reload,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_progress < 1)
            LinearProgressIndicator(
              value: _progress <= 0 ? null : _progress,
              minHeight: 2,
            ),
          Expanded(
            child: Stack(
              children: [
                WebViewWidget(controller: _controller),
                if (_errorText != null)
                  Positioned.fill(
                    child: Container(
                      color: Colors.white,
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.wifi_off_rounded,
                            size: 56,
                            color: Color(0xFF64748B),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _errorText!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 15,
                              color: Color(0xFF334155),
                              height: 1.45,
                            ),
                          ),
                          const SizedBox(height: 18),
                          FilledButton.icon(
                            onPressed: _reload,
                            icon: const Icon(Icons.refresh_rounded),
                            label: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
