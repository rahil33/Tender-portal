import React from 'react';
import { Gavel, FileText, Award, Filter, Phone } from 'lucide-react';
import { motion } from 'motion/react';

interface QuickServiceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  isLast?: boolean;
}

const QuickServiceItem: React.FC<QuickServiceItemProps> = ({ icon, title, description, iconBg, isLast }) => (
  <div className={`flex flex-col items-center text-center p-8 md:p-12 ${!isLast ? 'md:border-r border-[#E5E7EB]' : ''} flex-1 group hover:bg-[#F8FAFC] transition-colors duration-300 cursor-pointer`}>
    <div className={`w-16 h-16 rounded-[20px] ${iconBg} flex items-center justify-center text-[#16A34A] mb-6 shadow-sm border border-[#E5E7EB] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-[#16A34A]`}>
      {React.cloneElement(icon as React.ReactElement, { size: 28, strokeWidth: 1.5 })}
    </div>
    <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-3 group-hover:text-[#16A34A] transition-colors">
      {title}
    </h3>
    <p className="text-[#6B7280] text-sm leading-relaxed max-w-[240px]">
      {description}
    </p>
  </div>
);

export const QuickServices: React.FC = () => {
  const services = [
    {
      icon: <Gavel size={36} />,
      title: 'Tender Services',
      description: 'Streamlined solutions for efficient tender management.',
      iconBg: 'bg-white',
    },
    {
      icon: <FileText size={36} />,
      title: 'Registration Services',
      description: 'Simplify your registration process with our streamlined services.',
      iconBg: 'bg-white',
    },
    {
      icon: <Award size={36} />,
      title: 'Digital Certificates',
      description: 'Secure your tender transactions with digital certificates.',
      iconBg: 'bg-white',
    },
    {
      icon: <Filter size={36} />,
      title: 'Other Services',
      description: 'Explore more tailored services for your business.',
      iconBg: 'bg-white',
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 relative z-10 -mt-16 sm:-mt-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white/80 backdrop-blur-[20px] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col md:flex-row overflow-hidden relative border border-white"
      >
        {services.map((service, index) => (
          <QuickServiceItem 
            key={index}
            {...service}
            isLast={index === services.length - 1}
          />
        ))}
        
        {/* Floating Call Action */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden lg:block translate-x-full pl-6">
          <button className="w-12 h-12 bg-[#16A34A] text-white rounded-l-[16px] flex items-center justify-center shadow-[0_4px_16px_rgba(22,163,74,0.3)] hover:bg-[#15803D] transition-all duration-300 cursor-pointer group hover:-translate-x-1">
            <Phone size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};