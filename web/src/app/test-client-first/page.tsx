import React from "react";
import Section from "@/components/layout/Section";

export default function TestClientFirstPage() {
  return (
    <main>
      {/* Hero Section */}
      <Section id="hero" containerSize="large" paddingSize="large">
        <div className="margin-bottom margin-small">
          <h1 className="heading-style-h1">Client-First Hero</h1>
        </div>
        <p className="text-size-medium">
          This section follows the strict Client-First nesting hierarchy: 
          <code>section_hero &gt; padding-global &gt; container-large &gt; padding-section-large &gt; hero_component</code>.
        </p>
      </Section>

      {/* Feature Section */}
      <Section id="features" containerSize="medium" paddingSize="medium">
        <div className="margin-bottom margin-medium">
          <h2 className="heading-style-h2">Methodology Features</h2>
        </div>
        <div className="features_list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="features_item">
            <h3 className="heading-style-h3">Nesting</h3>
            <p className="text-size-small">Predictable structure for every section.</p>
          </div>
          <div className="features_item">
            <h3 className="heading-style-h3">Utilities</h3>
            <p className="text-size-small">Global classes for padding and spacing.</p>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section id="cta" containerSize="small" paddingSize="small" className="bg-neutral-900 text-white">
        <div className="text-align-center">
          <div className="margin-bottom margin-xsmall">
            <h2 className="heading-style-h2">Ready to Build?</h2>
          </div>
          <p className="text-size-large">Start using the Client-First framework today.</p>
        </div>
      </Section>
    </main>
  );
}
