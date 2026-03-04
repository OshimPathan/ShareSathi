import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const SITE = 'ShareSathi';
const DEFAULT_DESC =
  'Practice stock trading risk-free with real NEPSE data. Paper trading, portfolio analytics, live market data, and AI insights for Nepalese investors.';
const BASE_URL = 'https://sharesathi.com';
const DEFAULT_OG = `${BASE_URL}/logo.png`;

export default function SEO({
  title,
  description = DEFAULT_DESC,
  canonical,
  ogImage = DEFAULT_OG,
  noIndex = false,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE}`;
  const url = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {url && <meta property="og:url" content={url} />}

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
