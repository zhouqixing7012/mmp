import React from 'react';

const FormField = ({ label, required = false, children, className = '' }) => (
  <div className={className}>
    <label className="block text-[14px] text-text-primary mb-2">
      {required && <span className="text-danger mr-1">*</span>}
      {label}
    </label>
    {children}
  </div>
);

export default FormField;
