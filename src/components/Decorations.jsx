import React from 'react';

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
