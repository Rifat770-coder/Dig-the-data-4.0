'use client';

import Image from 'next/image';

export default function LegacyPage() {
  const legacyCards = [
    {
      id: 1,
      image: "/Gray Minimalist Photo Collage Woman Model Instagram  Post.png", // Replace with your actual image path
      title: "What is Dig The Data?",
      description: [
        "A thrilling mix of puzzles, quizzes, and brain games.",
        "Uncover hidden clues and decode data-driven mysteries",
        "around your campus.",
        "Step into the world where logic meets curiosity."
      ],
      buttonText: " (NCC) page",
      buttonLink: "https://www.facebook.com/share/v/17fLL55JeP/"
    },
    {
      id: 2,
      image: "/20251018_003312.jpg", // Replace with your actual image path
      title: "Why is Dig The Data?",
      description: [
        "“Dig The Data” makes learning engaging and interactive by transforming traditional education into a fun, game-based experience. It strengthens logical and analytical thinking while encouraging teamwork and communication as teams collaborate and strategize to solve challenges. "
      ],
      buttonText: " (NCC) page",
      buttonLink: "https://www.facebook.com/share/p/1EufJw4Vzi/"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#001233] overflow-hidden rounded-xl ">
      {/* Background Pattern - Navy Blue */}
      <div className="absolute inset-0 bg-[#001233]"></div>
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 200, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 200, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-wide">
            Dig The Data Legacy
          </h1>
        </div>

        {/* Legacy Cards Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 rounded-xl ">
          {legacyCards.map((card) => (
            <div 
              key={card.id}
              className="relative group"
            >
              {/* Card Container */}
              <div className="relative bg-[#001233]/50 backdrop-blur-sm rounded-3xl overflow-hidden border-2 border-gray-600/50 hover:border-cyan-500/50 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/20">
                {/* Image Section */}
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#001233]/80 z-10"></div>
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content Section */}
                <div className="relative z-20 p-8 md:p-10">
                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 tracking-wide">
                    {card.title}
                  </h2>

                  {/* Description */}
                  <div className="space-y-2 mb-8">
                    {card.description.map((line, index) => (
                      <p 
                        key={index}
                        className="text-gray-200 text-base md:text-lg leading-relaxed"
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* Button */}
                  <a
                    href={card.buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-3 bg-white/90 hover:bg-white text-[#001233] text-lg font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-cyan-400"
                  >
                    {card.buttonText}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 border-4 border-cyan-500/20 rounded-lg rotate-45 z-0"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border-4 border-blue-500/20 rounded-lg -rotate-12 z-0"></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-cyan-500/10 rounded-full z-0"></div>
        <div className="absolute bottom-20 right-1/4 w-8 h-8 bg-blue-500/10 rounded-full z-0"></div>
        
        {/* Additional Decorative Dots */}
        <div className="absolute top-1/3 left-10">
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-cyan-500/20 rounded-full"></div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-1/3 right-10">
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-blue-500/20 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave Effect (Optional) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-0"></div>
    </div>
  );
}
