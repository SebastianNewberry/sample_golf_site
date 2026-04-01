import { MapPin, Clock, Phone, Mail } from "lucide-react";

export default function WinterPrograms() {
  return (
    <section className="bg-slate-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {/* Header Area */}
            <div className="bg-golf-green-dark px-6 py-8 md:px-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <h2 className="relative text-2xl md:text-3xl font-bold text-white uppercase tracking-wider mb-2 drop-shadow-sm">
                Private Golf Instruction
              </h2>
              <p className="relative text-golf-orange font-semibold text-lg tracking-wide uppercase">
                Available for Winter 2026
              </p>
            </div>

            {/* Content Area */}
            <div className="p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-slate-100 p-3 rounded-full text-golf-green-dark">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-1">Location</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Evolution SportsPlex<br />
                        141 South Opdyke Rd<br />
                        Auburn Hills, MI 48326
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-slate-100 p-3 rounded-full text-golf-green-dark">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-1">Session Times</h3>
                      <p className="text-slate-600">
                        Monday through Thursday<br />
                        9:00 AM - 8:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col justify-center h-full p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-6 flex items-center justify-center gap-2">
                      <span className="w-8 h-px bg-slate-300"></span>
                      Get in Touch
                      <span className="w-8 h-px bg-slate-300"></span>
                    </p>
                    
                    <div className="space-y-5 text-center">
                      <a href="tel:+12488790909" className="group flex flex-col items-center justify-center gap-2 text-slate-700 hover:text-golf-orange transition-colors">
                        <Phone className="w-5 h-5 text-golf-orange" />
                        <span className="text-xl font-medium tracking-wide">(248) 879-0909</span>
                      </a>
                      
                      <div className="w-12 h-px bg-slate-200 mx-auto"></div>
                      
                      <a href="mailto:toskigolfacademy@gmail.com" className="group flex flex-col items-center justify-center gap-2 text-slate-700 hover:text-golf-orange transition-colors">
                        <Mail className="w-5 h-5 text-golf-orange" />
                        <span className="font-medium">toskigolfacademy@gmail.com</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
