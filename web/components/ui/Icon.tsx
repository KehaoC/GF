import React from 'react';
import * as Lucide from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof Lucide;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className, ...props }) => {
  const IconComponent = Lucide[name] as React.FC<any>;
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} {...props} />;
};
