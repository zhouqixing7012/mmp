import React from 'react';

const FormField = ({ label, required = false, children, className = '' }) => {
  const prototypeLabel = typeof label === 'string' ? label.replace(/[:：]\s*$/, '') : undefined;

  return (
    <div
      className={className}
      data-prototype-bindable="form-field"
      data-prototype-label={prototypeLabel}
    >
      <label className="block text-[14px] text-text-primary mb-2">
        {required && <span className="text-danger mr-1">*</span>}
        {label}
      </label>
      {children}
    </div>
  );
};

export default FormField;
