import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle = ({ title, subtitle }: PageTitleProps) => {
  return (
    <div className="space-y-1.5">
      <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;