# ♻️ RecycleScan v3 — 5-Filter Motion Detection

## How It Works

A bottle inserted into the bin must pass ALL 5 filters to be counted:

```
Frame arrives
    │
    ▼
Filter 1 — Zone restriction       Only pixels inside your drawn box are checked
    │
    ▼
Filter 2 — Motion size            >12% of zone pixels must change (no shadows/flickers)
    │
    ▼
Filter 3 — Downward direction     Motion must travel top→bottom (bottles fall, hands wave sideways)
    │
    ▼
Filter 4 — Entry + Exit confirm   Object must ENTER the zone AND DISAPPEAR (went fully into bin)
    │
    ▼
Filter 5 — Cooldown (2.2s)        Locks after each count — no double counting
    │
    ▼
  +1 Bottle ✅
```

---

## Setup

### 1. Dependencies
```bash
flutter pub get
```

### 2. Android — `android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
```

In `android/app/build.gradle`:
```gradle
defaultConfig {
    minSdkVersion 21
}
```

### 3. iOS — `ios/Runner/Info.plist`
```xml
<key>NSCameraUsageDescription</key>
<string>Camera is used to detect bottles being recycled.</string>
```

### 4. Run
```bash
flutter run
```

---

## How to Use

1. Point phone camera at the **front/slot** of your bin
2. Tap **"Set zone"** → drag a box around the slot opening
3. Insert bottles — the app counts automatically!

### Filter Status Bar (bottom of camera)
5 dots show which filters are currently passing:
- `Zone` — always green (zone is set)
- `Size`  — green when enough pixels changed
- `Dir`   — green when motion is downward
- `Entry` — green when object is tracked inside zone
- `Ready` — green when not in cooldown

### Sensitivity Slider
- **Higher** → easier to trigger (good for low light)
- **Lower**  → stricter (good for busy backgrounds)

### Debug values
`Δ` = current motion size (% of zone changed)  
`↓` = downward direction score (higher = more downward)

---

## Tuning for Your Bin

| Problem | Fix |
|---------|-----|
| Bottles not detected | Raise sensitivity, make zone tighter around slot |
| False counts from hand | Lower sensitivity, check zone doesn't include area above slot |
| Double counting | Already handled by cooldown; if still happens raise cooldown in code |
| Misses fast insertions | Raise sensitivity — fast bottles may not trigger size filter |

To adjust cooldown duration, change this in `main.dart`:
```dart
final MotionEngine _engine = MotionEngine(
  cooldownMs: 2200,  // change this value (in milliseconds)
);
```

---

## Zone Color Guide

| Color | Meaning |
|-------|---------|
| Green | Idle — monitoring |
| Amber | Object entering zone |
| Orange | Object tracked inside |
| Red | Object exiting — about to count |
| Green + "Counted ✓" | Cooldown — just counted |
