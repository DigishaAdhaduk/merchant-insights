import React from 'react';

function KpiCard({ label, value, prefix }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {prefix}
        {value}
      </div>
    </div>
  );
}

export default KpiCard;
