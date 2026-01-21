# Vue 3 Blog

Live visit [www.cloudfink.com](https://www.cloudfink.com)
- including sample data

A modern blog application built with Vue 3, Firebase, and Tailwind CSS. Features authentication, internationalization, and Markdown support.

## Features

- **Authentication** - Google and Email/Password login via Firebase Auth
- **Username System** - Unique usernames with real-time availability checking
- **Publishing Workflow** - Posts start as "pending" until approved by admins
- **Admin Role** - Admins can publish/unpublish posts
- **Author Controls** - Edit and delete your own posts
- **Account Deletion** - Full cascade delete (posts, username, user data)
- **Internationalization** - English and German with language switcher
- **Markdown Posts** - Write posts in Markdown
- **Toast Notifications** - User feedback via radix-vue toasts
- **Responsive Design** - Mobile-friendly layout with Tailwind CSS
- **Security Rules** - Firestore rules with comprehensive test coverage

## Tech Stack

- Vue 3 + Vite + TypeScript
- Tailwind CSS v4
- Firebase (Firestore + Auth)
- vue-i18n
- radix-vue
- marked + DOMPurify

## Accessibility

Built with accessibility in mind:

- **radix-vue** - WAI-ARIA compliant UI primitives with keyboard navigation and screen reader support
- **FormKit** - Accessible forms with proper labeling and error announcements
- **Semantic HTML** - Proper use of `<header>`, `<nav>`, `<main>`, `<article>`, and heading hierarchy

## Security Note

> **The Firebase API key is intentionally public.** This is safe and by design.

Firebase API keys are **not secrets**. Unlike traditional API keys, they only identify your Firebase project to Google's servers. The actual security is enforced by:

1. **Firestore Security Rules** - Define who can read/write what data (see `firestore.rules`)
2. **Firebase Authentication** - Validates user identity server-side
3. **Server-side validation** - All rules are enforced by Firebase, not the client

This is [how Firebase is designed to work](https://firebase.google.com/docs/projects/api-keys). The rules in this project are tested with `@firebase/rules-unit-testing` - run `npm run test:rules` to verify.

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

### Testing

```sh
npm run test        # Run all tests
npm run test:rules  # Run Firestore security rules tests only
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
