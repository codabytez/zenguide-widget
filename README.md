# TourGuide Widget

A customizable, embeddable product tour widget built with React, TypeScript, and Vite. This widget enables you to create interactive guided tours for any website with minimal integration effort.

## 📋 Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Related Projects](#related-projects)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Usage](#usage)
  - [Embedding the Widget](#embedding-the-widget)
  - [Programmatic Initialization](#programmatic-initialization)
- [Configuration Options](#configuration-options)
- [Customization](#customization)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## Features

- **Easy Integration**: Embed with a single script tag
- **Customizable Tours**: Define multi-step tours with custom content
- **Theme Support**: Light and dark theme options
- **Progress Tracking**: Visual progress indicators
- **Navigation Controls**: Previous, next, and skip functionality
- **Tour Completion Overlay**: Celebrate when users complete the tour
- **Restart Capability**: Allow users to restart the tour anytime
- **Convex Backend**: Real-time data synchronization with Convex

## Demo

To see the widget in action, open the [test-embeded.html](test-embeded.html) file in your browser after building the project.

You can also experience the full tour creation workflow on the [ZenGuide Platform](https://zen-guide-pi.vercel.app/).

## Related Projects

| Project               | Description                                                      | Links                                                                                                                          |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **ZenGuide Platform** | The main web application for creating and managing product tours | [Website](https://zen-guide-pi.vercel.app/) • [Repository](https://github.com/codabytez/ZenGuide)                              |
| **ZenGuide Widget**   | Embeddable widget for displaying tours (this repo)               | [Widget CDN](https://zenguide-widget.vercel.app/widget-bundle.js) • [Repository](https://github.com/codabytez/zenguide-widget) |

### How They Work Together

1. **Create tours** on the [ZenGuide Platform](https://zen-guide-pi.vercel.app/) using the visual tour builder
2. **Get your Tour ID** from the platform after creating a tour
3. **Embed the widget** on your website using the script tag with your Tour ID
4. **Your users** will see the interactive tour when they visit your site

## Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (or npm/yarn)

### Clone the Repository

```bash
git clone https://github.com/codabytez/zenguide-widget.git
cd zenguide-widget
```

### Install Dependencies

```bash
pnpm install
```

## Development Setup

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_CONVEX_URL=your_convex_deployment_url
```

### Start Development Server

```bash
pnpm dev
```

This will start the Vite development server at `http://localhost:5173`.

### Run Linting

```bash
pnpm lint
```

### Build for Production

```bash
pnpm build
```

## Project Structure

```typescript
tour-widget/
├── public/
│   └── widget-bundle.js        # Compiled widget loader script
├── src/
│   ├── @types/
│   │   └── index.d.ts          # TypeScript type definitions
│   ├── assets/
│   │   └── react.svg           # Static assets
│   ├── components/
│   │   ├── UI/                 # Reusable UI components
│   │   └── widget/
│   │       ├── navigation-control.tsx    # Next/Prev/Skip buttons
│   │       ├── progress-indicator.tsx    # Step progress dots/bar
│   │       ├── step-content.tsx          # Tour step content renderer
│   │       ├── tour-avatar.tsx           # Guide avatar component
│   │       ├── tour-completed-overlay.tsx # Completion celebration
│   │       ├── tour-restart-button.tsx   # Restart tour button
│   │       └── tour-widget.tsx           # Main widget component
│   ├── contexts/
│   │   ├── context.tsx         # General app context
│   │   └── tour-context.tsx    # Tour state management context
│   ├── data/
│   │   └── default-tour.ts     # Default tour configuration
│   ├── hooks/
│   │   └── use-tour.ts         # Custom hook for tour logic
│   ├── lib/
│   │   ├── tour-utils.ts       # Tour utility functions
│   │   └── utils.ts            # General utility functions
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # Application styles
│   ├── index.css               # Global styles
│   ├── main.tsx                # React entry point
│   ├── widget-entry.tsx        # Widget mounting entry point
│   └── widget-exports.ts       # Exported widget API
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── eslint.config.js            # ESLint configuration
├── index.html                  # Development HTML entry
├── package.json                # Project dependencies
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # App-specific TS config
├── tsconfig.node.json          # Node-specific TS config
├── vercel.json                 # Vercel deployment config
├── vite.config.ts              # Vite build configuration
└── test-embeded.html           # Widget integration test page
```

## Usage

### Embedding the Widget

Add the following script tag to your HTML page:

```html
<script
  src="https://zenguide-widget.vercel.app/widget-bundle.js"
  data-tour-id="your-tour-id"
  data-auto-start="true"
></script>
```

#### Script Attributes

| Attribute              | Required | Default        | Description                                |
| ---------------------- | -------- | -------------- | ------------------------------------------ |
| `data-tour-id`         | Yes      | -              | Unique identifier for your tour            |
| `data-auto-start`      | No       | `true`         | Whether to start the tour automatically    |
| `data-position`        | No       | `bottom-right` | Position of the widget on the screen       |
| `data-show-avatar`     | No       | `true`         | Whether to show the guide avatar           |
| `data-avatar-position` | No       | `left`         | Position of the avatar relative to content |

### Programmatic Initialization

For more control, initialize the widget programmatically:

```html
<script src="https://zenguide-widget.vercel.app/widget-bundle.js"></script>
<script>
  // Wait for the widget to load
  document.addEventListener("DOMContentLoaded", function () {
    TourGuide.init({
      tourId: "your-tour-id",
      autoStart: true,
    });
  });
</script>
```

## Configuration Options

| Option           | Type      | Default        | Description                                |
| ---------------- | --------- | -------------- | ------------------------------------------ |
| `tourId`         | `string`  | **required**   | Unique identifier for the tour             |
| `autoStart`      | `boolean` | `true`         | Automatically start the tour on page load  |
| `position`       | `string`  | `bottom-right` | Widget position on the screen              |
| `showAvatar`     | `boolean` | `true`         | Show or hide the guide avatar              |
| `avatarPosition` | `string`  | `left`         | Position of the avatar relative to content |

## Customization

<!-- ### Themes

The widget supports two built-in themes:

- **Dark Theme** (default): Dark background with light text
- **Light Theme**: Light background with dark text

```javascript
TourGuide.init({
  tourId: "my-tour",
  theme: "light", // or 'dark'
});
``` -->

### Custom Styling

You can override widget styles by targeting the widget container:

```css
#tourguide-widget-root {
  /* Your custom styles */
}

#tourguide-widget-root .tour-step {
  /* Custom step styles */
}
```

## Building for Production

### Build the Widget Bundle

```bash
pnpm build
```

This generates optimized production files in the `dist/` directory.

### Build Configuration

The build is configured in [vite.config.ts](vite.config.ts) with the following key settings:

- **Library Mode**: Builds as a UMD library for embedding
- **External Dependencies**: React is bundled for standalone usage
- **Minification**: Code is minified for production

## Deployment

### Vercel Deployment

The project includes a [vercel.json](vercel.json) configuration for easy deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Deployment

1. Build the project: `pnpm build`
2. Upload the contents of `dist/` to your hosting provider
3. Ensure the `widget-bundle.js` is accessible via a public URL

### CDN Hosting

For best performance, host the widget bundle on a CDN:

1. Upload `dist/widget-bundle.js` to your CDN
2. Update the script src in your embed code

## API Reference

### Global Object: `TourGuide`

The widget exposes a global `TourGuide` object on the `window`:

#### `TourGuide.init(config)`

Initializes the tour widget with the provided configuration.

```typescript
interface TourGuideConfig {
  tourId: string;
  autoStart?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showAvatar?: boolean;
  avatarPosition?: 'left' | 'right';
}

TourGuide.init(config: TourGuideConfig): void
```

#### `TourGuide.config`

Access the current widget configuration:

```javascript
console.log(TourGuide.config);
// { tourId: 'my-tour', autoStart: true, position: 'bottom-right', ... }
```

### Context Hooks

For internal development, the following hooks are available:

#### `useTour()`

Access tour state and controls from [src/hooks/use-tour.ts](src/hooks/use-tour.ts):

```typescript
const {
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  restartTour,
  isCompleted,
} = useTour();
```

## Testing

### Local Testing

1. Build the widget: `pnpm build`
2. Open [test-embeded.html](test-embeded.html) in a browser
3. The widget should load and display the tour

### Integration Testing

Test the widget on a real website:

1. Deploy the widget bundle to a public URL
2. Add the embed script to your test page
3. Verify tour functionality

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run linting: `pnpm lint`
5. Commit your changes: `git commit -m 'feat: Add my feature'`
6. Push to the branch: `git push origin feat/my-feature`
7. Open a Pull Request

### Code Style

- Follow the ESLint configuration in [eslint.config.js](eslint.config.js)
- Use TypeScript for all new code
- Write meaningful commit messages

---

## Troubleshooting

### Widget Not Loading

1. Check browser console for errors
2. Verify the `tourId` is valid
3. Ensure the script URL is accessible
4. Check for Content Security Policy (CSP) issues

### Tour Not Starting

1. Verify `autoStart` is set to `true`
2. Check that the tour data exists for the given `tourId`
3. Ensure Convex connection is established

### Styling Issues

1. Check for CSS conflicts with host page
2. Verify the widget container exists: `#tourguide-widget-root`
3. Inspect element styles in browser dev tools

---

#### Built using React, TypeScript, Vite, Convex, Tailwind CSS and deployed with Vercel
