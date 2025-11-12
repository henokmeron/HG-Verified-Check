import React from 'react';

interface FuelEfficiencyChartProps {
  vehicleData?: any;
  reportRaw?: any;
}

export const FuelEfficiencyChart: React.FC<FuelEfficiencyChartProps> = ({ 
  vehicleData,
  reportRaw 
}) => {
  // Extract fuel efficiency data from multiple possible locations
  let combinedMpg: number | null = null;
  let urbanMpg: number | null = null;
  let extraUrbanMpg: number | null = null;
  let combinedLPer100Km: number | null = null;
  let urbanLPer100Km: number | null = null;
  let extraUrbanLPer100Km: number | null = null;
  let co2Emissions: number | null = null;
  let fuelType: string = 'Unknown';
  
  // Try to get from ModelDetails.Performance.FuelEconomy
  const fuelEconomy = reportRaw?.Results?.ModelDetails?.Performance?.FuelEconomy;
  if (fuelEconomy) {
    if (fuelEconomy.CombinedMpg) {
      combinedMpg = typeof fuelEconomy.CombinedMpg === 'number' 
        ? fuelEconomy.CombinedMpg 
        : parseFloat(fuelEconomy.CombinedMpg);
    }
    if (fuelEconomy.UrbanMpg) {
      urbanMpg = typeof fuelEconomy.UrbanMpg === 'number' 
        ? fuelEconomy.UrbanMpg 
        : parseFloat(fuelEconomy.UrbanMpg);
    }
    if (fuelEconomy.ExtraUrbanMpg) {
      extraUrbanMpg = typeof fuelEconomy.ExtraUrbanMpg === 'number' 
        ? fuelEconomy.ExtraUrbanMpg 
        : parseFloat(fuelEconomy.ExtraUrbanMpg);
    }
    if (fuelEconomy.CombinedLPer100Km) {
      combinedLPer100Km = typeof fuelEconomy.CombinedLPer100Km === 'number' 
        ? fuelEconomy.CombinedLPer100Km 
        : parseFloat(fuelEconomy.CombinedLPer100Km);
    }
    if (fuelEconomy.UrbanLPer100Km) {
      urbanLPer100Km = typeof fuelEconomy.UrbanLPer100Km === 'number' 
        ? fuelEconomy.UrbanLPer100Km 
        : parseFloat(fuelEconomy.UrbanLPer100Km);
    }
    if (fuelEconomy.ExtraUrbanLPer100Km) {
      extraUrbanLPer100Km = typeof fuelEconomy.ExtraUrbanLPer100Km === 'number' 
        ? fuelEconomy.ExtraUrbanLPer100Km 
        : parseFloat(fuelEconomy.ExtraUrbanLPer100Km);
    }
  }
  
  // Try to get from vehicleData
  if (!combinedMpg && vehicleData?.fuelEconomyCombined) {
    const mpgStr = vehicleData.fuelEconomyCombined.toString().replace(/[^0-9.]/g, '');
    combinedMpg = parseFloat(mpgStr);
  }
  
  // Get CO2 emissions
  const co2Str = reportRaw?.Results?.VehicleDetails?.VehicleStatus?.VehicleExciseDutyDetails?.DvlaCo2 ||
                reportRaw?.Results?.ModelDetails?.Emissions?.Co2EmissionsGpKm ||
                vehicleData?.co2Emissions?.toString().replace(/[^0-9]/g, '');
  if (co2Str) {
    co2Emissions = typeof co2Str === 'number' ? co2Str : parseFloat(co2Str);
  }
  
  // Get fuel type
  fuelType = reportRaw?.Results?.VehicleDetails?.VehicleIdentification?.DvlaFuelType ||
            vehicleData?.fuelType ||
            'Unknown';
  
  // If no MPG data, try to calculate from L/100km if available
  if (!combinedMpg && combinedLPer100Km) {
    combinedMpg = 282.481 / combinedLPer100Km; // Convert L/100km to MPG
  }
  if (!urbanMpg && urbanLPer100Km) {
    urbanMpg = 282.481 / urbanLPer100Km;
  }
  if (!extraUrbanMpg && extraUrbanLPer100Km) {
    extraUrbanMpg = 282.481 / extraUrbanLPer100Km;
  }
  
  // If we have MPG but not L/100km, calculate it
  if (combinedMpg && !combinedLPer100Km) {
    combinedLPer100Km = 282.481 / combinedMpg;
  }
  if (urbanMpg && !urbanLPer100Km) {
    urbanLPer100Km = 282.481 / urbanMpg;
  }
  if (extraUrbanMpg && !extraUrbanLPer100Km) {
    extraUrbanLPer100Km = 282.481 / extraUrbanMpg;
  }
  
  // Check if we have any fuel efficiency data
  const hasData = combinedMpg !== null || urbanMpg !== null || extraUrbanMpg !== null;
  
  if (!hasData) {
    return (
      <section className="section" id="fuel-efficiency-chart">
        <header className="section__header">
          <h2>Fuel Efficiency</h2>
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
            Fuel efficiency data not available for this vehicle
          </p>
        </div>
      </section>
    );
  }
  
  // Calculate efficiency rating (0-100)
  // Higher MPG = higher efficiency (better)
  let efficiencyRating = 50;
  if (combinedMpg) {
    if (combinedMpg >= 60) efficiencyRating = 95; // Excellent (hybrid/electric equivalent)
    else if (combinedMpg >= 50) efficiencyRating = 85; // Very Good
    else if (combinedMpg >= 40) efficiencyRating = 75; // Good
    else if (combinedMpg >= 30) efficiencyRating = 65; // Average
    else if (combinedMpg >= 20) efficiencyRating = 50; // Below Average
    else efficiencyRating = 35; // Poor
  }
  
  // Determine efficiency category
  let efficiencyCategory = 'Average';
  let efficiencyColor = '#f59e0b';
  if (efficiencyRating >= 85) {
    efficiencyCategory = 'Excellent';
    efficiencyColor = '#10b981';
  } else if (efficiencyRating >= 75) {
    efficiencyCategory = 'Very Good';
    efficiencyColor = '#22c55e';
  } else if (efficiencyRating >= 65) {
    efficiencyCategory = 'Good';
    efficiencyColor = '#84cc16';
  } else if (efficiencyRating >= 50) {
    efficiencyCategory = 'Average';
    efficiencyColor = '#f59e0b';
  } else {
    efficiencyCategory = 'Below Average';
    efficiencyColor = '#ef4444';
  }
  
  // Create bar chart data
  const chartData = [];
  if (urbanMpg) chartData.push({ label: 'Urban', mpg: urbanMpg, color: '#3b82f6' });
  if (combinedMpg) chartData.push({ label: 'Combined', mpg: combinedMpg, color: '#0b5fff' });
  if (extraUrbanMpg) chartData.push({ label: 'Extra Urban', mpg: extraUrbanMpg, color: '#2563eb' });
  
  const maxMpg = Math.max(...chartData.map(d => d.mpg));
  const chartHeight = 200;
  
  return (
    <section className="section" id="fuel-efficiency-chart">
      <header className="section__header">
        <h2>Fuel Efficiency</h2>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
              Combined MPG
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0b5fff' }}>
              {combinedMpg ? `${combinedMpg.toFixed(1)} mpg` : 'N/A'}
            </div>
            {combinedLPer100Km && (
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {combinedLPer100Km.toFixed(1)} L/100km
              </div>
            )}
          </div>
          
          {urbanMpg && (
            <div style={{
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                Urban MPG
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                {urbanMpg.toFixed(1)} mpg
              </div>
              {urbanLPer100Km && (
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {urbanLPer100Km.toFixed(1)} L/100km
                </div>
              )}
            </div>
          )}
          
          {extraUrbanMpg && (
            <div style={{
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                Extra Urban MPG
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                {extraUrbanMpg.toFixed(1)} mpg
              </div>
              {extraUrbanLPer100Km && (
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {extraUrbanLPer100Km.toFixed(1)} L/100km
                </div>
              )}
            </div>
          )}
          
          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
              Efficiency Rating
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: efficiencyColor }}>
              {efficiencyRating}%
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {efficiencyCategory}
            </div>
          </div>
          
          {co2Emissions && (
            <div style={{
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                CO₂ Emissions
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0b5fff' }}>
                {co2Emissions.toFixed(0)} g/km
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Fuel: {fuelType}
              </div>
            </div>
          )}
        </div>
        
        {/* Bar Chart */}
        {chartData.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#0f172a' 
            }}>
              Fuel Economy Comparison
            </h3>
            
            <div style={{
              position: 'relative',
              width: '100%',
              height: `${chartHeight}px`,
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              boxSizing: 'border-box'
            }}>
              {/* Y-axis */}
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
                <span>{Math.ceil(maxMpg)}</span>
                <span>{Math.ceil(maxMpg / 2)}</span>
                <span>0</span>
              </div>
              
              {/* Bars */}
              <div style={{
                marginLeft: '60px',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                height: `${chartHeight - 60}px`,
                gap: '20px'
              }}>
                {chartData.map((data, index) => {
                  const barHeight = (data.mpg / maxMpg) * 100;
                  return (
                    <div key={index} style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end'
                    }}>
                      <div style={{
                        width: '100%',
                        height: `${barHeight}%`,
                        backgroundColor: data.color,
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        minHeight: '20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingTop: '8px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '700'
                      }}>
                        {barHeight > 15 && (
                          <span>{data.mpg.toFixed(1)}</span>
                        )}
                      </div>
                      {barHeight <= 15 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          marginBottom: '4px',
                          color: data.color,
                          fontSize: '14px',
                          fontWeight: '700'
                        }}>
                          {data.mpg.toFixed(1)}
                        </div>
                      )}
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}>
                        {data.label}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        marginTop: '2px'
                      }}>
                        {data.mpg.toFixed(1)} mpg
                      </div>
                    </div>
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
              color: '#64748b'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px', color: '#0f172a' }}>Fuel Efficiency Information:</div>
              <div>• Combined MPG: Average fuel economy across all driving conditions</div>
              {urbanMpg && <div>• Urban MPG: Fuel economy in city/urban driving conditions</div>}
              {extraUrbanMpg && <div>• Extra Urban MPG: Fuel economy on motorways and open roads</div>}
              <div>• Efficiency Rating: 85%+ (Excellent), 75-84% (Very Good), 65-74% (Good), 50-64% (Average), &lt;50% (Below Average)</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

