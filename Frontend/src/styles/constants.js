// Shared styling constants to replace inline styles
// This reduces bundle size and improves maintainability

export const STYLE_CONSTANTS = {
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
    },
    fontSize: {
        xs: '11px',
        sm: '12px',
        md: '13px',
        lg: '14px',
        xl: '16px',
    },
    colors: {
        text: 'var(--text)',
        textMuted: 'var(--text-muted)',
        textSecondary: 'var(--text-secondary)',
        bg: 'var(--bg)',
        bgCard: 'var(--bg-card)',
        bgInput: 'var(--bg-input)',
        accent: 'var(--accent)',
        accentLight: 'color-mix(in srgb, var(--accent) 15%, transparent)',
        accentLighter: 'color-mix(in srgb, var(--accent) 10%, transparent)',
    },
    borderRadius: {
        sm: '8px',
        md: '10px',
        lg: 'var(--card-radius)',
        full: '50%',
    },
    shadows: {
        sm: '0 2px 4px rgba(0,0,0,0.1)',
        md: '0 4px 8px rgba(0,0,0,0.15)',
        lg: '0 8px 16px rgba(0,0,0,0.2)',
    },
    transitions: {
        fast: 'all 0.15s ease',
        normal: 'all 0.2s ease',
        slow: 'all 0.3s ease',
    },
};

// Common styles for reuse
export const COMMON_STYLES = {
    flexCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    flexSpaceBetween: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    gridAuto: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
    },
    input: {
        padding: '8px 12px',
        border: `1px solid ${STYLE_CONSTANTS.colors.accentLight}`,
        borderRadius: STYLE_CONSTANTS.borderRadius.sm,
        background: STYLE_CONSTANTS.colors.bgInput,
        color: STYLE_CONSTANTS.colors.text,
        outline: 'none',
        fontSize: STYLE_CONSTANTS.fontSize.md,
    },
    button: {
        padding: '10px 24px',
        background: STYLE_CONSTANTS.colors.accent,
        border: 'none',
        borderRadius: 'var(--btn-radius)',
        color: STYLE_CONSTANTS.colors.bg,
        fontWeight: 700,
        fontSize: STYLE_CONSTANTS.fontSize.md,
        cursor: 'pointer',
        transition: STYLE_CONSTANTS.transitions.normal,
    },
    card: {
        background: STYLE_CONSTANTS.colors.bgCard,
        borderRadius: 'var(--card-radius)',
        border: `1px solid ${STYLE_CONSTANTS.colors.accentLight}`,
        padding: '24px',
    },
};

// Loading spinner styles
export const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner-border" style={{ color: 'var(--accent)' }} role="status" />
    </div>
);
