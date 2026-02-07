import React from "react";

export interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQProps {
  items: FAQItem[];
}

export const FAQ: React.FC<FAQProps> = ({ items }) => {
  // Generate JSON-LD for FAQPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text:
          typeof item.answer === "string"
            ? item.answer
            : "Check the page for details." // Simplified for string answers
      }
    }))
  };

  return (
    <div className="geo-faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {items.map((item, index) => (
        <details key={index} className="geo-faq__item" open={index === 0}>
          <summary className="geo-faq__question">
            {item.question}
            <span className="geo-faq__icon">▼</span>
          </summary>
          <div className="geo-faq__answer">{item.answer}</div>
        </details>
      ))}
    </div>
  );
};
