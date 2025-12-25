# How to release

This is documenting the release process.

We're using [calendar versioning](https://calver.org/) where `YYYY.MM.DD` should be set accordingly.

```sh
VERSION=YYYY.MM.DD
```

## Update package.json and tag

Update the [package.json](../package.json) `version` to match the new release version.

```sh
sed --regexp-extended 's/"version": "(.+)"/"version": "'$VERSION'"/' --in-place package.json
```

Then commit and tag:

```sh
git commit -a -m ":bookmark: $VERSION"
git tag -a $VERSION -m ":bookmark: $VERSION"
```

Push everything including tags:

```sh
git push
git push --tags
```

## Android Version Sync

The Android `versionCode` and `versionName` are automatically derived from the `package.json` version.

- `versionName`: Uses the version string directly (e.g., "2025.12.14")
- `versionCode`: Converts to integer (e.g., 20251214)

No manual updates to `android/app/build.gradle` are required.
