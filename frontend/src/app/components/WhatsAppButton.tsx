import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const whatsappNumber = '919876543210'; // Replace with actual number
  const message = encodeURIComponent('I want to enroll for training');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
      aria-label="WhatsApp Training Support"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="hidden md:block font-medium">Training Support</span>
    </a>
  );
};
