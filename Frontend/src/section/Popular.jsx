import { FaArrowRight } from "react-icons/fa";

const Popular = () => {
  const popularItems = [
    { id: 1, name: "Annapurna", image: "image1.jpg" },
    { id: 2, name: "Mardi", image: "image2.jpg" },
    { id: 3, name: "Lumbini", image: "image3.jpg" },
    { id: 4, name: "Everest", image: "image4.jpg" },
    // { id: 5, name: "Langtang", image: "image5.jpg" },
    // { id: 6, name: "Rara", image: "image6.jpg" },

  ];

  return (
    <section className="c-space section-spacing">
      <div className="relative flex items-center justify-between">
        <h2 className="text-heading">Popular Ones</h2>
        <button className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-600 transition">
          View All <FaArrowRight />
        </button>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {popularItems.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:scale-105 transition-transform duration-300"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <h3 className="text-center text-lg font-semibold mt-3 mb-4">
              {item.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Popular;
