# Hidden Gallery Calculator

A React Native app that looks and behaves exactly like the iOS Calculator. When you type a secret passcode (digits on the calculator) and press `=`, the app opens a hidden photo gallery. The gallery's images and metadata are stored in Firebase.

## Features

-   **iOS Calculator Look & Feel**: Exact visual replication of the iOS Calculator with proper colors, spacing, and key layout
-   **Secret Passcode Access**: Type a secret sequence of digits and press `=` to access the hidden gallery
-   **Firebase Integration**: Anonymous authentication, Firestore for metadata, Storage for images
-   **Secure Storage**: Passcode is hashed with SHA-256 and stored securely
-   **Photo Gallery**: Upload, view, and manage images in your hidden gallery

## Tech Stack

-   **Expo SDK 53** with React Native 0.79
-   **expo-router** for navigation
-   **NativeWind** + **Tailwind CSS** for styling
-   **GlueStack UI** for components
-   **Firebase v10** (Auth, Firestore, Storage)
-   **expo-secure-store** for secure passcode storage
-   **expo-image-picker** for photo selection
-   **react-native-gesture-handler** & **react-native-reanimated** for gestures

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Anonymous sign-in)
3. Create a Firestore database
4. Create a Storage bucket
5. Copy `.env.example` to `.env` and fill in your Firebase config:

```bash
cp .env.example .env
```

Fill in your Firebase configuration values in `.env`:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase Security Rules

#### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /hiddenMeta/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /hidden/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Run the App

```bash
npx expo start -c
```

## Usage

### Default Passcode

-   **Development**: The default passcode is `1701`
-   **Production**: Set your own passcode by long-pressing the AC button to open the passcode setup modal

### Calculator Features

-   All standard calculator operations: `+`, `-`, `×`, `÷`, `%`, `+/-`
-   Decimal support
-   Operator chaining
-   Clear (AC) functionality
-   Division by zero handling

### Secret Access

1. Type your secret passcode using the calculator digits
2. Press `=` to evaluate
3. If the passcode is correct, you'll be taken to the hidden gallery
4. If incorrect, the calculator will perform normal evaluation

### Hidden Gallery

-   **Add Photos**: Tap "Add Photo" to select images from your library
-   **View Images**: Images are displayed in a 2-column grid
-   **Pull to Refresh**: Pull down to refresh the gallery
-   **Secure Storage**: All images are stored in Firebase Storage under the `hidden/` folder

## Security Features

-   **Anonymous Authentication**: Automatic Firebase anonymous sign-in
-   **Secure Passcode Storage**: Only SHA-256 hash is stored, never plain text
-   **Firebase Security Rules**: Access restricted to authenticated users
-   **No Plain Text Storage**: Passcodes are never stored in plain text

## Development Notes

### Passcode Management

-   Passcodes are hashed using SHA-256
-   Stored securely using `expo-secure-store`
-   Default development passcode: `1701`
-   Long-press AC button to open passcode setup modal
-   Passcode must be at least 4 digits long
-   Passcode confirmation required for security

### Firebase Structure

```
Firestore Collection: hiddenMeta
├── Document ID (auto-generated)
├── url: string (Storage download URL)
├── createdAt: timestamp
├── width?: number
├── height?: number
└── mime?: string

Storage: hidden/
└── img_<timestamp>.jpg
```

### Calculator Logic

-   Rolling buffer captures last 12 digit presses
-   Secret verification happens on `=` press
-   Digit buffer is cleared on operator keys and after evaluation
-   Supports all standard calculator operations

## Troubleshooting

### Common Issues

1. **Firebase Connection Issues**

    - Verify your `.env` file has correct Firebase config
    - Check Firebase project settings
    - Ensure Authentication, Firestore, and Storage are enabled

2. **Image Upload Fails**

    - Check Storage security rules
    - Verify media library permissions
    - Ensure Firebase Storage is properly configured

3. **Passcode Not Working**

    - Default passcode is `1701`
    - Check if you're typing digits in the correct sequence
    - Verify secure storage is working

4. **App Won't Start**
    - Clear Expo cache: `npx expo start -c`
    - Check all dependencies are installed
    - Verify babel and tailwind configuration

## Production Considerations

-   Update Firebase security rules for production use
-   Implement user-specific storage paths for multi-user support
-   Add proper error handling and user feedback
-   Consider adding biometric authentication
-   Implement proper backup/restore functionality

## License

This project is for educational and personal use only.
