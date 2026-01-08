import { Suspense } from 'react';
import BlogListingClient from './BlogListingClient';

export const metadata = {
  title: '📖 OneDesigner Blog - Design Tips & Insights',
  description: '🎨 Discover the latest design trends, tips, and insights from professional designers. Boost your creative skills with OneDesigner Blog.',
  keywords: 'design blog, UI/UX tips, design trends, creative insights, OneDesigner',
  openGraph: {
    title: '📖 OneDesigner Blog - Design Tips & Insights',
    description: '🎨 Discover the latest design trends, tips, and insights from professional designers.',
    type: 'website',
    url: 'https://onedesigner.app/blog',
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts... 📖</p>
          </div>
        </div>
      }>
        <BlogListingClient />
      </Suspense>
    </div>
  );
}