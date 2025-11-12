import React from 'react';
import { SchemaNode } from './types';
import { KeyValue } from './KeyValue';
import { isFieldHidden } from './constants';

export const GenericObject: React.FC<{
  schema: SchemaNode[];
  data: any;
}> = ({ schema, data }) => {
  if (!schema || !data) return null;

  return (
    <div className="obj-grid">
      {schema.map((node) => {
        // Skip hidden fields (single source of truth)
        if (isFieldHidden(node.Name)) {
          return null;
        }
        
        const label = node.Label || node.Name;
        const value = data?.[node.Name];

        // nested object
        if (node.Type === 'Object' && node.ObjectProperties && !node.IsList) {
          // Skip entire RequestInformation and ResponseInformation sections
          if (node.Name === 'RequestInformation' || node.Name === 'ResponseInformation') {
            return null;
          }
          return (
            <div key={node.Name} className="obj-nested">
              <div className="obj-nested__title">{label}</div>
              <GenericObject schema={node.ObjectProperties} data={value} />
            </div>
          );
        }

        // list of objects
        if (node.Type === 'Object' && node.IsList) {
          const list = Array.isArray(value) ? value : [];
          return (
            <div key={node.Name} className="obj-list">
              <div className="obj-list__title">{label}</div>
              {list.length === 0 ? (
                <div className="muted">—</div>
              ) : (
                list.map((item, idx) => (
                  <div key={idx} className="obj-list__item">
                    <GenericObject schema={node.ObjectProperties || []} data={item} />
                  </div>
                ))
              )}
            </div>
          );
        }

        // primitive
        return <KeyValue key={node.Name} label={label} value={value} type={node.Type} />;
      })}
    </div>
  );
};