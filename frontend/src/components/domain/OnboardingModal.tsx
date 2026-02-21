import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

const ONBOARDING_KEY = 'sharesathi_onboarding_done';

const STEPS = [
    {
        icon: '📊',
        title: 'Welcome to ShareSathi!',
        description: 'Nepal\'s paper trading platform powered by real NEPSE data. Practice investing risk-free with Rs. 10,00,000 virtual starting balance.',
    },
    {
        icon: '📈',
        title: 'Real Market Data',
        description: 'Live stock prices, indices, and news from NEPSE. Everything you see (prices, volumes, charts) comes directly from the Nepal Stock Exchange.',
    },
    {
        icon: '💰',
        title: 'Paper Trading',
        description: 'Buy and sell stocks with virtual money. NEPSE-accurate brokerage fees, lot sizes, and market hours are enforced — just like real trading.',
    },
    {
        icon: '⚠️',
        title: 'Important Notice',
        description: 'This is NOT a real brokerage. No real money is involved. Some data (fundamentals, AI forecasts) is simulated. Do NOT use this for real investment decisions.',
    },
];

export const OnboardingModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const done = localStorage.getItem(ONBOARDING_KEY);
        if (!done) {
            setIsOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsOpen(false);
        navigate('/dashboard');
    };

    const handleSkip = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    const current = STEPS[step];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
                {/* Progress bar */}
                <div className="h-1 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-[#238b96] to-[#60bb46] transition-all duration-500"
                        style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    />
                </div>

                <div className="p-8 text-center">
                    <div className="text-5xl mb-4">{current.icon}</div>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">{current.title}</h2>
                    <p className="text-sm text-slate-600 leading-relaxed mb-8">{current.description}</p>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleSkip}
                            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Skip
                        </button>

                        <div className="flex items-center gap-2">
                            {/* Step dots */}
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-[#238b96]' : i < step ? 'bg-[#60bb46]' : 'bg-slate-200'}`}
                                />
                            ))}
                        </div>

                        <Button
                            onClick={handleNext}
                            className="bg-[#238b96] text-white px-6 py-2 text-sm font-medium hover:bg-[#1c6f78]"
                        >
                            {step === STEPS.length - 1 ? 'Get Started' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
