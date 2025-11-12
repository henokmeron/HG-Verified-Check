import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export default function SEOHead({
  title = "HG Verified Vehicle Check - Professional UK Vehicle Data Services",
  description = "Get instant access to comprehensive Vehicle Data UK. Free vehicle registration checks with MOT, tax, and history information. Trusted by dealers and buyers nationwide.",
  keywords = "vehicle check, Vehicle Data UK, MOT status, car history, vehicle registration, UK vehicle lookup, car tax check",
  ogTitle,
  ogDescription,
  ogImage = "/og-image.jpg"
}: SEOHeadProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('author', 'HG Verified Vehicle Check');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph tags
    updateMetaTag('og:title', ogTitle || title, true);
    updateMetaTag('og:description', ogDescription || description, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', window.location.href, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:site_name', 'HG Verified Vehicle Check', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', ogTitle || title);
    updateMetaTag('twitter:description', ogDescription || description);
    updateMetaTag('twitter:image', ogImage);

    // Additional SEO tags
    updateMetaTag('application-name', 'VehicleCheck Pro');
    updateMetaTag('theme-color', '#2563eb');
    updateMetaTag('msapplication-TileColor', '#2563eb');
  }, [title, description, keywords, ogTitle, ogDescription, ogImage]);

  return null;
}