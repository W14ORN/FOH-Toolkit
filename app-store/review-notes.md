# App Review notes draft

FOH Toolkit is a live-sound engineering utility. The core app can be reviewed without creating an account by tapping **Continue without an account** on the first screen.

## What can be tested in guest mode

- Official preset library and console translation
- My Shows and channel/show building
- Stagebox/local-I/O visual patch planning
- RTA
- Ring Out
- Local persistence/offline use
- Show package export

## Features that require a review account

- Cloud sync
- Community preset submission
- Ratings and comments
- User blocking/reporting

A dedicated App Review account should be supplied in App Store Connect before submission. Do not use an Owner/Admin account.

## Microphone permission

The app does not request microphone permission at launch. Permission is requested only after the reviewer starts RTA or Ring Out. Microphone audio is analysed locally for spectrum/feedback detection and is not uploaded or stored by FOH Toolkit.

## RTA / SPL note

The RTA is a frequency-analysis tool. Any SPL-style value shown without calibration is labelled as an estimate. FOH Toolkit does not claim that an iPhone microphone is a calibrated Class 1/2 sound-level meter.

## Community moderation

- Community presets are separate from FOH Toolkit Verified official presets.
- Normal member preset submissions require Admin/Owner approval before public display.
- Normal member comments are held for moderation before public display.
- Users can report presets and block other Community engineers.
- Admin/Owner accounts have moderation tools.

## Account deletion

Signed-in users can initiate permanent deletion in **Profile → Account & Privacy → Delete account**. A second confirmation requires typing `DELETE`. This removes the auth account, saved FOH Toolkit account state and Community content associated with the account.

## Console export

The app can export its own `.fohshow.json` package for all shows. The Allen & Heath SQ native exporter is separately labelled as a validated classic SQ beta. FOH Toolkit does not claim native show-file support for console families whose file formats have not been validated.

## Offline behaviour

Core functionality works offline. A signed-in user who has logged in successfully before can continue using locally saved work while offline and sync again after reconnecting.
