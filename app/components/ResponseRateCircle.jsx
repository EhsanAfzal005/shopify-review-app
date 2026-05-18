/**
 * ResponseRateCircle — SVG circular progress indicator for response rate.
 *
 * Props:
 *   rate  {number}  Percentage value (0–100)
 */
export default function ResponseRateCircle({ rate }) {
    const circumference = 2 * Math.PI * 24;
    return (
        <div style={{ position: "relative", width: "56px", height: "56px" }}>
            <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" stroke="#FFEBEE" strokeWidth="5" fill="none" />
                <circle
                    cx="28" cy="28" r="24" stroke="#D32F2F" strokeWidth="5" fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (rate / 100) * circumference}
                    strokeLinecap="round"
                    transform="rotate(-90 28 28)"
                />
                <text x="50%" y="54%" textAnchor="middle" fontSize="11" fill="#D32F2F" fontWeight="bold">
                    {rate}%
                </text>
            </svg>
        </div>
    );
}
