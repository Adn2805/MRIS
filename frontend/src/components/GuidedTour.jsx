import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Lightbulb, HelpCircle } from 'lucide-react';

const GUIDE_STEPS = [
    {
        title: 'Welcome to MRIS! 👋',
        description:
            'This tool helps you see how stocks in the market are connected to each other — like a social network, but for stocks. Stocks that move together are linked.',
        tip: 'No trading or prediction here — this is purely about understanding market structure.',
    },
    {
        title: 'Pick a Stock Index',
        description:
            'Choose a group of stocks to analyze. For example, "NIFTY 50" contains India\'s top 50 companies, and "S&P 500" has America\'s top 50.',
        tip: 'Start with whatever market you\'re most familiar with.',
    },
    {
        title: 'Set the Time Range',
        description:
            'Choose how far back to look. "1M" means 1 month of data, "1Y" means 1 year. Longer periods show more stable relationships.',
        tip: 'Try 3 months (3M) first — it gives a good balance.',
    },
    {
        title: 'Adjust the Threshold',
        description:
            'This slider controls how strong a connection must be to show up. Higher threshold = fewer but stronger connections. Lower = more connections visible.',
        tip: 'Start at 0.60 — if you see too many lines, move it higher.',
    },
    {
        title: 'Click Analyze Network!',
        description:
            'Hit the button and watch the network appear! Each circle is a stock. Lines between them mean they tend to move together. Bigger circles = more influential stocks.',
        tip: 'Hover over any stock to see its connections light up. Click a stock for detailed info.',
    },
    {
        title: 'Reading the Network',
        description:
            'Stocks with the same color belong to the same group (cluster). Stocks in the center with many connections are the most influential in the market.',
        tip: 'The sidebar on the right shows rankings and statistics for the whole network.',
    },
];

export default function GuidedTour({ onClose }) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    const current = GUIDE_STEPS[step];
    const isLast = step === GUIDE_STEPS.length - 1;

    const handleClose = () => {
        setVisible(false);
        localStorage.setItem('mris_tour_done', 'true');
        if (onClose) onClose();
    };

    const handleNext = () => {
        if (isLast) {
            handleClose();
        } else {
            setStep(step + 1);
        }
    };

    return (
        <div className="guided-tour-overlay">
            <div className="guided-tour-card">
                <button className="tour-close" onClick={handleClose}>
                    <X size={16} />
                </button>

                <div className="tour-step-indicator">
                    {GUIDE_STEPS.map((_, i) => (
                        <div key={i} className={`tour-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
                    ))}
                </div>

                <div className="tour-content">
                    <h3 className="tour-title">{current.title}</h3>
                    <p className="tour-description">{current.description}</p>
                    <div className="tour-tip">
                        <Lightbulb size={14} />
                        <span>{current.tip}</span>
                    </div>
                </div>

                <div className="tour-actions">
                    <button className="tour-skip" onClick={handleClose}>
                        Skip guide
                    </button>
                    <button className="tour-next" onClick={handleNext}>
                        {isLast ? 'Get Started' : 'Next'}
                        {!isLast && <ChevronRight size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Reusable info tooltip component
export function InfoTooltip({ text }) {
    const [show, setShow] = useState(false);

    return (
        <span
            className="info-tooltip-wrapper"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <HelpCircle size={12} className="info-tooltip-icon" />
            {show && <div className="info-tooltip-bubble">{text}</div>}
        </span>
    );
}
