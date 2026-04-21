import React, { useState } from 'react';

const SIZE_CHART = {
    XS: { chest: [82, 87], waist: [68, 73], length: [68, 70], arm: [58, 60] },
    S:  { chest: [88, 93], waist: [74, 79], length: [70, 72], arm: [60, 62] },
    M:  { chest: [94, 99], waist: [80, 85], length: [72, 74], arm: [62, 64] },
    L:  { chest: [100, 105], waist: [86, 91], length: [74, 76], arm: [64, 66] },
    XL: { chest: [106, 111], waist: [92, 97], length: [76, 78], arm: [66, 68] },
    XXL:{ chest: [112, 120], waist: [98, 108], length: [78, 82], arm: [68, 72] },
};

function predictSize(height, weight, gender) {
    const bmi = weight / ((height / 100) ** 2);
    const h = Number(height);
    if (gender === 'female') {
        if (bmi < 18.5) return h < 160 ? 'XS' : 'S';
        if (bmi < 23) return h < 160 ? 'S' : h < 170 ? 'M' : 'L';
        if (bmi < 28) return h < 165 ? 'M' : h < 175 ? 'L' : 'XL';
        return h < 170 ? 'L' : 'XL';
    }
    if (bmi < 18.5) return h < 170 ? 'XS' : 'S';
    if (bmi < 23) return h < 170 ? 'S' : h < 180 ? 'M' : 'L';
    if (bmi < 28) return h < 175 ? 'M' : h < 185 ? 'L' : 'XL';
    return h < 180 ? 'XL' : 'XXL';
}

function predictMeasurements(height, weight, gender) {
    const h = Number(height), w = Number(weight);
    const factor = gender === 'female' ? 0.92 : 1;
    return {
        chest: Math.round((h * 0.52 + w * 0.15) * factor),
        waist: Math.round((h * 0.42 + w * 0.2) * factor),
        length: Math.round(h * 0.44),
        armLength: Math.round(h * 0.36),
    };
}

function SizeRecommendation({ onApply }) {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [gender, setGender] = useState('male');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (!height || !weight) return;
        const size = predictSize(height, weight, gender);
        const measurements = predictMeasurements(height, weight, gender);
        setResult({ size, measurements, chart: SIZE_CHART[size] });
    };

    return (
        <div style={{ background: 'color-mix(in srgb, var(--accent) 5%, var(--bg-card))', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--card-radius)', padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>📐 Smart Size Finder</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                    <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Height (cm)</label>
                    <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175"
                        style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                </div>
                <div>
                    <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Weight (kg)</label>
                    <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="75"
                        style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                </div>
                <div>
                    <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value)}
                        style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, padding: '8px 10px', color: 'var(--text)', fontSize: 13 }}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
            </div>
            <button onClick={calculate} disabled={!height || !weight} style={{
                padding: '8px 20px', background: height && weight ? 'var(--accent)' : 'rgba(128,128,128,0.2)',
                border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)', fontWeight: 600, fontSize: 12, cursor: height && weight ? 'pointer' : 'not-allowed'
            }}>Calculate Size</button>

            {result && (
                <div style={{ marginTop: 16, padding: 16, background: 'var(--bg)', borderRadius: 12, border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'var(--bg)' }}>{result.size}</div>
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>Recommended: Size {result.size}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Based on {height}cm, {weight}kg, {gender}</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                        {Object.entries(result.measurements).map(([k, v]) => (
                            <div key={k} style={{ textAlign: 'center', padding: 10, background: 'var(--bg-card)', borderRadius: 8 }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>{v}cm</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k}</div>
                            </div>
                        ))}
                    </div>
                    {onApply && (
                        <button onClick={() => onApply(result.measurements)} style={{
                            padding: '8px 20px', background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                            border: '1px solid var(--accent)', borderRadius: 'var(--btn-radius)',
                            color: 'var(--accent)', fontWeight: 600, fontSize: 12, cursor: 'pointer'
                        }}>📏 Apply These Measurements</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default SizeRecommendation;
