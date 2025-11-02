// app/insights/page.tsx

export const metadata = {
  title: "Insights - MindReaderBio",
  description:
    "Latest biotech insights, market analysis, and research developments from MindReaderBio experts.",
};

import Link from "next/link";
import { AlertTriangle, Lock, Crown, FileSpreadsheet } from "lucide-react";
import { auth } from "../../lib/auth";
import { hasProAccess } from "../../lib/access-control";
import { redirect } from "next/navigation";

export default async function Insights() {
  const session = await auth();
  const userPlan = session?.user?.plan || "FREE";
  const hasAccess = hasProAccess(userPlan);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Intro Section */}
        <div className="mb-12 text-center">
          <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            We feel that there has to be balance in any investment portfolio. We will be providing a general as well as biotech investment portfolio.
            In order to participate with MindReader stock pick you can connect and subscribe to MindReader.
          </p>
        </div>

        {/* General Portfolio */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            General Portfolio
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            We offer a diversified portfolio of companies that we believe have strong potential and are already well-researched.
            To keep things straightforward, we will list the portfolio names without providing detailed fundamental or technical commentary.
            Subscribers will be notified promptly whenever we make additions, sales, or other changes to the General Portfolio.
            All stocks featured here are part of Dr. Forsyth’s active personal portfolio, reflecting his own market positions.
          </p>

          {/* Download Button */}
          <div className="flex justify-center mb-10">
            <a
              href="/files/general-portfolio.xlsx"
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download General Portfolio (Excel)
            </a>
          </div>
        </div>

        {/* General Portfolio Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          {generalPortfolio.map((stock, index) => (
            <article
              key={index}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                  {stock.symbol}
                </span>
                <span className="text-gray-500 text-xs">{stock.category}</span>
              </div>

              <h3 className="text-xl font-bold text-black mb-3">
                {stock.name}
              </h3>

              <p className="text-gray-700 leading-relaxed">
                {stock.description}
              </p>
            </article>
          ))}
        </div>

        {/* Biotech Insights */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-black">
              Biotech Insights
            </h1>
            {hasAccess && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-full font-medium flex items-center gap-1">
                <Crown className="w-4 h-4" />
                PRO
              </span>
            )}
          </div>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are providing a mixed portfolio of names we think will do well but are fairly well researched so we will provide the names without any fundamental or technical comment.
          </p>

          {/* Conditional Excel Button */}
          {hasAccess ? (
            <div className="flex justify-center mt-8 mb-6">
              <a
                href="/files/biotech-insight.xlsx"
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Download Biotech Insights (Excel)
              </a>
            </div>
          ) : (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-2xl mx-auto">
              <p className="text-blue-800 text-sm font-medium">
                🔒 Biotech Insights and Excel download are available for PRO subscribers only.
                <Link href="/pricing" className="underline hover:text-blue-900 ml-1">
                  Upgrade to PRO
                </Link> to access detailed analysis and exclusive content.
              </p>
            </div>
          )}
        </div>

        {/* Biotech Insights Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {insightPosts.map((post, index) => (
            <article
              key={index}
              className={`bg-gray-50 rounded-2xl p-6 transition-shadow relative overflow-hidden ${
                hasAccess ? "hover:shadow-lg" : "opacity-75 cursor-not-allowed"
              }`}
            >
              {!hasAccess && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                  <div className="text-center p-6">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-2">
                      PRO Content
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Upgrade to Unlock
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                  {post.category}
                </span>
                <span className="text-gray-500 text-xs">{post.date}</span>
              </div>

              <h3
                className={`text-xl font-bold mb-3 transition-colors ${
                  hasAccess ? "text-black hover:text-blue-600" : "text-gray-500"
                }`}
              >
                {post.title}
              </h3>

              {hasAccess ? (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
              ) : (
                <p className="text-gray-500 mb-4 leading-relaxed line-clamp-2">
                  {post.excerpt.substring(0, 100)}...
                </p>
              )}
            </article>
          ))}
        </div>

        {/* Informational Line */}
        <div className="bg-gray-50 rounded-2xl p-8 mt-16 mb-12">
          <p className="text-gray-700 text-center text-lg leading-relaxed max-w-4xl mx-auto">
            All these stocks appear in our portfolio but these are not meant to be any individual’s portfolio.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-12">
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 shadow-sm">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-600" />
            <p className="text-sm md:text-base leading-relaxed">
              <strong>Disclaimer:</strong> These portfolio names are subject to change.
            </p>
          </div>
        </div>

        {/* Final Gray Disclaimer */}
        <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500 max-w-3xl mx-auto">
          <p>
            Disclaimer: The information provided by MindReader Enterprises is
            for educational and informational purposes only and should not be
            considered financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}

// Example Data
const generalPortfolio = [
  { symbol: "AAPL", name: "Apple Inc.", category: "Tech", description: "Global tech leader." },
  { symbol: "GOOGL", name: "Alphabet Inc.", category: "Tech", description: "Parent company of Google." },
];

const insightPosts = [
  { category: "Biotech", date: "Nov 2025", title: "Emerging Gene Therapy Trends", excerpt: "Gene therapy is reshaping the biotech industry..." },
  { category: "Pharma", date: "Oct 2025", title: "AI in Drug Discovery", excerpt: "How artificial intelligence is accelerating drug development..." },
];
