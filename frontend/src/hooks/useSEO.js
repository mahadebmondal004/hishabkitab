import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSEO = ({ title, description, keywords, canonical }) => {
    const location = useLocation();

    useEffect(() => {
        // Update title
        if (title) {
            document.title = `${title} | Hishab Kitab`;
        }

        // Update meta description
        if (description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.name = 'description';
                document.head.appendChild(metaDescription);
            }
            metaDescription.content = description;
        }

        // Update meta keywords
        if (keywords) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.name = 'keywords';
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.content = keywords;
        }

        // Update canonical URL
        const baseUrl = 'https://hishabkitab.com';
        const canonicalUrl = canonical || `${baseUrl}${location.pathname}`;

        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.rel = 'canonical';
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.href = canonicalUrl;

        // Update Open Graph tags
        const updateMetaTag = (property, content) => {
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.content = content;
        };

        if (title) {
            updateMetaTag('og:title', title);
            updateMetaTag('twitter:title', title);
        }

        if (description) {
            updateMetaTag('og:description', description);
            updateMetaTag('twitter:description', description);
        }

        updateMetaTag('og:url', canonicalUrl);
        updateMetaTag('twitter:url', canonicalUrl);

    }, [title, description, keywords, canonical, location]);
};
