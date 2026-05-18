import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

/**
 * ReviewsGrowthChart — Line chart showing reviews over the last 30 days.
 *
 * Props:
 *   data     {Array}    Array of { date, count } objects
 *   mounted  {boolean}  Whether the component has mounted (for SSR safety)
 */
export default function ReviewsGrowthChart({ data, mounted }) {
    return (
        <s-section>
            <s-stack gap="base">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <s-heading level="2">Reviews Growth (30 Days)</s-heading>
                    <span style={{
                        backgroundColor: "#FFEBEE", color: "#D32F2F",
                        padding: "4px 12px", borderRadius: "16px",
                        fontSize: "12px", fontWeight: "600",
                    }}>📈 Trend</span>
                </div>
                <div style={{ height: "300px", width: "100%" }}>
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFEBEE" />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#666' }} minTickGap={30} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#666' }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px', border: '1px solid #FFCDD2',
                                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)',
                                        backgroundColor: '#fff',
                                    }}
                                    cursor={{ stroke: '#FFCDD2', strokeWidth: 1 }}
                                />
                                <Line
                                    type="monotone" dataKey="count" stroke="#D32F2F" strokeWidth={3}
                                    dot={{ r: 5, fill: '#fff', stroke: '#D32F2F', strokeWidth: 2 }}
                                    activeDot={{ r: 7, fill: '#D32F2F', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <s-text tone="subdued">Loading chart...</s-text>
                        </div>
                    )}
                </div>
            </s-stack>
        </s-section>
    );
}
