const light = {
    bg: {
        primary: `#fafafc`,
        secondary: `rgba(0, 0, 0, 0.04)`,
        card: `#ffffff`,
        cardHover: `#f8f8fa`,
        cardBorder: `rgba(0, 0, 0, 0.08)`,
        cardBorderHover: `rgba(0, 0, 0, 0.16)`,
        cardShadow: `0 1px 2px rgba(0, 0, 0, 0.03)`,
        cardShadowHover: `0 2px 6px rgba(0, 0, 0, 0.05)`,
        featuredCard: `#09090b`,
        featuredCardHover: `#18181b`,
        featuredBorder: `#09090b`,
        featuredBorderHover: `#27272a`,
        featuredText: `#ffffff`,
        featuredSubtext: `rgba(255, 255, 255, 0.82)`,
        featuredBadgeBg: `#2563eb`,
        featuredBadgeBorder: `transparent`,
        featuredBadgeText: `#ffffff`,
        featuredIconBg: `#2563eb`,
        featuredIconColor: `#ffffff`,
        tertiary: 'rgba(0,0,0,0.03)',
        border: "#EAEAEA",
        inset: '#e2e4e8',
        input: 'rgba(65,67,78,0.12)',
        hover: 'rgba(0, 0, 0, 0.04)',
    },
    text: {
        primary: `#1d1d1f`,
        nameGradient: `linear-gradient(135deg, #0284c7 0%, #4f46e5 50%, #db2777 100%)`,
        secondary: 'rgba(0, 0, 0, 0.58)',
        tertiary: '#86868b',
        quarternary: '#9194a1',
        placeholder: 'rgba(82,85,96,0.5)',
        onPrimary: '#ffffff',
    },
    img: {
        filter: 'invert(0)'
    },
};

const dark = {
    bg: {
        primary: `#000000`,
        secondary: `rgba(255, 255, 255, 0.05)`,
        card: `rgba(255, 255, 255, 0.04)`,
        cardHover: `rgba(255, 255, 255, 0.07)`,
        cardBorder: `rgba(255, 255, 255, 0.08)`,
        cardBorderHover: `rgba(255, 255, 255, 0.16)`,
        cardShadow: `none`,
        cardShadowHover: `none`,
        featuredCard: `linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)`,
        featuredCardHover: `linear-gradient(135deg, #2563eb 0%, #312e81 100%)`,
        featuredBorder: `#3b82f6`,
        featuredBorderHover: `#60a5fa`,
        featuredText: `#ffffff`,
        featuredSubtext: `rgba(255, 255, 255, 0.88)`,
        featuredBadgeBg: `#3b82f6`,
        featuredBadgeBorder: `transparent`,
        featuredBadgeText: `#ffffff`,
        featuredIconBg: `#3b82f6`,
        featuredIconColor: `#ffffff`,
        tertiary: 'rgba(255,255,255,0.03)',
        border: "#222222",
        inset: '#111111',
        input: 'rgba(191,193,201,0.12)',
        hover: 'rgba(255, 255, 255, 0.06)',
    },
    text: {
        primary: `#f5f5f7`,
        nameGradient: `linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #f472b6 100%)`,
        secondary: 'rgba(255, 255, 255, 0.62)',
        tertiary: '#86868b',
        quarternary: '#6c6f7e',
        placeholder: 'rgba(145,148,161,0.5)',
        onPrimary: '#050505',
    },
    img: {
        filter: 'invert(1)'
    },
};

const defaultTheme = {
    fontSizes: [
        '14px', // 0
        '16px', // 1
        '18px', // 2
        '22px', // 3
        '26px', // 4
        '32px', // 5
        '40px', // 6
    ],
    fontWeights: {
        body: 400,
        subheading: 500,
        link: 600,
        bold: 700,
        heading: 800,
    },
    lineHeights: {
        body: 1.5,
        heading: 1.3,
        code: 1.6,
    },
    deviceSize: {
        mobileS: '320px',
        mobileM: '375px',
        mobileL: '425px',
        tablet: '768px',
        laptop: '1024px',
        laptopL: '1440px',
        desktop: '2560px'
    },
};

export const lightTheme = { ...defaultTheme, ...light };
export const darkTheme = { ...defaultTheme, ...dark };