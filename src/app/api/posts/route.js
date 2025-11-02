import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';

// Mock data for insights/blog posts
const posts = [
  {
    id: 1,
    title: "CRISPR 3.0: Next-Generation Gene Editing Technologies",
    excerpt: "Exploring the latest advances in gene editing technology and their potential impact on therapeutic development and market opportunities.",
    content: "Full article content would go here...",
    author: "Dr. Sarah Chen",
    date: "2024-12-15",
    category: "Technology",
    slug: "crispr-3-next-generation-gene-editing"
  },
  {
    id: 2,
    title: "FDA Fast Track Designations: Q4 2024 Analysis",
    excerpt: "Comprehensive analysis of recent FDA fast track designations and what they mean for biotech investors and pharmaceutical companies.",
    content: "Full article content would go here...",
    author: "Michael Rodriguez",
    date: "2024-12-12",
    category: "Regulatory",
    slug: "fda-fast-track-designations-q4-2024"
  },
  {
    id: 3,
    title: "Immunotherapy Market Outlook: $200B by 2030",
    excerpt: "Market analysis of the growing immunotherapy sector, key players, and investment opportunities in cancer treatment innovations.",
    content: "Full article content would go here...",
    author: "Lisa Wang",
    date: "2024-12-10",
    category: "Market Analysis",
    slug: "immunotherapy-market-outlook-200b-2030"
  }
];

export async function GET(request) {
  noStore();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let filteredPosts = posts;
    
    if (category) {
      filteredPosts = posts.filter(post => 
        post.category.toLowerCase() === category.toLowerCase()
      );
    }

    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    return NextResponse.json({
      posts: paginatedPosts,
      total: filteredPosts.length,
      hasMore: offset + limit < filteredPosts.length
    });
  } catch (error) {
    console.error('Posts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
