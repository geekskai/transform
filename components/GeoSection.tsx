import React from "react";

interface GeoSectionProps {
  id?: string;
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export const GeoSection: React.FC<GeoSectionProps> = ({
  id,
  title,
  className = "",
  children
}) => {
  return (
    <section id={id} className={`geo-section ${className}`}>
      {title && <h2 className="geo-section__title">{title}</h2>}
      <div className="geo-section__content">{children}</div>
    </section>
  );
};
