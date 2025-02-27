# Smart Life Manager

A modern React Native Expo application designed to help users manage their daily tasks, build healthy habits, and improve their productivity with AI-powered suggestions. The app features a beautiful, futuristic UI/UX design and integrates with Firebase for data persistence.

## Features

- **Task Management**: Create, track, and complete daily tasks
- **Habit Building**: Track habits with streaks and progress monitoring
- **Statistics & Analytics**: Visualize your productivity with beautiful charts
- **Smart Insights**: Get AI-powered suggestions to improve your daily routine
- **Dark Mode**: Beautiful dark theme for comfortable use
- **Cloud Sync**: Sync your data across devices with Firebase
- **Modern UI**: Sleek, modern interface with smooth animations

## Tech Stack

- React Native with Expo
- TypeScript for type safety
- Firebase for backend services
- React Navigation for routing
- Reanimated for smooth animations
- React Native Paper for UI components
- Expo Vector Icons for iconography

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-life-manager.git
cd smart-life-manager
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
- Create a new Firebase project
- Copy your Firebase configuration to `src/config/firebase.ts`
- Enable Authentication and Firestore in your Firebase console

4. Start the development server:
```bash
npm start
```

5. Run on your device or emulator:
- Press 'a' for Android
- Press 'i' for iOS
- Scan QR code with Expo Go app for physical devices

## Project Structure

```
smart-life-manager/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── theme/          # Theme and styling
│   └── config/         # Configuration files
├── assets/             # Images and fonts
└── App.tsx            # Root component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the React Native and Expo teams for the amazing frameworks
- Icons provided by Ionicons
- UI inspiration from various modern mobile applications 