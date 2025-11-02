import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArticleSchema, BreadcrumbSchema } from "../../../components/structured-data";

// Mock blog posts data (in a real app, this would come from a CMS or database)
const blogPosts = {
  "crispr-3-next-generation-gene-editing": {
    id: 1,
    title: "CRISPR 3.0: Next-Generation Gene Editing Technologies",
    content: `
      <h2>The Evolution of Gene Editing</h2>
      <p>CRISPR technology has revolutionized the field of genetic engineering, and we're now witnessing the emergence of CRISPR 3.0 - a new generation of gene editing tools that promise unprecedented precision and safety.</p>
      
      <h3>Key Advances in CRISPR 3.0</h3>
      <ul>
        <li><strong>Prime Editing:</strong> Enables precise insertions, deletions, and substitutions without double-strand breaks</li>
        <li><strong>Base Editing:</strong> Allows for single nucleotide changes with minimal off-target effects</li>
        <li><strong>Epigenome Editing:</strong> Modifies gene expression without altering DNA sequence</li>
        <li><strong>Miniaturized Systems:</strong> Compact CRISPR systems for improved delivery</li>
      </ul>
      
      <h3>Market Implications</h3>
      <p>The global gene editing market is projected to reach $63.2 billion by 2030, with CRISPR 3.0 technologies driving significant growth in therapeutic applications.</p>
      
      <h3>Investment Opportunities</h3>
      <p>Companies developing CRISPR 3.0 technologies represent compelling investment opportunities, particularly those focused on:</p>
      <ul>
        <li>Rare genetic diseases</li>
        <li>Cancer immunotherapy</li>
        <li>Agricultural applications</li>
        <li>Diagnostic tools</li>
      </ul>
      
      <h3>Regulatory Landscape</h3>
      <p>The FDA has shown increasing openness to gene editing therapies, with several CRISPR-based treatments receiving breakthrough therapy designation.</p>
    `,
    author: "Dr. Sarah Chen",
    date: "2024-12-15",
    category: "Technology",
    readTime: "8 min read",
    tags: ["CRISPR", "Gene Editing", "Biotechnology", "Investment"]
  },
  "fda-fast-track-designations-q4-2024": {
    id: 2,
    title: "FDA Fast Track Designations: Q4 2024 Analysis",
    content: `
      <h2>Q4 2024 Fast Track Designations Overview</h2>
      <p>The FDA granted fast track designation to 23 new therapies in Q4 2024, representing a 15% increase from the previous quarter and highlighting continued innovation in biotechnology.</p>
      
      <h3>Therapeutic Areas</h3>
      <p>The designations span multiple therapeutic areas:</p>
      <ul>
        <li><strong>Oncology:</strong> 12 designations (52%)</li>
        <li><strong>Rare Diseases:</strong> 6 designations (26%)</li>
        <li><strong>Neurology:</strong> 3 designations (13%)</li>
        <li><strong>Infectious Diseases:</strong> 2 designations (9%)</li>
      </ul>
      
      <h3>Key Companies</h3>
      <p>Notable companies receiving fast track designations include both established pharmaceutical giants and emerging biotech firms, indicating a healthy pipeline across the industry.</p>
      
      <h3>Investment Implications</h3>
      <p>Fast track designation typically leads to:</p>
      <ul>
        <li>Accelerated development timelines</li>
        <li>Increased investor confidence</li>
        <li>Higher probability of regulatory approval</li>
        <li>Potential for premium pricing</li>
      </ul>
    `,
    author: "Michael Rodriguez",
    date: "2024-12-12",
    category: "Regulatory",
    readTime: "6 min read",
    tags: ["FDA", "Regulatory", "Fast Track", "Biotech"]
  }
};

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }) {
  const post = blogPosts[params.slug];
  
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
    openGraph: {
      title: post.title,
      description: post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default function BlogPost({ params }) {
  const post = blogPosts[params.slug];

  if (!post) {
    notFound();
  }

  const breadcrumbItems = [
    { name: "Home", url: "https://mindreaderbio.tech/" },
    { name: "Insights", url: "https://mindreaderbio.tech/insights" },
    { name: post.title, url: `https://mindreaderbio.tech/insights/${params.slug}` }
  ];

  return (
    <div className="min-h-screen relative pt-20">
      
      {/* Structured Data */}
      <ArticleSchema article={post} />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <div className="max-w-4xl mx-auto px-8 py-20 relative z-10">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/insights" className="hover:text-blue-600">Insights</Link></li>
            <li>/</li>
            <li className="text-gray-800 font-medium">{post.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full font-medium">
              {post.category}
            </span>
            <span className="text-gray-500 text-sm">{post.readTime}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between text-gray-600 text-sm">
            <div className="flex items-center gap-4">
              <span>By {post.author}</span>
              <span>•</span>
              <time dateTime={post.date}>
                {format(new Date(post.date), 'MMMM d, yyyy')}
              </time>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-black mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Back to Insights */}
        <div className="mt-12 text-center">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ← Back to Insights
          </Link>
        </div>
      </div>
    </div>
  );
}
