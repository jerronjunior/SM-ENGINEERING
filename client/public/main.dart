import 'dart:async';
import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

late List<CameraDescription> _cameras;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  _cameras = await availableCameras();
  runApp(const BottleRecycleApp());
}

// ══════════════════════════════════════════════
// App Root
// ══════════════════════════════════════════════
class BottleRecycleApp extends StatelessWidget {
  const BottleRecycleApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RecycleScan',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF080F08),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00E676),
          surface: Color(0xFF0D1A0D),
        ),
      ),
      home: const DetectorScreen(),
    );
  }
}

// ══════════════════════════════════════════════
// Motion Detection Engine — 5 Filters
// ══════════════════════════════════════════════

/// Tracks the state of an object passing through the detection zone.
enum _PassState {
  idle,       // nothing happening
  entering,   // motion detected in upper zone
  inside,     // object fully inside zone
  exiting,    // motion in lower zone — about to count
}

class MotionEngine {
  // ── Config (all tunable) ─────────────────────
  /// Filter 1: Detection zone as fraction of frame (left, top, right, bottom)
  Rect detectionZone;

  /// Filter 2: Min % of zone pixels that must change (0.0–1.0)
  final double minChangeFraction;

  /// Filter 3: Min downward velocity score required (0.0–1.0)
  final double minDownwardScore;

  /// Filter 5: Cooldown in ms after each successful count
  final int cooldownMs;

  MotionEngine({
    this.detectionZone = const Rect.fromLTRB(0.20, 0.15, 0.80, 0.85),
    this.minChangeFraction = 0.12,
    this.minDownwardScore = 0.45,
    this.cooldownMs = 2200,
  });

  // ── Internal state ───────────────────────────
  Uint8List? _prevY;          // previous frame Y-plane in zone
  _PassState _state = _PassState.idle;
  DateTime? _lastCount;

  // Tracking: row-by-row motion density for direction check
  final List<double> _rowHistory = List.filled(20, 0.0);

  // Exposed for UI
  double changedFraction = 0.0;
  double downwardScore = 0.0;
  _PassState get passState => _state;
  bool get inCooldown {
    if (_lastCount == null) return false;
    return DateTime.now().difference(_lastCount!).inMilliseconds < cooldownMs;
  }

  // ── Main process method ──────────────────────
  /// Returns true when a bottle is confirmed to have passed through.
  bool processFrame(CameraImage image) {
    // ── Extract zone pixels (Y-plane only = luminance) ──
    final zoneY = _extractZone(image);
    if (zoneY == null) return false;

    final prev = _prevY;
    _prevY = zoneY;

    if (prev == null || prev.length != zoneY.length) return false;

    // ── Filter 5: Cooldown check ─────────────────
    if (inCooldown) return false;

    // ── Compute pixel difference map ─────────────
    final int zoneW = _zonePixelW(image);
    final int zoneH = _zonePixelH(image);
    if (zoneW <= 0 || zoneH <= 0) return false;

    // Row-divided motion: split zone into 20 horizontal bands
    const int bands = 20;
    final List<double> bandMotion = List.filled(bands, 0.0);
    int totalChanged = 0;
    const int diffThreshold = 28; // per-pixel difference to count as changed

    for (int i = 0; i < zoneY.length; i++) {
      final int diff = (zoneY[i] - prev[i]).abs();
      if (diff > diffThreshold) {
        totalChanged++;
        final int band = ((i / zoneW) / zoneH * bands).clamp(0, bands - 1).toInt();
        bandMotion[band] += 1.0;
      }
    }

    // ── Filter 2: Motion size ────────────────────
    changedFraction = totalChanged / zoneY.length;
    if (changedFraction < minChangeFraction) {
      // Very little motion — object gone or nothing there
      if (_state == _PassState.inside || _state == _PassState.exiting) {
        // Filter 4: Exit confirmed — object entered AND exited
        _state = _PassState.idle;
        _lastCount = DateTime.now();
        _resetRows();
        return true; // ✅ COUNT!
      }
      _state = _PassState.idle;
      _resetRows();
      return false;
    }

    // ── Smooth band motion into history ──────────
    final double bandMax = bandMotion.reduce((a, b) => a > b ? a : b);
    if (bandMax > 0) {
      for (int b = 0; b < bands; b++) {
        _rowHistory[b] = _rowHistory[b] * 0.6 + (bandMotion[b] / bandMax) * 0.4;
      }
    }

    // ── Filter 3: Downward direction ─────────────
    // Score = how much more motion is in lower half vs upper half
    double upperSum = 0, lowerSum = 0;
    for (int b = 0; b < bands ~/ 2; b++) upperSum += _rowHistory[b];
    for (int b = bands ~/ 2; b < bands; b++) lowerSum += _rowHistory[b];
    final double total = upperSum + lowerSum;
    downwardScore = total > 0 ? lowerSum / total : 0;

    if (downwardScore < minDownwardScore) {
      // Motion is mostly upward/sideways — ignore
      return false;
    }

    // ── Filter 4: Entry → Inside → Exit state machine ──
    // Find the centroid band of current motion
    double weightedBand = 0, weightSum = 0;
    for (int b = 0; b < bands; b++) {
      weightedBand += b * bandMotion[b];
      weightSum += bandMotion[b];
    }
    final double centroid = weightSum > 0 ? weightedBand / weightSum : 0;
    final double relPos = centroid / bands; // 0=top, 1=bottom of zone

    switch (_state) {
      case _PassState.idle:
        if (relPos < 0.45 && changedFraction > minChangeFraction) {
          // Object appeared in upper part of zone
          _state = _PassState.entering;
        }
        break;
      case _PassState.entering:
        if (relPos >= 0.3) {
          _state = _PassState.inside;
        }
        break;
      case _PassState.inside:
        if (relPos > 0.6) {
          _state = _PassState.exiting;
        }
        break;
      case _PassState.exiting:
        // Will be counted on next low-motion frame (above)
        break;
    }

    return false;
  }

  // ── Helpers ──────────────────────────────────
  int _zonePixelW(CameraImage img) =>
      ((detectionZone.right - detectionZone.left) * img.width).toInt();
  int _zonePixelH(CameraImage img) =>
      ((detectionZone.bottom - detectionZone.top) * img.height).toInt();

  Uint8List? _extractZone(CameraImage img) {
    final int fw = img.width, fh = img.height;
    final Uint8List yPlane = img.planes[0].bytes;

    final int x0 = (detectionZone.left * fw).toInt().clamp(0, fw - 1);
    final int y0 = (detectionZone.top * fh).toInt().clamp(0, fh - 1);
    final int x1 = (detectionZone.right * fw).toInt().clamp(0, fw - 1);
    final int y1 = (detectionZone.bottom * fh).toInt().clamp(0, fh - 1);

    final int zw = x1 - x0;
    final int zh = y1 - y0;
    if (zw <= 0 || zh <= 0) return null;

    // Sample every 2nd pixel for performance
    const int step = 2;
    final List<int> out = [];
    for (int py = y0; py < y1; py += step) {
      for (int px = x0; px < x1; px += step) {
        final int idx = py * fw + px;
        if (idx < yPlane.length) out.add(yPlane[idx]);
      }
    }
    return Uint8List.fromList(out);
  }

  void _resetRows() {
    for (int i = 0; i < _rowHistory.length; i++) {
      _rowHistory[i] = 0.0;
    }
  }

  void reset() {
    _prevY = null;
    _state = _PassState.idle;
    _resetRows();
  }
}

// ══════════════════════════════════════════════
// Main Screen
// ══════════════════════════════════════════════
class DetectorScreen extends StatefulWidget {
  const DetectorScreen({super.key});
  @override
  State<DetectorScreen> createState() => _DetectorScreenState();
}

class _DetectorScreenState extends State<DetectorScreen>
    with WidgetsBindingObserver, TickerProviderStateMixin {
  // ── Camera ──────────────────────────────────
  CameraController? _cam;
  bool _cameraReady = false;

  // ── Engine ───────────────────────────────────
  final MotionEngine _engine = MotionEngine();
  bool _processingFrame = false;
  int _frameSkip = 0;

  // ── Zone drawing ────────────────────────────
  bool _drawingZone = false;
  Offset? _dragStart;

  // ── Counts ───────────────────────────────────
  int _total = 0;
  int _session = 0;

  // ── Animations ───────────────────────────────
  late AnimationController _pulseCtrl;
  late AnimationController _countCtrl;
  bool _showCountAnim = false;

  // ── UI State ─────────────────────────────────
  double _sensitivity = 60; // 10–90 → mapped to thresholds

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _pulseCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 800))
      ..repeat(reverse: true);
    _countCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 900));
    _loadTotal();
    _initCamera();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _pulseCtrl.dispose();
    _countCtrl.dispose();
    _cam?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.inactive) _cam?.dispose();
    if (state == AppLifecycleState.resumed) _initCamera();
  }

  // ── Sensitivity → engine thresholds ──────────
  void _applySensitivity(double v) {
    setState(() => _sensitivity = v);
    // Higher sensitivity = lower thresholds = easier to trigger
    _engine
      ..minChangeFraction = (0.18 - (v / 90) * 0.12).clamp(0.04, 0.18)
      ..minDownwardScore = (0.60 - (v / 90) * 0.25).clamp(0.25, 0.60);
  }

  // ── Camera ───────────────────────────────────
  Future<void> _initCamera() async {
    if (_cameras.isEmpty) return;
    _cam = CameraController(
      _cameras.first,
      ResolutionPreset.medium,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.yuv420,
    );
    try {
      await _cam!.initialize();
      if (!mounted) return;
      setState(() => _cameraReady = true);
      _cam!.startImageStream(_onFrame);
    } catch (e) {
      _showSnack('Camera error: $e');
    }
  }

  void _onFrame(CameraImage image) {
    _frameSkip++;
    if (_frameSkip % 2 != 0) return; // process every 2nd frame
    if (_processingFrame) return;
    _processingFrame = true;

    final bool counted = _engine.processFrame(image);

    if (mounted) {
      setState(() {}); // refresh UI indicators
      if (counted) _onBottleCounted();
    }

    _processingFrame = false;
  }

  void _onBottleCounted() {
    setState(() {
      _total++;
      _session++;
      _showCountAnim = true;
    });
    _saveTotal();
    _countCtrl.forward(from: 0).then((_) {
      if (mounted) setState(() => _showCountAnim = false);
    });
  }

  // ── Zone Drawing ─────────────────────────────
  void _onDragStart(DragStartDetails d, Size sz) {
    if (!_drawingZone) return;
    _dragStart = Offset(d.localPosition.dx / sz.width,
        d.localPosition.dy / sz.height);
  }

  void _onDragUpdate(DragUpdateDetails d, Size sz) {
    if (!_drawingZone || _dragStart == null) return;
    final Offset cur = Offset(d.localPosition.dx / sz.width,
        d.localPosition.dy / sz.height);
    setState(() {
      _engine.detectionZone = Rect.fromPoints(_dragStart!, cur);
      _engine.reset();
    });
  }

  void _onDragEnd(DragEndDetails _) {
    if (!_drawingZone) return;
    setState(() => _drawingZone = false);
    _dragStart = null;
    _showSnack('Zone set! Point camera at the bin slot.');
  }

  // ── Persistence ──────────────────────────────
  Future<void> _loadTotal() async {
    final p = await SharedPreferences.getInstance();
    setState(() => _total = p.getInt('total') ?? 0);
  }

  Future<void> _saveTotal() async {
    final p = await SharedPreferences.getInstance();
    await p.setInt('total', _total);
  }

  void _showSnack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), duration: const Duration(seconds: 2)));
  }

  // ══════════════════════════════════════════════
  // Build
  // ══════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080F08),
      body: SafeArea(
        child: Column(children: [
          _buildHeader(),
          Expanded(child: _buildCamera()),
          _buildFilterStatus(),
          _buildControls(),
        ]),
      ),
    );
  }

  // ── Header ───────────────────────────────────
  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 14, 18, 14),
      color: const Color(0xFF0D1A0D),
      child: Row(children: [
        const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('♻  RecycleScan',
              style: TextStyle(
                  color: Color(0xFF00E676),
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5)),
          Text('5-Filter Motion Detection',
              style: TextStyle(color: Colors.white38, fontSize: 10)),
        ]),
        const Spacer(),
        _counterCard('Session', _session, const Color(0xFF00E676)),
        const SizedBox(width: 10),
        _counterCard('Total', _total, const Color(0xFFFFD600)),
      ]),
    );
  }

  Widget _counterCard(String label, int val, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.3), width: 1.5),
      ),
      child: Column(children: [
        Text(label.toUpperCase(),
            style: TextStyle(
                color: color.withOpacity(0.6),
                fontSize: 8,
                letterSpacing: 1.5,
                fontWeight: FontWeight.w700)),
        const SizedBox(height: 2),
        Text('$val',
            style: TextStyle(
                color: color, fontSize: 24, fontWeight: FontWeight.w900)),
      ]),
    );
  }

  // ── Camera View ──────────────────────────────
  Widget _buildCamera() {
    if (!_cameraReady) {
      return const Center(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        CircularProgressIndicator(color: Color(0xFF00E676)),
        SizedBox(height: 12),
        Text('Starting camera…', style: TextStyle(color: Colors.white38)),
      ]));
    }

    return LayoutBuilder(builder: (ctx, box) {
      final size = Size(box.maxWidth, box.maxHeight);
      return GestureDetector(
        onPanStart: (d) => _onDragStart(d, size),
        onPanUpdate: (d) => _onDragUpdate(d, size),
        onPanEnd: _onDragEnd,
        child: Stack(fit: StackFit.expand, children: [
          // Camera preview
          ClipRect(
            child: OverflowBox(
              alignment: Alignment.center,
              child: FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(
                  width: size.width,
                  height: size.width / _cam!.value.aspectRatio,
                  child: CameraPreview(_cam!),
                ),
              ),
            ),
          ),

          // Detection zone overlay
          IgnorePointer(
            child: AnimatedBuilder(
              animation: _pulseCtrl,
              builder: (_, __) => CustomPaint(
                size: size,
                painter: _ZonePainter(
                  zone: _engine.detectionZone,
                  passState: _engine.passState,
                  inCooldown: _engine.inCooldown,
                  pulse: _pulseCtrl.value,
                ),
              ),
            ),
          ),

          // Direction arrow overlay (visual guide)
          IgnorePointer(
            child: Positioned(
              left: _engine.detectionZone.left * size.width + 8,
              top: _engine.detectionZone.top * size.height + 8,
              child: AnimatedOpacity(
                opacity: _engine.passState == _PassState.idle ? 0.5 : 0.0,
                duration: const Duration(milliseconds: 300),
                child: const Column(children: [
                  Icon(Icons.arrow_downward,
                      color: Color(0xFF00E676), size: 18),
                  Icon(Icons.arrow_downward,
                      color: Color(0xFF00E676), size: 18),
                ]),
              ),
            ),
          ),

          // Zone draw hint
          if (_drawingZone)
            Positioned(
              top: 14, left: 16, right: 16,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.black87,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white24),
                ),
                child: const Row(children: [
                  Icon(Icons.gesture, color: Colors.white70, size: 16),
                  SizedBox(width: 8),
                  Text('Drag a box around the bin opening slot',
                      style: TextStyle(color: Colors.white70, fontSize: 13)),
                ]),
              ),
            ),

          // Bottle counted animation
          if (_showCountAnim)
            AnimatedBuilder(
              animation: _countCtrl,
              builder: (_, __) {
                final t = _countCtrl.value;
                final opacity = t < 0.5 ? t * 2 : (1 - t) * 2;
                return Opacity(
                  opacity: opacity.clamp(0.0, 1.0),
                  child: Container(
                    color: const Color(0xFF00E676).withOpacity(0.08),
                    child: Center(
                      child: Transform.scale(
                        scale: (0.6 + t * 0.7).clamp(0.0, 2.0),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 30, vertical: 20),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0D250D).withOpacity(0.94),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                                color: const Color(0xFF00E676), width: 2),
                          ),
                          child: const Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text('🍾',
                                    style: TextStyle(fontSize: 48)),
                                SizedBox(height: 6),
                                Text('+1 Bottle!',
                                    style: TextStyle(
                                        color: Color(0xFF00E676),
                                        fontSize: 24,
                                        fontWeight: FontWeight.w900)),
                                Text('Nice recycling!',
                                    style: TextStyle(
                                        color: Colors.white54,
                                        fontSize: 12)),
                              ]),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
        ]),
      );
    });
  }

  // ── Filter Status Bar ────────────────────────
  Widget _buildFilterStatus() {
    final state = _engine.passState;
    final changed = _engine.changedFraction;
    final down = _engine.downwardScore;
    final cooldown = _engine.inCooldown;

    bool f1 = true; // zone is always active
    bool f2 = changed >= _engine.minChangeFraction;
    bool f3 = down >= _engine.minDownwardScore;
    bool f4 = state == _PassState.inside || state == _PassState.exiting;
    bool f5 = !cooldown;

    return Container(
      color: const Color(0xFF0D1A0D),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _filterDot('Zone', f1),
          _divider(),
          _filterDot('Size', f2),
          _divider(),
          _filterDot('Dir', f3),
          _divider(),
          _filterDot('Entry', f4),
          _divider(),
          _filterDot('Ready', f5),
          const SizedBox(width: 12),
          // Live values
          Text(
            'Δ${(changed * 100).toStringAsFixed(0)}%  ↓${(down * 100).toStringAsFixed(0)}%',
            style: const TextStyle(color: Colors.white24, fontSize: 10),
          ),
        ],
      ),
    );
  }

  Widget _filterDot(String label, bool active) {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 10,
        height: 10,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: active ? const Color(0xFF00E676) : Colors.white12,
        ),
      ),
      const SizedBox(height: 3),
      Text(label,
          style: TextStyle(
              color: active
                  ? const Color(0xFF00E676).withOpacity(0.8)
                  : Colors.white24,
              fontSize: 9)),
    ]);
  }

  Widget _divider() => Container(
      width: 1, height: 20, color: Colors.white10, margin: const EdgeInsets.symmetric(horizontal: 4));

  // ── Controls ─────────────────────────────────
  Widget _buildControls() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
      color: const Color(0xFF080F08),
      child: Column(children: [
        // Sensitivity slider
        Row(children: [
          const Text('Sensitivity',
              style: TextStyle(color: Colors.white38, fontSize: 12)),
          Expanded(
            child: Slider(
              value: _sensitivity,
              min: 10,
              max: 90,
              divisions: 16,
              activeColor: const Color(0xFF00E676),
              inactiveColor: Colors.white12,
              onChanged: _applySensitivity,
            ),
          ),
          Text('${_sensitivity.toInt()}%',
              style: const TextStyle(color: Colors.white38, fontSize: 11)),
        ]),
        const SizedBox(height: 8),

        // Buttons
        Row(children: [
          Expanded(
            child: _btn(
              icon: Icons.crop_free,
              label: _drawingZone ? 'Drawing…' : 'Set zone',
              color: const Color(0xFF29B6F6),
              onTap: () => setState(() {
                _drawingZone = !_drawingZone;
                _engine.reset();
              }),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _btn(
              icon: Icons.refresh,
              label: 'Reset session',
              color: Colors.redAccent,
              onTap: () => setState(() => _session = 0),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _btn(
              icon: Icons.delete_forever,
              label: 'Reset all',
              color: Colors.white30,
              onTap: () async {
                setState(() {
                  _session = 0;
                  _total = 0;
                });
                final p = await SharedPreferences.getInstance();
                await p.remove('total');
              },
            ),
          ),
        ]),
      ]),
    );
  }

  Widget _btn({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(height: 3),
          Text(label,
              style: TextStyle(
                  color: color, fontSize: 10, fontWeight: FontWeight.w600)),
        ]),
      ),
    );
  }
}

// ══════════════════════════════════════════════
// Zone Painter
// ══════════════════════════════════════════════
class _ZonePainter extends CustomPainter {
  final Rect zone;
  final _PassState passState;
  final bool inCooldown;
  final double pulse;

  const _ZonePainter({
    required this.zone,
    required this.passState,
    required this.inCooldown,
    required this.pulse,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromLTRB(
      zone.left * size.width,
      zone.top * size.height,
      zone.right * size.width,
      zone.bottom * size.height,
    );
    final rr = RRect.fromRectAndRadius(rect, const Radius.circular(10));

    // State → color
    Color color;
    if (inCooldown) {
      color = const Color(0xFF00E676);
    } else {
      color = switch (passState) {
        _PassState.idle => const Color(0xFF00E676),
        _PassState.entering => Colors.amber,
        _PassState.inside => Colors.orangeAccent,
        _PassState.exiting => Colors.redAccent,
      };
    }

    // Dim area outside zone
    final dimPaint = Paint()..color = Colors.black.withOpacity(0.4);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, rect.top), dimPaint);
    canvas.drawRect(Rect.fromLTWH(0, rect.bottom, size.width, size.height - rect.bottom), dimPaint);
    canvas.drawRect(Rect.fromLTWH(0, rect.top, rect.left, rect.height), dimPaint);
    canvas.drawRect(Rect.fromLTWH(rect.right, rect.top, size.width - rect.right, rect.height), dimPaint);

    // Zone border
    final borderPaint = Paint()
      ..color = color.withOpacity(
          passState != _PassState.idle ? 0.6 + pulse * 0.4 : 0.7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawRRect(rr, borderPaint);

    // Corner brackets
    final cp = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;
    const double c = 18;
    // TL
    canvas.drawLine(rect.topLeft, rect.topLeft.translate(c, 0), cp);
    canvas.drawLine(rect.topLeft, rect.topLeft.translate(0, c), cp);
    // TR
    canvas.drawLine(rect.topRight, rect.topRight.translate(-c, 0), cp);
    canvas.drawLine(rect.topRight, rect.topRight.translate(0, c), cp);
    // BL
    canvas.drawLine(rect.bottomLeft, rect.bottomLeft.translate(c, 0), cp);
    canvas.drawLine(rect.bottomLeft, rect.bottomLeft.translate(0, -c), cp);
    // BR
    canvas.drawLine(rect.bottomRight, rect.bottomRight.translate(-c, 0), cp);
    canvas.drawLine(rect.bottomRight, rect.bottomRight.translate(0, -c), cp);

    // State label inside top of zone
    if (passState != _PassState.idle) {
      final label = switch (passState) {
        _PassState.entering => 'Entering…',
        _PassState.inside   => 'Bottle inside',
        _PassState.exiting  => 'Counting…',
        _PassState.idle     => '',
      };
      final tp = TextPainter(
        text: TextSpan(
          text: label,
          style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              shadows: const [Shadow(color: Colors.black87, blurRadius: 4)]),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas,
          Offset(rect.left + 8, rect.top + 8));
    }

    // Cooldown label
    if (inCooldown) {
      final tp = TextPainter(
        text: const TextSpan(
          text: 'Counted ✓  Ready soon…',
          style: TextStyle(
              color: Color(0xFF00E676),
              fontSize: 11,
              fontWeight: FontWeight.w600,
              shadows: [Shadow(color: Colors.black87, blurRadius: 4)]),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas,
          Offset(rect.left + 8, rect.top + 8));
    }
  }

  @override
  bool shouldRepaint(_ZonePainter old) =>
      old.passState != passState ||
      old.inCooldown != inCooldown ||
      old.pulse != pulse ||
      old.zone != zone;
}
