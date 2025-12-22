# Open Edilkamin

[![Tests](https://github.com/AndreMiras/edilkamin/actions/workflows/tests.yml/badge.svg)](https://github.com/AndreMiras/edilkamin/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/AndreMiras/edilkamin/branch/main/graph/badge.svg)](https://codecov.io/gh/AndreMiras/edilkamin)

<https://edilkamin.vercel.app/>

This is an open alternative to the
[Edilkamin The Mind](https://play.google.com/store/apps/details?id=com.edilkamin.stufe) application
used for controlling pellet heating systems wirelessly.

This is built on top of the [edilkamin.js](https://github.com/AndreMiras/edilkamin.js) library.

## Run

```sh
yarn dev
```

## Test

```sh
yarn lint
yarn test
```

## Mobile Development (Android)

The app can be built as a native Android app using [Capacitor](https://capacitorjs.com/).

### Requirements

- **Node.js** 24.x
- **Java** 21+ (OpenJDK recommended)
- **Android Studio** Meerkat (2024.3.1) or newer
- **Android SDK** 36

On Arch Linux:

```sh
sudo pacman -S jdk21-openjdk
sudo archlinux-java set java-21-openjdk
yay -S android-studio
```

### Build & Run

1. Build the web app for static export:

   ```sh
   yarn build:mobile
   ```

2. Sync web assets to the Android project:

   ```sh
   yarn cap:sync
   ```

3. Open in Android Studio:

   ```sh
   npx cap open android
   ```

4. Run on device/emulator from Android Studio (Shift+F10)

### Development Workflow

After making changes to the web app:

```sh
yarn build:mobile && yarn cap:sync
```

Then rebuild from Android Studio.
