import React from 'react';

export function PetalField({ placement }) {
  return (
    <div className={`petal-field petal-field-${placement}`} aria-hidden="true">
      <i className="petal petal-one"></i>
      <i className="petal petal-two"></i>
      <i className="petal petal-three"></i>
      <i className="petal petal-four"></i>
      <i className="petal petal-five"></i>
      <i className="butterfly butterfly-one"></i>
      <i className="butterfly butterfly-two"></i>
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
