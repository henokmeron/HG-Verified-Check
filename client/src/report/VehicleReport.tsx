import React from 'react';
import { VehicleReportProps } from './types';
import { SectionGate } from './Visibility';
import { Section } from './Section';
import { MotHistory } from './MotHistory';
import { RiskSummary } from './RiskSummary';
import { MileageGraph } from './MileageGraph';
import { FuelEfficiencyChart } from './FuelEfficiencyChart';

export const VehicleReport: React.FC<VehicleReportProps & { vehicleData?: any }> = ({
  schema, payload, mode, hideStrategy, packageDocs, brand, dateOfCheck, reference, registration, vehicleData
}) => {
  const R = schema.Results || (schema as any).results || {};
  const P = payload?.Results || payload?.results || payload || {};
  
  // Generate date of check and reference if not provided
  const checkDate = dateOfCheck || new Date();
  const formattedDate = typeof checkDate === 'string' 
    ? checkDate 
    : new Date(checkDate).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', '');
  
  const reportReference = reference || (payload as any)?.reference || (payload as any)?.Reference || 'N/A';

  // Map schema keys → human titles (and doc names used by packageDocs)
  // Only top-level sections in schema.Results
  const DOC_TITLES: Record<string,string> = {
    VehicleDetails: 'Vehicle Details',         // Includes nested: VehicleHistory, DvlaTechnicalDetails
    ModelDetails: 'Model Details',             // Includes nested: ModelIdentification, Classification, etc.
    VehicleTaxDetails: 'Vehicle Tax Details',
    PncDetails: 'PNC Details',
    MiaftrDetails: 'MIAFTR Details',
    FinanceDetails: 'Finance Details',
    ValuationDetails: 'Valuation Details',
    SpecAndOptionsDetails: 'Spec & Options Details',
    BatteryDetails: 'Battery Details',
    TyreDetails: 'Tyre Details',
    VehicleImageDetails: 'Vehicle Images',
    MileageCheckDetails: 'Mileage Check Details',
    MotHistoryDetails: 'Mot History Details',
  };

  // Only include TOP-LEVEL sections that exist in schema.Results
  // VehicleHistory and DvlaTechnicalDetails are NESTED inside VehicleDetails, not separate sections
  // EXCLUDE RequestInformation and ResponseInformation - these contain Package, Response ID, Status Code, etc.
  const EXCLUDED_SECTIONS = ['RequestInformation', 'ResponseInformation'];
  const ORDER = [
    'VehicleDetails',      // Contains: VehicleIdentification, VehicleStatus, VehicleHistory, DvlaTechnicalDetails
    'ModelDetails',        // Contains: ModelIdentification, ModelClassification, AdditionalInformation, etc.
    'VehicleTaxDetails',
    'PncDetails',
    'MiaftrDetails',
    'FinanceDetails',
    'ValuationDetails',
    'SpecAndOptionsDetails',
    'BatteryDetails',
    'TyreDetails',
    'VehicleImageDetails',
    'MileageCheckDetails',
  ].filter(section => !EXCLUDED_SECTIONS.includes(section));

  // ALWAYS show all sections defined in ORDER, even if no data exists
  // The SectionGate will handle hiding sections not included in the package
  const blocks = ORDER
    .map((k) => ({
      title: DOC_TITLES[k] || k,
      docKey: DOC_TITLES[k] || k,
      schema: R?.[k],
      data: P?.[k], // Will be undefined if no data, component will handle it
      id: k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
    }));

  // Use brand primary color or default professional blue
  const headerColor = brand?.primary || '#0b5fff';
  
  return (
    <div className="report" style={{ marginTop: 0, paddingTop: 0 }}>
      {/* Spacer for PDF pages 2+ to account for headerTemplate */}
      <div className="pdf-header-spacer" style={{ display: 'none' }}></div>
      
      {/* Professional Colored Header Bar - Netflix Style */}
      <div className="report__header-bar" style={{
        background: `linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%)`,
        padding: '16px 24px',
        margin: '0 -16px 24px -16px',
        borderRadius: '0',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        minHeight: '140px',
        maxHeight: '160px',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
          {brand?.logoUrl && (
            <img 
              src={brand.logoUrl} 
              alt={brand?.name || 'Brand'} 
              className="brand" 
              style={{ 
                width: '80px', 
                height: '80px', 
                objectFit: 'contain',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '8px',
                borderRadius: '8px',
                flexShrink: 0
              }} 
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '36px', 
              fontWeight: '800', 
              color: 'white',
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <span>Vehicle Check Report</span>
              <span style={{ 
                fontSize: '36px', 
                fontWeight: '800',
                color: 'white',
                opacity: 0.95
              }}>
                {brand?.name || 'HG Verified Vehicle Check'}
              </span>
            </h1>
          </div>
          {/* Page number for PDF page 1 - shown in top right */}
          <div className="pdf-page-number" style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.9)',
            marginLeft: 'auto',
            paddingLeft: '20px',
            position: 'absolute',
            top: '16px',
            right: '24px'
          }}>
            <span>1</span>
          </div>
        </div>
        
        {/* Registration Number - Large and Bold */}
        {registration && (
          <div className="report__registration" style={{ 
            marginBottom: '8px',
            paddingBottom: '8px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                fontWeight: 700, 
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.9)' 
              }}>Registration:</span>
              <span className="report__registration-number" style={{ 
                fontWeight: 900, 
                fontSize: '28px',
                color: 'white',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'Arial, sans-serif',
                lineHeight: '1.3'
              }}>{registration}</span>
            </div>
          </div>
        )}
        
        {/* Date Of Check and Reference - White text on colored background */}
        <div className="report__meta" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          paddingTop: '16px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.95)',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>Date Of Check:</span>
            <span style={{ fontWeight: 800, color: 'white' }}>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>Reference:</span>
            <span style={{ fontWeight: 800, color: 'white', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{reportReference}</span>
          </div>
        </div>
      </div>
      
      <header className="report__header" style={{ display: 'none' }}>
        {/* Old header hidden - using colored header bar above instead */}
      </header>

      <RiskSummary payload={payload} />

      {blocks.map((b) => {
        // Check if section has actual data - if it does, always show it
        const hasData = b.data !== null && b.data !== undefined && 
                       (typeof b.data !== 'object' || Object.keys(b.data).length > 0);
        
        // Always show sections that have data, regardless of package type
        const shouldShow = mode === 'full' || 
                          !!packageDocs[b.docKey || b.title] || 
                          hasData;
        
        return (
          <SectionGate
            key={b.id}
            docName={b.docKey || b.title}
            included={shouldShow}
            strategy={hideStrategy}
          >
            <Section id={b.id} title={b.title} schema={b.schema || []} data={b.data} />
          </SectionGate>
        );
      })}

      {/* MOT history - ALWAYS SHOW (critical information for all customers) */}
      {/* Extract MOT data from different possible locations in the response */}
      {(() => {
        // Try multiple possible locations for MOT data
        const motData = P?.MotHistoryDetails || 
                       P?.MotHistory || 
                       (P?.Results && (P.Results.MotHistoryDetails || P.Results.MotHistory)) ||
                       payload?.MotHistoryDetails ||
                       payload?.MotHistory ||
                       (payload?.Results && (payload.Results.MotHistoryDetails || payload.Results.MotHistory));
        
        // Always show MOT history if data exists, regardless of package type
        if (motData) {
          return <MotHistory items={motData} />;
        }
        return null;
      })()}

      {/* Mileage Graph - ALWAYS SHOW if MOT data exists */}
      {(() => {
        const motData = P?.MotHistoryDetails || 
                       P?.MotHistory || 
                       (P?.Results && (P.Results.MotHistoryDetails || P.Results.MotHistory)) ||
                       payload?.MotHistoryDetails ||
                       payload?.MotHistory ||
                       (payload?.Results && (payload.Results.MotHistoryDetails || payload.Results.MotHistory));
        
        const mileageData = P?.MileageCheckDetails ||
                           (P?.Results && P.Results.MileageCheckDetails) ||
                           payload?.MileageCheckDetails ||
                           (payload?.Results && payload.Results.MileageCheckDetails);
        
        if (motData || mileageData) {
          return <MileageGraph motHistory={motData ? [motData] : undefined} mileageHistory={mileageData?.MileageHistoryList || mileageData} />;
        }
        return null;
      })()}

      {/* Fuel Efficiency Chart - ALWAYS SHOW if fuel economy data exists */}
      {(() => {
        // Check if we have fuel economy data
        const hasFuelData = P?.ModelDetails?.Performance?.FuelEconomy ||
                           (P?.Results && P.Results.ModelDetails?.Performance?.FuelEconomy) ||
                           payload?.ModelDetails?.Performance?.FuelEconomy ||
                           (payload?.Results && payload.Results.ModelDetails?.Performance?.FuelEconomy) ||
                           vehicleData?.fuelEconomyCombined ||
                           payload?.vehicleData?.fuelEconomyCombined;
        
        if (hasFuelData) {
          return <FuelEfficiencyChart vehicleData={vehicleData || payload?.vehicleData} reportRaw={payload} />;
        }
        return null;
      })()}

      <footer className="report__footer">
        <div className="muted">
          Generated {new Date().toLocaleString()} • © {brand?.name || 'Your Company'}
        </div>
      </footer>
    </div>
  );
};