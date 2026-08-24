import { NextSeo } from 'next-seo';
import seoData from '../next-seo.config';

export default function Seo({ page }) {
    const { title, excerpt, slug, coverImage } = page || {};
    const pageTitle = title || seoData.title;
    const pageDesc = seoData.description;
    const pageUrl = seoData.canonical || seoData.openGraph.url;
    const previewImg = coverImage || seoData.openGraph.images[0].url;

    return (
        <NextSeo
            title={pageTitle}
            description={pageDesc}
            canonical={pageUrl}
            openGraph={{
                type: 'website',
                url: pageUrl,
                title: pageTitle,
                description: pageDesc,
                locale: seoData.openGraph.locale || 'id_ID',
                site_name: seoData.openGraph.site_name,
                images: [
                    {
                        width: 1200,
                        height: 630,
                        url: previewImg,
                        alt: pageTitle,
                    },
                ],
            }}
            twitter={{
                handle: seoData.twitter.handle,
                site: seoData.twitter.site,
                cardType: seoData.twitter.cardType || 'summary_large_image',
            }}
            additionalMetaTags={[
                {
                    name: 'keywords',
                    content: seoData.openGraph.keywords,
                },
                {
                    name: 'twitter:image',
                    content: previewImg,
                },
                {
                    httpEquiv: 'x-ua-compatible',
                    content: 'IE=edge; chrome=1',
                },
            ]}
            robotsProps={{
                nosnippet: false,
                notranslate: false,
                noimageindex: false,
                noarchive: false,
                maxSnippet: -1,
                maxImagePreview: 'large',
                maxVideoPreview: -1,
            }}
        />
    );
}