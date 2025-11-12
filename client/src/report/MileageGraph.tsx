import React from 'react';

interface MileageRecord {
  date: string;
  mileage: number;
  testDate?: string;
}

interface MileageGraphProps {
  motHistory?: any[];
  mileageHistory?: any[];
}

export const MileageGraph: React.FC<MileageGraphProps> = ({ 
  motHistory, 
  mileageHistory 
}) => {
  // Extract mileage data from multiple possible sources
  let mileageRecords: MileageRecord[] = [];
  
  // Try to get from MotTestDetailsList
  if (Array.isArray(motHistory)) {
    motHistory.forEach((item: any) => {
      if (item.MotTestDetailsList && Array.isArray(item.MotTestDetailsList)) {
        item.MotTestDetailsList.forEach((test: any) => {
          if (test.OdometerReading || test.mileage) {
            const mileage = typeof test.OdometerReading === 'number' 
              ? test.OdometerReading 
              : typeof test.OdometerReading === 'string'
              ? parseInt(test.OdometerReading.replace(/[^0-9]/g, ''))
              : typeof test.mileage === 'string'
              ? parseInt(test.mileage.replace(/[^0-9]/g, ''))
              : 0;
            
            if (!isNaN(mileage) && mileage > 0) {
              mileageRecords.push({
                date: test.TestDate || test.date || '',
                mileage: mileage,
                testDate: test.TestDate || test.date
              });
            }
          }
        });
      } else if (item.OdometerReading || item.mileage) {
        const mileage = typeof item.OdometerReading === 'number' 
          ? item.OdometerReading 
          : typeof item.OdometerReading === 'string'
          ? parseInt(item.OdometerReading.replace(/[^0-9]/g, ''))
          : typeof item.mileage === 'string'
          ? parseInt(item.mileage.replace(/[^0-9]/g, ''))
          : 0;
        
        if (!isNaN(mileage) && mileage > 0) {
          mileageRecords.push({
            date: item.TestDate || item.date || '',
            mileage: mileage,
            testDate: item.TestDate || item.date
          });
        }
      }
    });
  }
  
  // Try to get from mileageHistory
  if (Array.isArray(mileageHistory) && mileageRecords.length === 0) {
    mileageHistory.forEach((item: any) => {
      const mileage = typeof item.mileage === 'number' 
        ? item.mileage 
        : typeof item.mileage === 'string'
        ? parseInt(item.mileage.replace(/[^0-9]/g, ''))
        : typeof item.Mileage === 'number'
        ? item.Mileage
        : typeof item.Mileage === 'string'
        ? parseInt(item.Mileage.replace(/[^0-9]/g, ''))
        : 0;
      
      if (!isNaN(mileage) && mileage > 0) {
        mileageRecords.push({
          date: item.date || item.Date || '',
          mileage: mileage
        });
      }
    });
  }
  
  // Sort by date (oldest first)
  mileageRecords.sort((a, b) => {
    const dateA = new Date(a.date || a.testDate || '').getTime();
    const dateB = new Date(b.date || b.testDate || '').getTime();
    return dateA - dateB;
  });
  
  if (mileageRecords.length < 2) {
    return (
      <section className="section" id="mileage-graph">
        <header className="section__header">
          <h2>Mileage History Graph</h2>
        </header>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8fafc', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Mileage graph requires at least 2 mileage records
          </p>
        </div>
      </section>
    );
  }
  
  // Calculate statistics
  const firstRecord = mileageRecords[0];
  const lastRecord = mileageRecords[mileageRecords.length - 1];
  const firstDate = new Date(firstRecord.date || firstRecord.testDate || '');
  const lastDate = new Date(lastRecord.date || lastRecord.testDate || '');
  const yearsDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const totalMileage = lastRecord.mileage - firstRecord.mileage;
  const avgMilesPerYear = yearsDiff > 0 ? Math.round(totalMileage / yearsDiff) : 0;
  
  // Find min and max for chart scaling
  const maxMileage = Math.max(...mileageRecords.map(r => r.mileage));
  const minMileage = Math.min(...mileageRecords.map(r => r.mileage));
  const range = maxMileage - minMileage;
  const chartHeight = 300;
  const chartWidth = '100%';
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
    } catch {
      return '';
    }
  };
  
  return (
    <section className="section" id="mileage-graph">
      <header className="section__header">
        <h2>Mileage History Graph</h2>
      </header>
      
      <div style={{
        padding: '24px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
              First Recorded
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0b5fff' }}>
              {firstRecord.mileage.toLocaleString('en-GB')} miles
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {formatDate(firstRecord.date || firstRecord.testDate || '')}
            </div>
          </div>
          
          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
              Latest Recorded
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0b5fff' }}>
              {lastRecord.mileage.toLocaleString('en-GB')} miles
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {formatDate(lastRecord.date || lastRecord.testDate || '')}
            </div>
          </div>
          
          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
              Total Increase
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0b5fff' }}>
              {totalMileage.toLocaleString('en-GB')} miles
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Over {yearsDiff > 0 ? yearsDiff.toFixed(1) : 'N/A'} years
            </div>
          </div>
          
          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
              Average Per Year
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0b5fff' }}>
              {avgMilesPerYear.toLocaleString('en-GB')} miles/year
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {mileageRecords.length} records
            </div>
          </div>
        </div>
        
        {/* Line Graph Visualization */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#0f172a' 
          }}>
            Mileage Over Time
          </h3>
          
          <div style={{
            position: 'relative',
            width: chartWidth,
            height: `${chartHeight}px`,
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxSizing: 'border-box'
          }}>
            {/* Y-axis labels */}
            <div style={{
              position: 'absolute',
              left: '0',
              top: '20px',
              bottom: '40px',
              width: '50px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              <span>{maxMileage.toLocaleString('en-GB')}</span>
              <span>{Math.round((maxMileage + minMileage) / 2).toLocaleString('en-GB')}</span>
              <span>{minMileage.toLocaleString('en-GB')}</span>
            </div>
            
            {/* Chart area */}
            <svg 
              width="100%" 
              height={`${chartHeight - 60}px`} 
              style={{ 
                marginLeft: '60px', 
                marginTop: '10px',
                overflow: 'visible'
              }}
            >
              {/* Grid lines */}
              {[0, 0.5, 1].map((ratio) => {
                const y = (chartHeight - 60) * ratio;
                return (
                  <line
                    key={ratio}
                    x1="0"
                    y1={y}
                    x2="100%"
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
              
              {/* Line graph */}
              {mileageRecords.length > 1 && mileageRecords.map((record, index) => {
                if (index === 0) return null;
                const prevRecord = mileageRecords[index - 1];
                const x1 = ((index - 1) / (mileageRecords.length - 1)) * 100;
                const y1 = range > 0 ? ((maxMileage - prevRecord.mileage) / range) * 100 : 50;
                const x2 = (index / (mileageRecords.length - 1)) * 100;
                const y2 = range > 0 ? ((maxMileage - record.mileage) / range) * 100 : 50;
                
                return (
                  <line
                    key={`line-${index}`}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="#0b5fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              })}
              
              {/* Data points */}
              {mileageRecords.map((record, index) => {
                const x = (index / (mileageRecords.length - 1)) * 100;
                const y = range > 0 ? ((maxMileage - record.mileage) / range) * 100 : 50;
                const isLatest = index === mileageRecords.length - 1;
                
                return (
                  <g key={`point-${index}`}>
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r={isLatest ? "6" : "4"}
                      fill={isLatest ? "#0b5fff" : "#3b82f6"}
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* X-axis labels */}
            <div style={{
              marginLeft: '60px',
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#64748b',
              fontWeight: '500',
              paddingTop: '8px',
              borderTop: '1px solid #e2e8f0'
            }}>
              {mileageRecords.map((record, index) => {
                if (mileageRecords.length > 10 && index % Math.ceil(mileageRecords.length / 5) !== 0 && index !== mileageRecords.length - 1) {
                  return null;
                }
                return (
                  <span key={index} style={{ transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>
                    {formatDate(record.date || record.testDate || '')}
                  </span>
                );
              })}
            </div>
          </div>
          
          {/* Chart Legend */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '3px', backgroundColor: '#0b5fff', borderRadius: '2px' }}></div>
              <span>Mileage trend line</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#0b5fff', borderRadius: '50%' }}></div>
              <span>Latest reading</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
              <span>Historical readings</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

