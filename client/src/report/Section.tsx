import React from 'react';
import { SchemaNode } from './types';
import { GenericObject } from './GenericObject';

export const Section: React.FC<{
  title: string;
  schema: SchemaNode[];
  data: any;
  id?: string;
}> = ({ title, schema, data, id }) => {
  // Check if we have both schema and data
  const hasSchema = Array.isArray(schema) && schema.length > 0;
  const hasData = data !== null && data !== undefined;
  
  // Check if section has any actual data values
  const hasAnyDataValues = hasSchema && hasData && schema.some((n) => {
    const v = data?.[n.Name];
    return v !== null && v !== undefined && (typeof v !== 'string' || v.trim() !== '');
  });

  return (
    <section className="section" id={id}>
      <header className="section__header">
        <h2>{title}</h2>
      </header>
      <div className="section__body">
        {hasSchema && hasData && hasAnyDataValues ? (
          <GenericObject schema={schema} data={data} />
        ) : (
          <div style={{ padding: '1rem', color: '#6b7280', fontStyle: 'italic' }}>
            {!hasSchema ? 'Schema not available for this section' : 
             !hasData ? 'No data available for this section in the selected package' :
             'No data values found in this section'}
          </div>
        )}
      </div>
    </section>
  );
};