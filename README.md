# Fadd Links — Link Directory & Bio Hub

<p align="center">
  <img src="public/avatar.png" alt="Mufaddhol" width="96" height="96" style="border-radius: 50%;" />
</p>

<p align="center">
  <strong>Clean, minimalist, Apple-inspired bio link directory for Mufaddhol (Fadd Graphics).</strong><br>
  Built with Next.js, React, and Styled Components.
</p>

<p align="center">
  <a href="https://faddgraphics.my.id"><img src="https://img.shields.io/badge/Website-faddgraphics.my.id-blue.svg?style=flat-square" alt="Website" /></a>
  <img src="https://img.shields.io/badge/Next.js-12.2.4-black.svg?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18.2.0-61dafb.svg?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Styled--Components-5.3.5-db7093.svg?style=flat-square&logo=styled-components" alt="Styled Components" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License" />
</p>

---

## Overview

**Fadd Links** is a custom, high-performance link directory built as an elegant alternative to generic link-in-bio services. It serves as the official central hub for **Mufaddhol (Fadd Graphics)** to organize design portfolios, direct contact channels, personal branding, and featured product releases (such as **FaddDompet**).

### ✨ Key Features

- **Apple-Inspired Aesthetic**: Clean, border-focused cards, subtle micro-interactions, and refined typography.
- **Dark & Light Mode**: Automatic system color scheme detection with seamless toggle integration.
- **Featured Product Highlight**: High-contrast, prominent spotlight card for app releases (FaddDompet).
- **Categorized Directory**: Structured links organized by priorities (Core Services, Contact, Releases, Media, Credentials, Support).
- **Dynamic SEO & Open Graph**: Full meta tag, Twitter card, and social sharing preview optimization via `next-seo`.
- **Zero Bloat**: Purged dead assets and unused dependencies, delivering an ultra-light production bundle.

---

## Tech Stack

- **Framework**: [Next.js 12](https://nextjs.org/) (Pages Router with SSG/SSR)
- **Library**: [React 18](https://react.dev/)
- **Styling**: [Styled Components 5](https://styled-components.com/)
- **SEO**: [Next-SEO](https://github.com/garmeeh/next-seo)
- **Icons**: Custom sharp SVG vectors

---

## Project Structure

```text
├── components/
│   ├── Layout.js            # Main layout wrapper & background styling
│   ├── ReusableStyles.js    # Core reusable styled components (Container)
│   ├── Seo.js               # Dynamic Open Graph & meta tags handler
│   ├── WebLinks.js          # Main link tree render engine & sections
│   └── icons/
│       └── index.js         # SVG avatar shapes and arrow icons
├── data/
│   ├── BioData.js           # Profile metadata, name, bio, and social handles
│   └── LinksData.js         # Link database, categories, badges, and icons
├── pages/
│   ├── _app.js              # Custom Next.js App wrapper, ThemeProvider & SEO
│   ├── _document.js         # HTML document skeleton with SSR font/style injection
│   └── index.js             # Homepage entry point
├── public/                  # Static assets (avatar, icons, favicons, preview)
├── styles/
│   ├── GlobalStyle.js       # CSS reset & Apple system font stack
│   └── theme.config.js      # Light/Dark design tokens, borders, and gradients
├── next-seo.config.js       # Default OpenGraph and SEO configuration
└── package.json             # Project dependencies and npm scripts
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.x` or higher (`v20+` recommended)
- **npm**: `v9.x` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/fadd3079-prog/Clone-Linktree.git
   cd Clone-Linktree
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration & Customization

### 1. Profile Information (`data/BioData.js`)

Edit `data/BioData.js` to change your name, bio, avatar, and footer information:

```javascript
const bioData = [
  {
    name: 'Mufaddhol',
    username: '@fadd.graphics',
    url: 'https://faddgraphics.my.id',
    avatar: '/avatar.png',
    nftAvatar: true, // true = hexagon clip, false = oval clip
    description: 'Design, Creative Media & Tech',
    descShow: true,
    subdesc: 'Portfolio • Business Inquiries • Products',
    subdescShow: true,
    author: 'Mufaddhol',
    authorURL: 'https://faddgraphics.my.id',
    footerText: '© ' + new Date().getFullYear() + ' Fadd Graphics. All rights reserved.'
  }
];

export default bioData;
```

### 2. Links & Categories (`data/LinksData.js`)

Add or modify links in `data/LinksData.js`:

```javascript
const webLinks = [
  // Top social bar icon
  {
    title: 'Instagram',
    url: 'https://www.instagram.com/fadd.fadhol',
    type: 'social',
    icon: '/insta.svg',
    on: true
  },

  // Highlighted release card
  {
    title: 'Download FaddDompet App',
    badge: 'v1.3.0',
    url: 'https://github.com/fadd3079-prog/faddompet/releases/tag/v1.3.0',
    type: 'Featured Product & Release',
    icon: '/download.svg',
    featured: true,
    on: true
  },

  // Standard directory card
  {
    title: 'Official Website',
    url: 'https://faddgraphics.my.id/',
    type: 'Core Services & Portfolio',
    icon: '/web.svg',
    on: true
  }
];

export default webLinks;
```

### 3. SEO & Social Previews (`next-seo.config.js`)

Update your Open Graph details in `next-seo.config.js`:

```javascript
const defaultSEO = {
  title: 'Mufaddhol - Fadd Graphics',
  description: 'Design, creative media, and tech portfolio by Mufaddhol (Fadd Graphics)',
  canonical: 'https://faddgraphics.my.id',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://faddgraphics.my.id',
    site_name: 'Fadd Graphics',
    images: [
      {
        url: 'https://faddgraphics.my.id/preview.png',
        width: 1200,
        height: 630,
        alt: 'Mufaddhol - Fadd Graphics'
      }
    ]
  },
  twitter: {
    handle: '@faddgraphics',
    site: '@faddgraphics',
    cardType: 'summary_large_image'
  }
};

export default defaultSEO;
```

---

## Production Build & Deployment

### Build Locally

```bash
npm run build
npm run start
```

### Deploy to Vercel

The fastest way to deploy your Next.js link directory is using [Vercel](https://vercel.com/):

1. Push your repository to GitHub.
2. Import the project in Vercel.
3. Keep the default build settings (`next build`) and deploy.

---

## License

This project is open-source and available under the [MIT License](LICENSE.md).

---

<p align="center">
  Crafted with care by <a href="https://faddgraphics.my.id"><strong>Mufaddhol (Fadd Graphics)</strong></a>
</p>