import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParsedUrl } from '../utils/urlParser';
import TemplatedText from './TemplatedText';
import { Variable } from '../types';

interface ParsedFragmentsSectionProps {
  parsedUrl: ParsedUrl;
  variables: Variable[];
}

const ParsedFragmentsSection: React.FC<ParsedFragmentsSectionProps> = ({ parsedUrl, variables }) => {
  const { t } = useTranslation();

  const FragmentPill = ({ label, value, className }: { label: string, value: string, className: string }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase text-gray-500 font-bold">{label}</span>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${className} flex items-center`}>
        <TemplatedText text={value || '—'} variables={variables} />
      </span>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
      <div className="flex flex-wrap gap-6">
        <FragmentPill label={t('scheme')} value={parsedUrl.scheme} className="url-fragment-scheme" />
        <FragmentPill label={t('domain')} value={parsedUrl.domain} className="url-fragment-domain" />
        <FragmentPill label={t('port')} value={parsedUrl.port} className="url-fragment-port" />
        <FragmentPill label={t('path')} value={parsedUrl.path} className="url-fragment-path" />
        <FragmentPill label={t('fragment')} value={parsedUrl.fragment} className="url-fragment-fragment" />
      </div>

      {Object.keys(parsedUrl.query).length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm uppercase text-gray-500 font-bold mb-3">{t('query_parameters')}</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(parsedUrl.query).map(([key, value]) => (
              <div key={key} className="flex items-center gap-1">
                <span className="url-fragment-query px-2 py-1 rounded font-mono text-sm">
                  <TemplatedText text={key} variables={variables} />
                </span>
                <span className="text-gray-400">=</span>
                <span className="url-fragment-query px-2 py-1 rounded font-mono text-sm">
                  <TemplatedText text={value} variables={variables} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParsedFragmentsSection;
