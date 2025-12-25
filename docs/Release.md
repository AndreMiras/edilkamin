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

## GitHub Secrets for Android Release

The following secrets must be configured in GitHub repository settings for automated Android releases:

| Secret Name                       | Description                                        |
| --------------------------------- | -------------------------------------------------- |
| `KEYSTORE_BASE64`                 | Base64-encoded keystore: `base64 -w0 keystore.jks` |
| `KEYSTORE_PASSWORD`               | Password for the keystore                          |
| `KEY_ALIAS`                       | Key alias (e.g., `open-edilkamin`)                 |
| `KEY_PASSWORD`                    | Password for the key                               |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | Service account JSON for Play Store API            |

### Setting Up Secrets

1. **Encode keystore to base64**:

   ```bash
   base64 -w0 open-edilkamin.keystore > keystore-base64.txt
   ```

2. **Add secrets in GitHub**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add each secret listed above

3. **Service Account JSON**:
   - Create a service account in Google Cloud Console
   - Grant "Service Account User" role
   - Download JSON key
   - In Play Console, invite the service account email with "Release Manager" permissions
   - Copy the entire JSON file contents as the secret value
