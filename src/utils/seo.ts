import { useEffect } from 'react';
import { SeoSettings, ProfileSettings } from '../types';

export function updateMetaTag(propertyOrName: string, content: string, isProperty = true) {
  if (!content) return;
  const attribute = isProperty ? 'property' : 'name';
  let element = document.querySelector(`meta[${attribute}="${propertyOrName}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, propertyOrName);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function useSeoSync(seo?: SeoSettings, profile?: ProfileSettings) {
  useEffect(() => {
    const title = seo?.metaTitle || (profile?.name ? `${profile.name} | Future AI Engineer & Python Developer` : '');
    const description = seo?.metaDescription || profile?.bioEn || '';
    const image = seo?.ogImageUrl || '';

    if (title) {
      document.title = title;
      updateMetaTag('og:title', title, true);
      updateMetaTag('twitter:title', title, false);
    }
    if (description) {
      updateMetaTag('description', description, false);
      updateMetaTag('og:description', description, true);
      updateMetaTag('twitter:description', description, false);
    }
    if (image) {
      updateMetaTag('og:image', image, true);
      updateMetaTag('twitter:image', image, false);
    }
  }, [seo, profile]);
}
