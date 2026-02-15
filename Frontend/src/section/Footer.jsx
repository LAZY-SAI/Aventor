import { FaFacebook, FaGithub, FaLinkedin, FaTwitter, FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: ["Features", "AI Planning", "Guides", "Pricing"],
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Blog", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
    },
  ];

  const socialLinks = [
    { icon: <FaFacebook />, url: "#" },
    { icon: <FaTwitter />, url: "#" },
    { icon: <FaGithub />, url: "#" },
    { icon: <FaLinkedin />, url: "#" },
  ];

  return (
    <footer className="relative  border-t border-white/5 pt-24 pb-12 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent shadow-[0_0_100px_rgba(59,130,246,0.2)]" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand & Newsletter Section */}
          <div className="md:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-black tracking-tighter text-white">YATRICA</h2>
              <p className="text-neutral-500 max-w-sm leading-relaxed">
                Elevating the trekking experience in Nepal through AI-driven intelligence and local expertise.
              </p>
            </div>

            <div className="flex flex-col space-y-4">
              <p className="text-sm font-bold text-white uppercase tracking-widest">Subscribe to the trail</p>
              <div className="flex max-w-sm bg-white/5 border border-white/10 rounded-xl p-1 focus-within:border-blue-500/50 transition-all">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-transparent border-none outline-none text-sm px-4 py-2 w-full text-white placeholder:text-neutral-600"
                />
                <button className="bg-white text-black p-2 rounded-lg hover:bg-neutral-200 transition-colors">
                  <FaArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footerLinks.map((group) => (
              <div key={group.title} className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">{group.title}</h3>
                <ul className="space-y-4">
                  {group.links.map((link) => (
                    <li key={link}>
                      <Link 
                        to={`/${link.toLowerCase().replace(/ /g, "-")}`} 
                        className="text-neutral-500 hover:text-blue-400 transition-colors text-sm font-medium"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-neutral-600 text-xs">
            &copy; {currentYear} Yatrica / Aventor. All rights reserved. Built for the mountains.
          </p>
          
          <div className="flex items-center space-x-5">
            {socialLinks.map((social, i) => (
              <a 
                key={i} 
                href={social.url} 
                className="text-neutral-500 hover:text-white transition-all hover:-translate-y-1 text-lg"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;