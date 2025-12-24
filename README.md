# Vue 3 Blog

A modern blog application built with Vue 3, Firebase, and Tailwind CSS. Features authentication, internationalization, and Markdown support.

## Features

- **Authentication** - Google and Email/Password login via Firebase Auth
- **Internationalization** - English and German with language switcher
- **Markdown Posts** - Write posts in Markdown with live rendering
- **Author Controls** - Edit and delete your own posts
- **Responsive Design** - Mobile-friendly layout with Tailwind CSS

## Tech Stack

- Vue 3 + Vite + TypeScript
- Tailwind CSS v4
- Firebase (Firestore + Auth)
- vue-i18n
- radix-vue
- marked + DOMPurify

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore and Authentication enabled

### Installation

```sh
npm install
```

### Firebase Setup

The Firebase config is included in the repo. If you want to use your own Firebase project:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Google** and **Email/Password** authentication providers
3. Create a Firestore database
4. Update `src/firebase/firebaseConfig.ts` with your config
5. Deploy security rules (see `firestore.rules`)

### Development

```sh
npm run dev
```

### Database Seeding

```sh
npm run seed        # Add sample posts
npm run seed:fresh  # Clear and reseed
```

### Production Build

```sh
npm run build
```

### Linting

```sh
npm run lint
```

## Project Structure

```
src/
├── components/       # UI components
├── composables/      # Reusable logic (useAuth, useToast, etc.)
├── firebase/         # Firebase configuration
├── locales/          # i18n translations (en.json, de.json)
├── types/            # TypeScript types
├── i18n.ts           # vue-i18n setup
views/                # Page components
public/flags/         # Language flag icons
```

## License

MIT
