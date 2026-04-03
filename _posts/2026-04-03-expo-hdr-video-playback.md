---
layout: post
title: "Gray veil during iOS HDR video playback"
subtitle: "Why HDR video playback affects other parts of the application and how to fix it with expo-video"
date: 2026-04-03
permalink: "/blog/expo-hdr-video-playback/"
thumbnail: "/assets/img/blog/thumbnails/expo-hdr-video-playback.png"
hidden: false
---

While working on the video editor for [Kudoro](https://kudoro.cc), I noticed a grey veil appearing on all elements on top of the video as soon as it started playing.
This happened only with certain videos e.g. from Oakley Meta glasses.
After the video pauses for a while, it would turn back to normal but during playback the entire UI on top of the video would be affected.

This was unacceptable for my application, which in its essence is displaying overlay elements on top of the video
and is supposed to be an accurate representation of the finished composition.

One extra gotcha is that **this does not show up in screenshots or screen recordings**, which had me questioning my sanity for a while,
until I stumbled on [`expo-av` issue #16924](https://github.com/expo/expo/issues/16924).

I encountered the issue with both [`react-native-video`](https://docs.thewidlarzgroup.com/react-native-video/)
and [`expo-video`](https://docs.expo.dev/versions/latest/sdk/video/).
In this post I summarize what causes the grey veil, why it is hard to capture, and how I force SDR playback in `expo-video` for Kudoro.

![Side-by-side: HDR playback (left) and SDR playback (right) in the live preview](/assets/img/blog/expo-hdr-video-playback/comparison.png){:class="blog-post-img-large"}

**Versions used while debugging:**

- iPhone 16e iOS: **26.2** (physical device)
- expo: **54.0.33**
- expo-video: **3.0.16**

### The problem

When iOS plays HDR video with `AVPlayer`/`AVPlayerViewController`,
the system may switch the video layer into **EDR (extended dynamic range)**.

This means the video can render much brighter whites than SDR UI, while anything on top of the video,
like the Kudoro overlay elements (which are rendered on a transparent [`react-native-skia`](https://shopify.github.io/react-native-skia/) canvas), stays SDR.
This results in the overlays looking **dim/grey** relative to the video.

### Why it can’t be captured in screenshots

iOS screenshots aren’t a faithful capture of what EDR looks like on the physical display.
They seem to capture an SDR / tone-mapped output, so the dimming/veil disappears, even though it’s obvious in person.

### Forcing SDR dynamic range for the player

Apple exposes a knob for this on `AVPlayerViewController`:

- `preferredDisplayDynamicRange`
- `AVDisplayDynamicRange.standard` restricts playback to SDR (tone-maps HDR down)

At the time of writing, neither `expo-video` nor `react-native-video` expose this option in their video player components.
So for the time being I had **Opus 4.6** write me a script that applies this patch to **`node_modules/expo-video/ios/VideoView.swift`**.

Patching **`node_modules/expo-video`** on disk is inherently fragile.
A future `expo-video` release can rename or refactor `VideoView.swift`, so if the anchor string no longer matches,
the patch or config plugin has to be updated before prebuild will apply it again.

```diff
 // node_modules/expo-video/ios/VideoView.swift (excerpt)
 public final class VideoView: ExpoView, AVPlayerViewControllerDelegate {
   lazy var playerViewController = OrientationAVPlayerViewController(delegate: self)

   weak var player: VideoPlayer? {
     didSet {
       playerViewController.player = player?.ref
+      if #available(iOS 26.0, *) {
+        playerViewController.preferredDisplayDynamicRange = .standard
+      }
     }
   }
   // ...
 }
```

The important part is that this runs after the player is wired to `playerViewController`, not earlier.
Setting `preferredDisplayDynamicRange` in `init` did not work reliably for me because the player was still `nil`.

To consistently apply the patch, add the plugin below, register it in `app.json`, and rebuild the application:

```js
// plugins/with-expo-video-sdr.js
const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const SDR_PATCH = `
      if #available(iOS 26.0, *) {
        playerViewController.preferredDisplayDynamicRange = .standard
      }`;

module.exports = function withExpoVideoSdr(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const videoViewPath = path.join(
        cfg.modRequest.projectRoot,
        "node_modules",
        "expo-video",
        "ios",
        "VideoView.swift"
      );

      if (!fs.existsSync(videoViewPath)) {
        console.warn("[with-expo-video-sdr] VideoView.swift not found, skipping patch");
        return cfg;
      }

      let contents = fs.readFileSync(videoViewPath, "utf-8");

      // Idempotency: don't double patch
      if (contents.includes("preferredDisplayDynamicRange")) {
        return cfg;
      }

      // Patch right after the player is attached (timing matters)
      const anchor = "playerViewController.player = player?.ref";
      if (!contents.includes(anchor)) {
        console.warn("[with-expo-video-sdr] Could not find injection anchor in VideoView.swift");
        return cfg;
      }

      contents = contents.replace(anchor, `${anchor}\n${SDR_PATCH}`);
      fs.writeFileSync(videoViewPath, contents, "utf-8");

      return cfg;
    },
  ]);
};
```

```json
// app.json
{
  "expo": {
    "plugins": [
+      "./plugins/with-expo-video-sdr",
      "expo-video"
    ]
  }
}
```

```bash
npx expo prebuild --platform ios --clean
npx expo run:ios --device
```
