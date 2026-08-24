import React from "react";
import useDarkMode from "use-dark-mode";
import styled from "styled-components";

const darkModeConfig = {
    classNameDark: 'dark-mode',
    classNameLight: 'light-mode',
    storageKey: 'darkMode',
};

export default function ThemeToggle({ className, size = 36 }) {
    const darkMode = useDarkMode(false, darkModeConfig);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <ToggleButton style={{ width: size, height: size }} className={className} disabled />;
    }

    return (
        <ToggleButton
            onClick={darkMode.toggle}
            className={className}
            style={{ width: size, height: size }}
            title={darkMode.value ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
            aria-label="Toggle Theme"
        >
            {darkMode.value ? (
                // Sun Icon (when in dark mode, clicking switches to light)
                <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            ) : (
                // Moon Icon (when in light mode, clicking switches to dark)
                <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            )}
        </ToggleButton>
    );
}

const ToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  color: ${({ theme }) => theme.text.primary};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.bg.cardHover};
    border-color: ${({ theme }) => theme.bg.cardBorderHover};
    transform: scale(1.04);
  }

  &:active {
    transform: scale(0.96);
  }
`;
