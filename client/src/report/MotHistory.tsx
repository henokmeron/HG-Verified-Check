import React from 'react';

interface MOTTest {
  TestDate?: string;
  ExpiryDate?: string;
  TestPassed?: boolean;
  OdometerReading?: string | number;
  OdometerUnit?: string;
  TestNumber?: string;
  TestStation?: string;
  TestStationName?: string;
  TestStationTown?: string;
  AnnotationList?: Array<{
    Type?: string;
    Text?: string;
    Description?: string;
  }>;
  IsRetest?: boolean;
  // Alternative field names
  date?: string;
  expiryDate?: string;
  result?: string;
  mileage?: string;
  testCertificateNumber?: string;
  station?: string;
  stationTown?: string;
  defects?: any[];
  advisories?: any[];
  retest?: boolean;
}

export const MotHistory: React.FC<{ items: any[] | undefined }> = ({ items }) => {
  // Handle different data structures
  let motTests: MOTTest[] = [];
  
  if (Array.isArray(items)) {
    motTests = items;
  } else if (items && typeof items === 'object') {
    // Check if it's the MotHistoryDetails object with MotTestDetailsList
    if (items.MotTestDetailsList && Array.isArray(items.MotTestDetailsList)) {
      motTests = items.MotTestDetailsList;
    } else if (items.MotRecords && Array.isArray(items.MotRecords)) {
      motTests = items.MotRecords;
    } else {
      // If it's a single object, wrap it in an array
      motTests = [items];
    }
  }
  
  if (motTests.length === 0) {
    return (
      <section className="section" id="mot-history">
        <header className="section__header">
          <h2>MOT History</h2>
        </header>
        <div className="mot-history-empty">
          <p>No MOT history available for this vehicle.</p>
        </div>
      </section>
    );
  }

  // Sort by date (newest first)
  const sortedTests = [...motTests].sort((a, b) => {
    const dateA = a.TestDate || a.date || '';
    const dateB = b.TestDate || b.date || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'Not available';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Not available';
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return 'Not available';
    }
  };

  const formatMileage = (reading: string | number | undefined, unit: string | undefined): string => {
    if (!reading && reading !== 0) return 'Not recorded';
    const num = typeof reading === 'string' ? parseInt(reading.replace(/[^0-9]/g, '')) : reading;
    if (isNaN(num)) return 'Not recorded';
    const unitStr = unit || 'miles';
    return `${num.toLocaleString('en-GB')} ${unitStr}`;
  };

  const getTestResult = (test: MOTTest): { text: string; passed: boolean } => {
    // Check multiple possible fields
    if (test.TestPassed !== undefined) {
      return { text: test.TestPassed ? 'PASS' : 'FAIL', passed: test.TestPassed };
    }
    if (test.result) {
      const upper = test.result.toUpperCase();
      return { text: upper, passed: upper === 'PASS' || upper === 'PASSED' };
    }
    return { text: 'UNKNOWN', passed: false };
  };

const getFailures = (test: MOTTest): Array<{ type: string; text: string }> => {
  const failures: Array<{ type: string; text: string }> = [];
    
    // Check AnnotationList for defects (Type === 'D' or 'DEFECT')
    if (Array.isArray(test.AnnotationList)) {
      test.AnnotationList.forEach((annotation: any) => {
        const type = annotation.Type || annotation.type || '';
        const text = annotation.Text || annotation.Description || annotation.text || annotation.description || '';
        if (type === 'D' || type === 'DEFECT' || type === 'Dangerous' || (text && !annotation.Type)) {
          failures.push({ type: 'Defect', text });
        }
      });
    }
    
    // Check defects array
    if (Array.isArray(test.defects)) {
      test.defects.forEach((defect: any) => {
        const text = typeof defect === 'string' ? defect : (defect.text || defect.description || '');
        if (text) failures.push({ type: 'Defect', text });
      });
    }
    
    return failures;
  };

  const getAdvisories = (test: MOTTest): Array<{ type: string; text: string }> => {
    const advisories: Array<{ type: string; text: string }> = [];
    
    // Check AnnotationList for advisories (Type === 'A' or 'ADVISORY')
    if (Array.isArray(test.AnnotationList)) {
      test.AnnotationList.forEach((annotation: any) => {
        const type = annotation.Type || annotation.type || '';
        const text = annotation.Text || annotation.Description || annotation.text || annotation.description || '';
        if (type === 'A' || type === 'ADVISORY' || type === 'Advisory') {
          advisories.push({ type: 'Advisory', text });
        }
      });
    }
    
    // Check advisories array
    if (Array.isArray(test.advisories)) {
      test.advisories.forEach((advisory: any) => {
        const text = typeof advisory === 'string' ? advisory : (advisory.text || advisory.description || '');
        if (text) advisories.push({ type: 'Advisory', text });
      });
    }
    
    return advisories;
  };

  // Calculate MOT pass rate
  const calculatePassRate = (): { passed: number; total: number; percentage: number } => {
    let passed = 0;
    let total = 0;
    
    sortedTests.forEach((test: MOTTest) => {
      const result = getTestResult(test);
      // Only count non-retests for pass rate calculation
      if (!(test.IsRetest || test.retest)) {
        total++;
        if (result.passed) {
          passed++;
        }
      }
    });
    
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { passed, total, percentage };
  };

  const passRate = calculatePassRate();

  return (
    <section className="section" id="mot-history">
      <header className="section__header">
        <h2>MOT History & Mileage Records</h2>
        <p className="section__subtitle" style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
          Complete MOT test history with mileage records and test outcomes
        </p>
      </header>
      
      {/* MOT Pass Rate Summary */}
      {passRate.total > 0 && (
        <div style={{
          marginBottom: '32px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '2px solid #0b5fff',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '20px',
                fontWeight: '800',
                color: '#000000'
              }}>
                MOT Pass Rate
              </h3>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#1a1a1a',
                fontWeight: '600'
              }}>
                Based on {passRate.total} test{passRate.total !== 1 ? 's' : ''} (excluding retests)
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '16px 24px',
                backgroundColor: passRate.percentage >= 80 ? '#10b981' : passRate.percentage >= 60 ? '#f59e0b' : '#ef4444',
                borderRadius: '8px',
                minWidth: '120px'
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '900',
                  color: 'white',
                  lineHeight: '1',
                  marginBottom: '4px'
                }}>
                  {passRate.percentage}%
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white',
                  opacity: 0.95
                }}>
                  PASS RATE
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a1a1a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981'
                  }}></span>
                  <span>Passed: {passRate.passed}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444'
                  }}></span>
                  <span>Failed: {passRate.total - passRate.passed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mot-history-container">
        {sortedTests.map((test: MOTTest, index: number) => {
          const testResult = getTestResult(test);
          const testDate = formatDate(test.TestDate || test.date);
          const expiryDate = formatDate(test.ExpiryDate || test.expiryDate);
          const mileage = formatMileage(
            test.OdometerReading || test.mileage,
            test.OdometerUnit
          );
          const testNumber = test.TestNumber || test.testCertificateNumber || 'Not available';
          const station = test.TestStation || test.TestStationName || test.station || 'Not available';
          const stationTown = test.TestStationTown || test.stationTown || '';
          const isRetest = test.IsRetest || test.retest || false;
          const failures = getFailures(test);
          const advisories = getAdvisories(test);
          const cardTitle = `Test ${index + 1} – ${testDate}`;
          
          return (
            <div 
              key={index} 
              className={`mot-test-card ${testResult.passed ? 'mot-test-pass' : 'mot-test-fail'}`}
              style={{
                marginBottom: '24px',
                padding: '20px',
                borderRadius: '8px',
                border: `2px solid ${testResult.passed ? '#10b981' : '#ef4444'}`,
                backgroundColor: testResult.passed ? '#ecfdf5' : '#fef2f2',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              {/* Test Result Header */}
              <div className="flex flex-col gap-2 mb-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{cardTitle}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontWeight: 700,
                        fontSize: '13px',
                        color: 'white',
                        backgroundColor: testResult.passed ? '#0f9d58' : '#d93025'
                      }}
                    >
                      {testResult.text}
                    </span>
                    {isRetest && (
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: '#f59e0b',
                          color: 'white'
                        }}
                      >
                        Retest
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>{testDate}</div>
              </div>

              {/* Test Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                    Mileage at Test
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0b5fff' }}>
                    {mileage}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                    Expiry Date
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                    {expiryDate}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                    Test Certificate Number
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', fontFamily: 'monospace' }}>
                    {testNumber}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                    Test Centre
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                    {station}
                    {stationTown && <span style={{ color: '#64748b', marginLeft: '4px' }}>({stationTown})</span>}
                  </div>
                </div>
              </div>

              {/* Failures */}
              {failures.length > 0 && (
                <div style={{ marginTop: '16px', marginBottom: '12px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: '#ef4444', 
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>⚠️</span>
                    <span>Failures ({failures.length})</span>
                  </div>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '20px',
                    listStyle: 'disc'
                  }}>
                    {failures.map((defect, idx) => (
                      <li key={idx} style={{ 
                        marginBottom: '6px', 
                        color: '#dc2626',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {defect.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advisories */}
              {advisories.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: '#f59e0b', 
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>ℹ️</span>
                    <span>Advisories ({advisories.length})</span>
                  </div>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '20px',
                    listStyle: 'disc'
                  }}>
                    {advisories.map((advisory, idx) => (
                      <li key={idx} style={{ 
                        marginBottom: '6px', 
                        color: '#92400e',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {advisory.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* No defects or advisories message */}
              {failures.length === 0 && advisories.length === 0 && testResult.passed && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  backgroundColor: '#d1fae5', 
                  borderRadius: '6px',
                  color: '#065f46',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  ✅ No defects or advisories recorded
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mileage Summary */}
      {sortedTests.length > 0 && (
        <div style={{ 
          marginTop: '32px', 
          padding: '20px', 
          backgroundColor: '#f8fafc', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#0f172a' 
          }}>
            Mileage History Summary
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            {sortedTests
              .filter(test => (test.OdometerReading || test.mileage))
              .map((test, idx) => {
                const mileage = formatMileage(
                  test.OdometerReading || test.mileage,
                  test.OdometerUnit
                );
                const testDate = formatDate(test.TestDate || test.date);
                const prevTest = idx < sortedTests.length - 1 ? sortedTests[idx + 1] : null;
                const prevMileage = prevTest ? formatMileage(
                  prevTest.OdometerReading || prevTest.mileage,
                  prevTest.OdometerUnit
                ) : null;
                
                let mileageChange = 'First record';
                if (prevMileage && mileage !== 'Not recorded' && prevMileage !== 'Not recorded') {
                  const current = parseInt(mileage.replace(/[^0-9]/g, ''));
                  const previous = parseInt(prevMileage.replace(/[^0-9]/g, ''));
                  if (!isNaN(current) && !isNaN(previous)) {
                    const change = current - previous;
                    mileageChange = change >= 0 ? `+${change.toLocaleString('en-GB')} miles` : `${change.toLocaleString('en-GB')} miles`;
                  }
                }
                
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{testDate}</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0b5fff' }}>{mileage}</div>
                    {mileageChange !== 'First record' && (
                      <span
                        style={{
                          alignSelf: 'flex-start',
                          padding: '2px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1'
                        }}
                      >
                        {mileageChange}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </section>
  );
};
