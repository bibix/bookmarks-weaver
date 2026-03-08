import React from 'react';
import { Variable } from '../types';

interface TemplatedTextProps {
  text: string;
  variables: Variable[];
  className?: string;
}

const TemplatedText: React.FC<TemplatedTextProps> = ({ text, variables, className }) => {
  let parts: (string | React.ReactNode)[] = [text];
  
  variables.forEach(v => {
    const placeholder = `{{${v.id}}}`;
    const newParts: (string | React.ReactNode)[] = [];
    
    parts.forEach(part => {
      if (typeof part === 'string') {
        const segments = part.split(placeholder);
        segments.forEach((seg, i) => {
          if (seg) newParts.push(seg);
          if (i < segments.length - 1) {
            newParts.push(
              <span 
                key={`${v.id}-${i}`} 
                className="bg-teal-600 text-white px-1.5 rounded mx-0.5 text-xs font-bold inline-block shadow-sm"
              >
                {v.name}
              </span>
            );
          }
        });
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });

  return <span className={className}>{parts}</span>;
};

export default TemplatedText;
