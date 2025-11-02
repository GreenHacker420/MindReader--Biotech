export const metadata = {
  title: "Team - MindReaderBio",
  description: "Meet the expert team behind MindReaderBio's biotech intelligence platform.",
};

const teamMembers = [
  {
    name: "Dr. Forsyth",
    role: "Founder & CEO",
    description: `Dr. Forsyth initially studied economics and political science in a B Comm program. After MD and FP training, he founded a successful medical practice in Raleigh, NC, and maintained an interest in financial investing and current economic and political events. He is now a full-time investor focusing on growth companies. Like many smaller focused investors, he has outperformed the conventional averages handily. He has been very concerned with the state of general health in the country and will use this platform to help focus on solutions.The risks are high, but the results can be lucrative.`,
  },
  {
    name: "Dr. Srishti Gupta",
    role: "Chief Scientific Officer",
    description: `Dr. Srishti Gupta is the Chief Science Officer (CSO) at Mindreader Enterprises, where she leads the company’s scientific vision and strategy. She holds a Ph.D. in Biological sciences from Colorado State University and a Master’s degree in Biotechnology. Her research background spans molecular biology, protein biochemistry, and cell biology, with extensive experience in recombinant protein expression, RNA sequencing, and functional genomics. At Mindreader, she leverages her scientific training to evaluate biotechnology pipelines, analyze emerging therapies, and translate complex research into actionable insights for investors.`,
  },
  {
    name: "Dr. Joshua Dloomy, MD",
    role: "Chief Technology Officer",
    description: `Dr. Joshua Dloomy serves as Chief Technology Officer (CTO) at Mindreader Enterprises, bringing a unique blend of medical expertise, technological vision, and market insight. With deep knowledge of human immunology, a passion for biotech innovation, and strong experience in trading and market analysis, he drives the company’s technology strategy and research platforms. At Mindreader, Dr. Dloomy combines his clinical background with biotech market expertise to ensure that our analyses and tools are scientifically robust and strategically aligned with industry needs.`,
  },
  {
    name: "Taina Kirk",
    role: "Administrator",
  },
];

export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Our Expert Team
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A diverse group of scientists, analysts, and industry experts dedicated to advancing biotech intelligence and market insights.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-md hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-2 flex flex-col"
            >
              {/* Name */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {member.name}
              </h2>

              {/* Role */}
              <p className="text-blue-600 font-semibold mb-4 text-center">
                {member.role}
              </p>

              {/* Description */}
              <p className="text-gray-700 text-sm md:text-base leading-relaxed text-justify">
                {member.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-24">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Want to collaborate with us?
          </h3>
          <a
            href="/contact"
            className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-transform transform hover:scale-105 duration-300"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}
