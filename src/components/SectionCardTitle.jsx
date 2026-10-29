import React from 'react';

const ERP_PRIMARY_COLOR = '#145CFF';

export default function SectionCardTitle({ children }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="h-4 w-1 rounded"
        style={{ backgroundColor: ERP_PRIMARY_COLOR }}
      />
      <span>{children}</span>
    </div>
  );
}
