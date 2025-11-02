export const metadata = {
  title: "About - MindReaderBio",
  description:
    "Learn about MindReader Enterprises and our mission to bridge science and markets in biotechnology.",
};

export default function About() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
            About MindReaderBio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mindreader Enterprises is a biotech and general stock investment
            service dedicated to strategic biotech market analysis. We deliver
            insights into emerging therapies, breakthrough scientific research,
            and FDA clinical developments, empowering investors to make
            informed, science-driven decisions.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-black mb-4">
              Why It Matters
            </h2>
            <p className="text-gray-700 leading-relaxed">
          Mindreader strives to improve investment strategies and decision making. The decisions are built on the foundation of rigorous, validated science. We have sense  of market dynamics, built on years of experience.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-black mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To become a leading intelligence platform that bridges the gap
              between scientific innovation and market opportunities, enabling
              smarter investments.
            </p>
          </div>
        </div>

        {/* What We Bring to the Table */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-16 shadow-sm">
          <h2 className="text-3xl font-bold text-black mb-6 text-center">
            What We Bring to the Table
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg max-w-4xl mx-auto text-center">
            We are committed to doggedly uncovering unloved and undervalued
            biotechnology stocks, with a focus on oncology, autoimmune diseases,
            and genetic disorders. Our goal is not only to identify hidden value
            but also to work tirelessly to understand the evolving competitive
            landscape.
          </p>
        </div>

        {/* Values */}
        <div className="bg-blue-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-black mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧬</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">
                Scientific Research
              </h3>
              <p className="text-gray-600">
                Evidence-based analysis grounded in peer-reviewed research and
                clinical data.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">
                Market Intelligence
              </h3>
              <p className="text-gray-600">
                Deep market insights combining financial analysis with
                scientific understanding.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">
                Investment Excellence
              </h3>
              <p className="text-gray-600">
                Identifying breakthrough technologies that will shape the future
                of healthcare.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </div>
  );
}
