import { ContactForm } from "@/app/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Info */}
          <div className="space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                CONTACT US
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Please contact us with any questions regarding programs,
                registration or general information about the Academy and our
                services.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can call the Academy at{" "}
                <a
                  href="tel:2485633561"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  (248) 563-3561
                </a>{" "}
                or email{" "}
                <a
                  href="mailto:toskigolfacademy@gmail.com"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  toskigolfacademy@gmail.com
                </a>
                .
              </p>
            </div>

            {/* Coaching Staff */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                COACHING STAFF
              </h2>
              <div className="space-y-4">
                {/* Paul Toski */}
                <div className="border-l-4 border-green-600 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Paul Toski, PGA
                  </h3>
                  <p className="text-gray-600">Member</p>
                  <a
                    href="tel:2485633561"
                    className="text-gray-700 hover:text-green-600 mt-1 inline-block"
                  >
                    (248) 563-3561 - mobile
                  </a>
                </div>

                {/* Karl Daiek */}
                <div className="border-l-4 border-green-600 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Karl Daiek
                  </h3>
                  <p className="text-gray-600">Instructor/Coach</p>
                  <a
                    href="tel:5865965387"
                    className="text-gray-700 hover:text-green-600 mt-1 inline-block"
                  >
                    (586) 596-5387 - mobile
                  </a>
                </div>

                {/* Ryan Schudlich */}
                <div className="border-l-4 border-green-600 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ryan Schudlich, PGA
                  </h3>
                  <p className="text-gray-600">Associate</p>
                  <a
                    href="tel:3134029484"
                    className="text-gray-700 hover:text-green-600 mt-1 inline-block"
                  >
                    (313) 402-9484 - mobile
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
