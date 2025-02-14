import { Link } from 'react-router-dom';
import logo from '../../assets/images/logoh.png';
import homeimage from '../../assets/images/hom.jpg';
import recom from '../../assets/images/recom.jpg';
import consulImage from '../../assets/images/consul.jpg';
const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <img
            src={logo}
            alt="Logo"
            className="w-24 sm:w-32"
          />
          <nav className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
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
              <button className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded-full hover:bg-green-700 transition text-xs sm:text-sm">
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
          <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-36 text-center">
            <h1 className="text-3xl sm:text-6xl font-bold mb-4"> 
              Revolutionizing Agriculture with AI
            </h1>
            <p className="text-base sm:text-xl mb-6">
              Empowering farmers with cutting-edge technology for a sustainable
              future.
            </p>
            <div className="flex justify-center space-x-2 sm:space-x-4">
            <Link to="/login">
              <button className="bg-white text-green-700 px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-gray-200 transition text-sm sm:text-base">
                Explore Platform
              </button>
              </Link>
              <button className="border border-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-green-600 transition text-sm sm:text-base">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-8 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-green-800 mb-6 sm:mb-10">
            Comprehensive Agricultural Solutions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
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
                  className="w-full h-40 sm:h-56 object-cover"
                />
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-10 sm:py-20 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-green-800 mb-6 sm:mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-9">
            {[
              {
                image: "https://images.unsplash.com/photo-1591754060004-f91c95f5cf05?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                step: "Step 1: Track Your Plants",
                desc: "Track your plants with our embedded system to monitor their health and growth.",
              },
              {
                image: homeimage,
                step: "Step 2: AI Analysis",
                desc: "Our AI analyzes the image and identifies potential diseases.",
              },
              {
                image: recom,
                step: "Step 3: Get Recommendations",
                desc: "Receive precise treatment recommendations for plant health.",
              },
              {
                image: consulImage,
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
                  className="w-full h-40 sm:h-56 object-cover"
                />
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">{step.step}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section
        className="bg-green-700 text-white py-10 sm:py-16 text-center"
        style={{
          backgroundImage: `url('https://source.unsplash.com/1600x900/?farm,harvest')`,
        }}
      >
        <div className="bg-black bg-opacity-60 py-8 sm:py-12">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">
            Transform Your Agricultural Journey
          </h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8">
            Join thousands of farmers leveraging AI for better productivity.
          </p>
          <Link to="/login">
          <button className="bg-white text-green-700 px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-gray-200 transition text-sm sm:text-base">
            Sign Up Now
          </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8">
        <div className="container mx-auto text-center text-sm sm:text-base">
          <p>© 2024 Agri AI Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
