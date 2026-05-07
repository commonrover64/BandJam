# BandJam
*Built by a musician, for musicians*

BandJam started from a simple problem i faced as a musician, there was no easy way to find practice spaces online. Most of the time we need to search locally and ask around or rely on word of mouth just to find a decent room to practice. BandJam tried to solve this problem by helping musicians and bands easily find and book practice rooms, while allowing room owners to connect directly with people looking for a space to jam.

## What it does

Room owners can sign up, verify their identity via email OTP, and list their practice spaces with photos, pricing, location, and contact details. Musicians can search for rooms near them, browse photos, get directions, and send a booking request directly to the owner. The owner gets a push notification, reviews the request, and either approves or declines. The musician is notified either way.

The whole flow is designed to be fast and frictionless. No middlemen, no complicated payment flows for launch. Payments happen at the venue, keeping things simple while the platform grows.

## Tech stack

The backend is built with Node.js and Express, using PostgreSQL with the PostGIS extension for location-based room search. Images are stored on Cloudinary using direct client-side uploads so the server never has to handle image bytes. Authentication is JWT based with email OTP verification for owner onboarding. Push notifications are handled through Expo's push service backed by Firebase Cloud Messaging V1.

The mobile app is built with React Native using Expo. Navigation is handled by React Navigation with role-based routing — owners and consumers get completely different tab experiences. Maps are powered by Google Maps on Android.

## Project structure

The backend follows a module-based structure where each domain (auth, rooms, bookings, payments, owners) has its own routes, controller, and service file. The mobile app organizes screens by role under a shared navigation setup with a global auth context managing user state.

## Current state

The app is fully functional for the core booking flow on Android. iOS support is ready in code but requires an Apple Developer account to build and distribute. Payments currently work on a pay-at-venue model with owner approval via push notifications. A real payment gateway integration is planned once the business is formally registered.