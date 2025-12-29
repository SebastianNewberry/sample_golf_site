export default function AcademyLocations() {
  const locations = [
    {
      season: "SUMMER",
      name: "Sanctuary Lake Golf Course",
      address: "1450 E. South Blvd.",
      city: "Troy, MI 48085",
      mapUrl:
        "https://maps.google.com/maps?q=Sanctuary+Lake+Golf+Course,+1450+E.+South+Blvd,+Troy,+MI+48085&t=&z=15&ie=UTF8&iwloc=&output=embed",
    },
    {
      season: "WINTER",
      name: "Evolution SportsPlex",
      address: "141 South Opdyke Rd",
      city: "Auburn Hills, MI 48326",
      mapUrl:
        "https://maps.google.com/maps?q=Evolution+SportsPlex,+141+South+Opdyke+Rd,+Auburn+Hills,+MI+48326&t=&z=15&ie=UTF8&iwloc=&output=embed",
    },
  ];

  return (
    <section className="bg-gray-200 py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-black text-2xl md:text-3xl font-semibold tracking-wide">
            - Academy Locations -
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((location, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-lg"
            >
              {/* Season Badge */}
              <div className="bg-orange-500 p-3">
                <span className="text-white text-sm font-semibold uppercase tracking-wide">
                  {location.season}
                </span>
              </div>

              {/* Map */}
              <div className="h-64 md:h-80">
                <iframe
                  src={location.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              {/* Location Info */}
              <div className="p-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                  {location.name}
                </h3>
                <p className="text-gray-600 text-base">
                  {location.address}
                  <br />
                  {location.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
