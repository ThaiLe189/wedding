import React from 'react';

/* Fixed illustrated layer (cranes and clouds) that sits underneath every section. */
export function SiteBackdrop() {
  return <div className="site-backdrop" aria-hidden="true"></div>;
}

export function RsvpBloom() {
  return (
    <span className="rsvp-bloom" aria-hidden="true">
      <i></i><i></i><i></i><i></i><i></i><i></i>
    </span>
  );
}
