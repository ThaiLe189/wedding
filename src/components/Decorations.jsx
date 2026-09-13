import React from 'react';

/* Fixed illustrated layer (cranes and clouds) that sits underneath every section. */
export function SiteBackdrop() {
  return <div className="site-backdrop" aria-hidden="true"></div>;
}

export function CraneField({ placement }) {
  return (
    <div className={`crane-field crane-field-${placement}`} aria-hidden="true">
      <i className="crane crane-one"><b></b></i>
      <i className="crane crane-two"><b></b></i>
      <i className="crane crane-three"><b></b></i>
      <i className="crane crane-four"><b></b></i>
    </div>
  );
}

export function RsvpBloom() {
  return (
    <span className="rsvp-bloom" aria-hidden="true">
      <i></i><i></i><i></i><i></i><i></i><i></i>
    </span>
  );
}
