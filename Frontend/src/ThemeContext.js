import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DEFAULT_THEME = {
    name: 'Gold',
    accent: '#c9a84c',
    accentLight: '#e8c97a',
    bg: '#0d0d0d',
    bgCard: '#151515',
    bgInput: '#1e1e1e',
    text: '#f0ead6',
    textSecondary: '#a09880',
    textMuted: '#6b6355',
    navBg: 'rgba(13,13,13,0.97)',
    navText: '#a09880',
    footerBg: '#0a0a0a',
    btnRadius: '10',
    cardRadius: '16',
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
};

const PRESETS = {
    Gold: { ...DEFAULT_THEME },
    Emerald: { ...DEFAULT_THEME, name:'Emerald', accent:'#2ecc71', accentLight:'#58d68d', bg:'#0a1210', bgCard:'#0f1a16', navBg:'rgba(10,18,16,0.97)' },
    Ocean: { ...DEFAULT_THEME, name:'Ocean', accent:'#3498db', accentLight:'#5dade2', bg:'#0a0f1a', bgCard:'#0f1520', navBg:'rgba(10,15,26,0.97)' },
    Rose: { ...DEFAULT_THEME, name:'Rose', accent:'#e74c8b', accentLight:'#f06292', bg:'#1a0a12', bgCard:'#1f0f17', navBg:'rgba(26,10,18,0.97)' },
    Purple: { ...DEFAULT_THEME, name:'Purple', accent:'#9b59b6', accentLight:'#bb8fce', bg:'#120a1a', bgCard:'#170f20', navBg:'rgba(18,10,26,0.97)' },
    Sunset: { ...DEFAULT_THEME, name:'Sunset', accent:'#e67e22', accentLight:'#f0a04b', bg:'#1a120a', bgCard:'#201710', navBg:'rgba(26,18,10,0.97)' },
    Light: { ...DEFAULT_THEME, name:'Light', accent:'#2c3e50', accentLight:'#34495e', bg:'#f5f0e8', bgCard:'#ffffff', bgInput:'#f0ebe3', text:'#1a1a1a', textSecondary:'#555', textMuted:'#888', navBg:'rgba(255,255,255,0.97)', navText:'#555', footerBg:'#f0ebe3' },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        try {
            const saved = localStorage.getItem('mz_theme');
            return saved ? JSON.parse(saved) : DEFAULT_THEME;
        } catch { return DEFAULT_THEME; }
    });

    const setTheme = useCallback((t) => {
        setThemeState(t);
        localStorage.setItem('mz_theme', JSON.stringify(t));
    }, []);

    const applyPreset = useCallback((name) => {
        if (PRESETS[name]) setTheme(PRESETS[name]);
    }, [setTheme]);

    const updateField = useCallback((key, value) => {
        setTheme(prev => ({ ...prev, [key]: value }));
    }, [setTheme]);

    const resetTheme = useCallback(() => {
        setTheme(DEFAULT_THEME);
    }, [setTheme]);

    // Apply CSS variables to document
    useEffect(() => {
        const r = document.documentElement.style;
        r.setProperty('--accent', theme.accent);
        r.setProperty('--accent-light', theme.accentLight);
        r.setProperty('--bg', theme.bg);
        r.setProperty('--bg-card', theme.bgCard);
        r.setProperty('--bg-input', theme.bgInput);
        r.setProperty('--text', theme.text);
        r.setProperty('--text-secondary', theme.textSecondary);
        r.setProperty('--text-muted', theme.textMuted);
        r.setProperty('--nav-bg', theme.navBg);
        r.setProperty('--nav-text', theme.navText);
        r.setProperty('--footer-bg', theme.footerBg);
        r.setProperty('--btn-radius', theme.btnRadius + 'px');
        r.setProperty('--card-radius', theme.cardRadius + 'px');
        r.setProperty('--font-heading', theme.fontHeading + ', serif');
        r.setProperty('--font-body', theme.fontBody + ', sans-serif');
        document.body.style.background = theme.bg;
        document.body.style.color = theme.text;
        document.body.style.fontFamily = theme.fontBody + ', sans-serif';
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, applyPreset, updateField, resetTheme, PRESETS }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() { return useContext(ThemeContext); }
