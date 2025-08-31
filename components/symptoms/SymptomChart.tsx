import { useMemo } from 'react';
import type { SymptomChartProps } from '@/types/symptom';

export default function SymptomChart({ entries, symptoms }: SymptomChartProps) {
  const chartData = useMemo(() => {
    if (!entries.length) return null;

    // Group entries by date and symptom
    const groupedData = entries.reduce((acc, entry) => {
      const date = new Date(entry.date).toISOString().split('T')[0]; // Use ISO date format
      const symptomName = typeof entry.symptom === 'object' ? entry.symptom.name : 
        symptoms.find(s => s._id === entry.symptom)?.name || 'Unknown';
      
      if (!acc[date]) acc[date] = {};
      if (!acc[date][symptomName]) acc[date][symptomName] = [];
      
      acc[date][symptomName].push(entry.severity);
      return acc;
    }, {} as Record<string, Record<string, number[]>>);

    // Convert to line chart format with continuous data points
    const dates = Object.keys(groupedData).sort();
    const symptomNames = [...new Set(entries.map(e => 
      typeof e.symptom === 'object' ? e.symptom.name : 
      symptoms.find(s => s._id === e.symptom)?.name || 'Unknown'
    ))];

    // Create data points for each symptom across all dates
    const lineData = symptomNames.map(symptomName => {
      return dates.map(date => {
        const severities = groupedData[date]?.[symptomName] || [];
        const avgSeverity = severities.length > 0 
          ? severities.reduce((a, b) => a + b, 0) / severities.length 
          : null; // null for missing data points
        return { date, severity: avgSeverity };
      }).filter(point => point.severity !== null); // Remove null points
    });

    return { dates, symptomNames, groupedData, lineData };
  }, [entries, symptoms]);

  if (!chartData || chartData.dates.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Symptom Severity Line Chart</h3>
        <p className="text-gray-500">No symptom entries to display.</p>
      </div>
    );
  }

  const { dates, symptomNames, lineData } = chartData;
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  
  // Chart dimensions
  const chartWidth = 600;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Symptom Severity Line Chart</h3>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {symptomNames.map((name, index) => (
          <div key={name} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-sm font-medium">{name}</span>
          </div>
        ))}
      </div>

      {/* Line Chart SVG */}
      <div className="relative overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="border border-gray-200 rounded">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Chart area background */}
          <rect 
            x={padding.left} 
            y={padding.top} 
            width={innerWidth} 
            height={innerHeight} 
            fill="white" 
            stroke="#d1d5db" 
            strokeWidth="1"
          />
          
          {/* Y-axis labels and lines */}
          {[0, 2, 4, 6, 8, 10].map(value => {
            const y = padding.top + innerHeight - (value / 10) * innerHeight;
            return (
              <g key={value}>
                <line 
                  x1={padding.left} 
                  y1={y} 
                  x2={padding.left + innerWidth} 
                  y2={y} 
                  stroke="#e5e7eb" 
                  strokeWidth="1"
                />
                <text 
                  x={padding.left - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  fontSize="12" 
                  fill="#6b7280"
                >
                  {value}
                </text>
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {dates.slice(-14).map((date, index) => {
            const x = padding.left + (index / (dates.slice(-14).length - 1)) * innerWidth;
            return (
              <text 
                key={date}
                x={x} 
                y={chartHeight - 10} 
                textAnchor="middle" 
                fontSize="10" 
                fill="#6b7280"
                transform={`rotate(-45 ${x} ${chartHeight - 10})`}
              >
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
          
          {/* Line paths and data points */}
          {lineData.map((symptomData, symptomIndex) => {
            if (symptomData.length === 0) return null;
            
            const color = colors[symptomIndex % colors.length];
            const recentData = symptomData.filter(point => 
              dates.slice(-14).includes(point.date)
            );
            
            if (recentData.length === 0) return null;
            
            // Create path for line
            const pathData = recentData.map((point, index) => {
              const dateIndex = dates.slice(-14).indexOf(point.date);
              const x = padding.left + (dateIndex / (dates.slice(-14).length - 1)) * innerWidth;
              const y = padding.top + innerHeight - ((point.severity || 0) / 10) * innerHeight;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');
            
            return (
              <g key={symptomNames[symptomIndex]}>
                {/* Line path */}
                <path 
                  d={pathData} 
                  fill="none" 
                  stroke={color} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {recentData.map((point, index) => {
                  const dateIndex = dates.slice(-14).indexOf(point.date);
                  const x = padding.left + (dateIndex / (dates.slice(-14).length - 1)) * innerWidth;
                  const y = padding.top + innerHeight - ((point.severity || 0) / 10) * innerHeight;
                  
                  return (
                    <circle 
                      key={`${point.date}-${index}`}
                      cx={x} 
                      cy={y} 
                      r="4" 
                      fill={color} 
                      stroke="white" 
                      strokeWidth="2"
                      className="hover:r-6 transition-all cursor-pointer"
                    >
                      <title>{`${symptomNames[symptomIndex]}: ${(point.severity || 0).toFixed(1)}/10 on ${new Date(point.date).toLocaleDateString()}`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
          
          {/* Axis labels */}
          <text 
            x={padding.left + innerWidth / 2} 
            y={chartHeight - 5} 
            textAnchor="middle" 
            fontSize="12" 
            fill="#374151" 
            fontWeight="500"
          >
            Date
          </text>
          
          <text 
            x={15} 
            y={padding.top + innerHeight / 2} 
            textAnchor="middle" 
            fontSize="12" 
            fill="#374151" 
            fontWeight="500"
            transform={`rotate(-90 15 ${padding.top + innerHeight / 2})`}
          >
            Severity (0-10)
          </text>
        </svg>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Showing last 14 days. Hover over data points to see exact values.</p>
      </div>
    </div>
  );
}
