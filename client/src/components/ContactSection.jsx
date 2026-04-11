import React from 'react';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

const ContactSection = () => {
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.09582828928!2d80.92512007566003!3d26.93217635925342!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399957002465cf1d%3A0x3f38d6f60f6f3545!2sGyanvatsala%20library!5e0!3m2!1sen!2sin!4v1775876752840!5m2!1sen!2sin";
  const googleMapsUrl = "https://www.google.com/maps/place/Gyanvatsala+library/@26.9321764,80.9251201,17z/data=!3m1!4b1!4m6!3m5!1s0x399957002465cf1d:0x3f38d6f60f6f3545!8m2!3d26.9321716!4d80.927695!16s%2Fg%2F11v6655lq3?entry=ttu";

  return (
    <section id="contact" className="bg-slate-900 text-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold">Contact & Location</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Gyanvatsala Library is located in Lucknow, providing a peaceful and distraction-free study environment. Ideal for students searching for a study library near them.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Contact Details */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-2xl h-full flex flex-col">
            <h3 className="text-3xl font-bold mb-6 text-violet-300">Gyanvatsala Library</h3>
            
            <div className="space-y-6 text-lg">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-violet-400 mt-1 shrink-0" />
                <span>B-34, Sector-C, Near St. Joseph School, Aliganj, Lucknow, Uttar Pradesh 226024</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-violet-400 shrink-0" />
                <a href="tel:7052200603" className="hover:text-violet-300 transition-colors">7052200603</a>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-violet-400 shrink-0" />
                <a href="mailto:contact@gyanvatsala.com" className="hover:text-violet-300 transition-colors">contact@gyanvatsala.com</a>
              </div>
            </div>

            <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-4">
              <a 
                href="tel:7052200603"
                className="flex-1 text-center rounded-lg bg-violet-600 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:scale-105 hover:bg-violet-700"
              >
                Call Now
              </a>
              <a 
                href="https://wa.me/917052200603"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center rounded-lg bg-green-500 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:scale-105 hover:bg-green-600"
              >
                WhatsApp Chat
              </a>
              <a 
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center rounded-lg bg-gray-600/80 px-6 py-3 text-base font-bold text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-gray-700/90"
              >
                Get Directions
              </a>
            </div>
          </div>

          {/* Right Column: Google Map */}
          <div className="h-[500px] lg:h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Gyanvatsala Library Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
