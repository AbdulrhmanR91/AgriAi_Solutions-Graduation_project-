import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <img
            src="/src/assets/images/Logo.png"
            alt="Logo"
            className="w-32"
          />
          <nav className="flex items-center space-x-4 text-sm">
            <a
              href="#features"
              className="text-gray-800 font-semibold hover:text-green-600 transition"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-800 font-semibold hover:text-green-600 transition"
            >
              How It Works  
            </a>
            <Link to="/login">
              <button className="bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition">
                Get Started
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center text-white"
        style={{
          backgroundImage: `url('https://plus.unsplash.com/premium_photo-1661900547591-80ee79e20d1c?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        }}
      >
        <div className="bg-black bg-opacity-50">
          <div className="container mx-auto px-6 py-36 text-center">
            <h1 className="text-6xl font-bold mb-4"> 
              Revolutionizing Agriculture with AI
            </h1>
            <p className="text-xl mb-6">
              Empowering farmers with cutting-edge technology for a sustainable
              future.
            </p>
            <div className="flex justify-center space-x-4">
            <Link to="/login">
              <button className="bg-white text-green-700 px-6 py-3 rounded-full hover:bg-gray-200 transition">
                Explore Platform
              </button>
              </Link>
              <button className="border border-white px-6 py-3 rounded-full hover:bg-green-600 transition">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-green-800 mb-10">
            Comprehensive Agricultural Solutions
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                image: "https://plus.unsplash.com/premium_photo-1664477103105-bc5d69e2e77f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                title: "AI Disease Detection",
                desc: "Identify and treat plant diseases with advanced AI.",
              },
              {
                image: "https://plus.unsplash.com/premium_photo-1663039878530-66fe183c2a23?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                title: "Expert Consultations",
                desc: "Connect with agricultural experts for tailored support.",
              },
              {
                image: "https://plus.unsplash.com/premium_photo-1661832711622-e70ea4ec8301?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                title: "Resource Marketplace",
                desc: "Find fertilizers, tools, and equipment easily.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition duration-300"
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* How It Works Section */}
<section id="how-it-works" className="py-20 bg-gray-100">
  <div className="container mx-auto px-6 text-center">
    <h2 className="text-4xl font-bold text-green-800 mb-12">
      How It Works
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
      {[
        {
          image: "https://images.unsplash.com/photo-1591754060004-f91c95f5cf05?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          step: "Step 1: Track Your Plants",
          desc: "Track your plants with our embedded system to monitor their health and growth.",
        },
        {
          image: "https://img.freepik.com/free-photo/empty-microbiology-laboratory-with-nobody-it-equipped-with-professional-science-equipment_482257-4508.jpg?t=st=1733834339~exp=1733837939~hmac=c5d30c5a473fd8bae1549731ceeeb8620b4541bb9b4ab2aa5db83669f14bf470&w=1380",
          step: "Step 2: AI Analysis",
          desc: "Our AI analyzes the image and identifies potential diseases.",
        },
        {
          image: "https://img.freepik.com/free-photo/close-up-hand-watering-leaf_23-2149235716.jpg?t=st=1733834573~exp=1733838173~hmac=2f91e194d0150c2f64c609c886f6cb84563d5cf619a70aa420f042b3db0a0b56&w=1060",
          step: "Step 3: Get Recommendations",
          desc: "Receive precise treatment recommendations for plant health.",
        },
        {
          image: "https://img.freepik.com/free-photo/plant-nursery-botanist-using-syringe-taking-care-potted-flowers_637285-1698.jpg?t=st=1733834415~exp=1733838015~hmac=9222f00bab2254155c0a33dd3a721717a1f9568ff52e4884e30cb3a50b57b3c7&w=1060",
          step: "Step 4: Expert Consultation",
          desc: "If needed, connect with agricultural experts for further support.",
        },
      ].map((step, index) => (
        <div
          key={index}
          className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition duration-300"
        >
          <img
            src={step.image}
            alt={step.step}
            className="w-full h-56 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-bold text-green-800 mb-2">{step.step}</h3>
            <p className="text-gray-600">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Call to Action */}
      <section
        className="bg-green-700 text-white py-16 text-center"
        style={{
          backgroundImage: `url('https://source.unsplash.com/1600x900/?farm,harvest')`,
        }}
      >
        <div className="bg-black bg-opacity-60 py-12">
          <h2 className="text-4xl font-bold mb-6">
            Transform Your Agricultural Journey
          </h2>
          <p className="text-xl mb-8">
            Join thousands of farmers leveraging AI for better productivity.
          </p>
          <Link to="/login">
          <button className="bg-white text-green-700 px-8 py-3 rounded-full hover:bg-gray-200 transition">
            Sign Up Now
          </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto text-center">
          <p>© 2024 Agri AI Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
