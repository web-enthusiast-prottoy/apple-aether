import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  componentClassName?: string;
  containerSize?: "large" | "medium" | "small";
  paddingSize?: "large" | "medium" | "small";
  id?: string;
}

/**
 * Section component following Finsweet's Client-First methodology hierarchy.
 * Structure: section > padding-global > container > padding-section > custom_component
 */
export const Section: React.FC<SectionProps> = ({
  children,
  className = "",
  componentClassName = "",
  containerSize = "large",
  paddingSize = "large",
  id,
}) => {
  const sectionClass = className || (id ? `section_${id}` : "section_default");
  const componentClass = componentClassName || (id ? `${id}_component` : "component_default");

  return (
    <section className={sectionClass} id={id}>
      <div className="padding-global">
        <div className={`container-${containerSize}`}>
          <div className={`padding-section-${paddingSize}`}>
            <div className={componentClass}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section;
