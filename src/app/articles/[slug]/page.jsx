'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Calendar, Share2, Eye } from 'lucide-react';
import { Breadcrumb } from '../../../components/Breadcrumb';
import Link from 'next/link';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchArticle();
    }
  }, [params.slug]);

  async function fetchArticle() {
    try {
      const res = await fetch(`/api/articles/${params.slug}`);
      const data = await res.json();
      
      if (res.ok) {
        setArticle(data.article);
      } else {
        router.push('/404');
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
      router.push('/404');
    } finally {
      setLoading(false);
    }
  }

  const getCategoryInfo = (category) => {
    const categories = {
      FOOD_FOR_THOUGHT: { name: 'Food for Thought', color: 'blue', link: '/food-for-thought' },
      INVESTING_INSIGHT: { name: 'Investing Insight', color: 'purple', link: '/investing-insight' },
      SCIENCE_DESK: { name: 'Science Desk', color: 'cyan', link: '/mindreader-science-desk' },
    };
    return categories[category] || categories.FOOD_FOR_THOUGHT;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const categoryInfo = getCategoryInfo(article.category);

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-24">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={[
            { label: categoryInfo.name, href: categoryInfo.link },
            { label: article.title }
          ]} />
        </div>

        {/* Back Button */}
        <Link
          href={categoryInfo.link}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {categoryInfo.name}
        </Link>

        {/* Article Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          {article.featuredImage && (
            <div className="aspect-video overflow-hidden">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8 lg:p-12">
            {/* Category Badge */}
            <Link
              href={categoryInfo.link}
              className={`inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800 hover:bg-${categoryInfo.color}-200 transition-colors`}
            >
              {categoryInfo.name}
            </Link>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>{article.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(article.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{article.viewCount} views</span>
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-gray-900 prose-pre:text-gray-100"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Share this article</h3>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: article.title,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
