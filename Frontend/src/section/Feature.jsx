import React from "react";

const Feature = () => {
  const Services = [
    {
      title: "Travel Planning",
      descript: "Description for Feature 1",
      gridClass: "grid-2 ",
    },
    {
      title: "Guide Services",
      descript: "Description for Feature 2",
      gridClass: "grid-2 ",
    },
    {
      title: "Custom Itineraries",
      descript: "Description for Feature 3",
      gridClass: "grid-3 ",
    },
    {
      title: "Adventure activities",
      descript: "Description for Feature 4",
      gridClass: "grid-3 ",
    },
    {
      title: "Accommodation Booking",
      descript: "Description for Feature 5",
      gridClass: "grid-2 ",
    },
    {
      title: "Maps & Navigation",
      descript: "Description for Feature 6",
      gridClass: "grid-2 ",
    },
  ];

  return (
    <section className="c-space section-spacing">
      <h2 className="text-heading">Services</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[10rem] mt-12">
        {Services.map((service, index) => (
          <div
            key={index}
            className={`${service.gridClass} bg-white/10 backdrop-blur-sm rounded-2xl hover:scale-100 transition-transform duration-300`}
          >
            <h3 className="text-center text-lg font-semibold mt-3 mb-4">
              {service.title}
            </h3>
            <p className="text-center text-neutral-300">{service.descript}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Feature;
