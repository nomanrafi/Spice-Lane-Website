import { MENU } from '@/data/menu';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// Restaurant + Menu structured data for search engines (prompt Step 9 SEO).
export default function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: SITE_NAME,
    url: SITE_URL,
    servesCuisine: ['Japanese', 'Modern European'],
    priceRange: '$$',
    acceptsReservations: true,
    hasMenu: {
      '@type': 'Menu',
      name: `${SITE_NAME} tasting belt`,
      hasMenuSection: {
        '@type': 'MenuSection',
        name: 'Belt plates',
        hasMenuItem: MENU.map((m) => ({
          '@type': 'MenuItem',
          name: m.name,
          description: m.description,
          offers: { '@type': 'Offer', price: m.price.toFixed(2), priceCurrency: 'USD' },
        })),
      },
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
