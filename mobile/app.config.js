export default {
  expo: {
    name: "BandJam",
    slug: "mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: "./src/assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "com.Siddhartha.BandJam",
      supportsTablet: true,
    },
    android: {
      package: "com.Siddhartha.BandJam",
      permissions: ["NOTIFICATIONS", "RECEIVE_BOOT_COMPLETED", "VIBRATE"],
      adaptiveIcon: {
        foregroundImage: "./src/assets/logo.png",
        backgroundColor: "#ffffff",
      },
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
        },
      },
    },
    plugins: [
      "expo-secure-store",
      "@react-native-community/datetimepicker",
      "expo-location",
      "expo-image-picker",
      [
        "expo-notifications",
        {
          icon: "./src/assets/logo.png",
          color: "#ffffff",
          sounds: [],
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "81885d94-5958-492b-840c-162627a70e8b",
      },
    },
    owner: "commonrover",
  },
};
