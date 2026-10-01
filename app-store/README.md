# FOH Toolkit — App Store release checklist

Version target: **3.1.0**

## Code-side readiness now in the repository

- Capacitor iOS wrapper configuration (`com.w14orn.fohtoolkit`).
- Guest mode for core Presets, Shows, RTA and Ring Out features.
- Optional account for cloud sync and Community features.
- In-app permanent account deletion.
- Public Privacy Policy, Terms, Community Guidelines and Support pages.
- Community report tools, user blocking and moderated member comments.
- Existing offline support and cloud sync preserved.
- Existing microphone analysis remains local; FOH Toolkit does not upload RTA/Ring Out audio.

## One-time Mac / Xcode setup

1. Install current Node.js and Xcode.
2. In this repository run `npm install`.
3. Run `npm run ios:add` once. This generates the `ios/` Xcode project.
4. In Xcode select the FOH Toolkit target and set the Apple Developer Team.
5. Keep bundle identifier `com.w14orn.fohtoolkit`, or change it in both Xcode and `capacitor.config.ts` before the first App Store Connect record is created.
6. Add the microphone usage description to `Info.plist`:
   - `NSMicrophoneUsageDescription`: `FOH Toolkit uses the microphone only when you start RTA or Ring Out so it can analyse live audio frequencies on this device.`
7. Set deployment target and supported devices after testing on real hardware.
8. Run `npm run ios:sync` after every web-app update before archiving.

## Required App Store assets

- 1024 × 1024 App Store icon with no transparency.
- Current iPhone screenshots in the sizes App Store Connect requests.
- iPad screenshots if iPad is enabled as a supported device.
- Privacy Policy URL: `https://w14orn.github.io/FOH-Toolkit/privacy.html`
- Support URL: `https://w14orn.github.io/FOH-Toolkit/support.html`
- Marketing URL can use the main FOH Toolkit site.

The existing PWA icon can be used as the visual source, but a proper 1024 × 1024 App Store asset should be exported from the original artwork rather than relying on a low-resolution upscale.

## App Review preparation

Create a dedicated review account before submission so Apple can test cloud sync and Community features. Do not use a personal Owner/Admin account for review. Put the temporary review credentials in App Review Information, not in this repository.

Reviewers should be told:

- Guest mode gives access to the core app without login.
- Login is only needed for cloud sync and Community interaction.
- Microphone permission is requested only when RTA or Ring Out is started.
- RTA/Ring Out audio is analysed locally and is not uploaded.
- SPL is labelled as an estimate unless calibrated against a known meter.
- Community presets are separate from FOH Toolkit Verified official presets.
- Member comments are moderated before public display.
- Classic Allen & Heath SQ native export is the only native console export currently described as validated.

## Pre-submission TestFlight pass

Test on at least one recent iPhone and, if supported, an iPad:

- fresh install → Continue without an account
- guest show creation and persistence after relaunch
- account signup / login / logout
- account deletion
- offline launch after prior login
- sync after reconnecting
- microphone deny / allow / later Settings change
- RTA start/stop, Freeze, Snapshot and Peak Hold
- Ring Out guided flow
- Community report, block/unblock, pending comment moderation
- show export / file sharing
- background → foreground resume
- rotation and safe-area layout
- VoiceOver labels on primary controls

## External items that cannot be completed from the repository

- Apple Developer Program membership and legal agreements.
- App Store Connect app record.
- Xcode signing certificates/provisioning.
- Real-device TestFlight testing.
- Final screenshots from the signed native build.
- App Privacy questionnaire submission in App Store Connect.
- Final archive upload and App Review submission.
