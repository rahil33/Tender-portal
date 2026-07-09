import React, { useState } from 'react';
import { CheckCircle, X, ExternalLink } from 'lucide-react';

interface ISOCertificate {
  id: string;
  number: string;
  name: string;
  validUntil: string;
  description: string;
}

const certificates: ISOCertificate[] = [
  {
    id: '1',
    number: 'ISO 9001:2015',
    name: 'Quality Management System',
    validUntil: '2026',
    description: 'Ensures consistent quality in products and services through effective quality management processes.'
  },
  {
    id: '2',
    number: 'ISO 27001:2022',
    name: 'Information Security Management',
    validUntil: '2026',
    description: 'Protects sensitive information through comprehensive information security management systems.'
  },
  {
    id: '3',
    number: 'ISO 20000-1:2018',
    name: 'IT Service Management',
    validUntil: '2026',
    description: 'Delivers high-quality IT services through efficient service management practices.'
  },
  {
    id: '4',
    number: 'ISO 14001:2015',
    name: 'Environmental Management',
    validUntil: '2026',
    description: 'Demonstrates commitment to environmental sustainability and reduces environmental impact.'
  },
  {
    id: '5',
    number: 'ISO 45001:2018',
    name: 'Occupational Health & Safety',
    validUntil: '2026',
    description: 'Ensures workplace safety and promotes a healthy work environment for all employees.'
  },
  {
    id: '6',
    number: 'ISO 22301:2019',
    name: 'Business Continuity Management',
    validUntil: '2026',
    description: 'Ensures business operations continue during disruptions through effective continuity planning.'
  }
];

interface ISOCertificatesProps {
  variant?: 'full' | 'badges';
}

export const ISOCertificates: React.FC<ISOCertificatesProps> = ({ variant = 'full' }) => {
  const [selectedCertificate, setSelectedCertificate] = useState<ISOCertificate | null>(null);

  if (variant === 'badges') {
    return (
      <div className="flex flex-wrap gap-3 items-center">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => setSelectedCertificate(cert)}
          >
            <CheckCircle className="w-3 h-3" />
            <span>{cert.number}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-card rounded-lg border-2 border-primary/10 p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg cursor-pointer group"
            onClick={() => setSelectedCertificate(cert)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                <CheckCircle className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-primary mb-2">{cert.number}</h3>
            <h4 className="text-base font-semibold text-foreground mb-3">{cert.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">{cert.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">Valid until {cert.validUntil}</span>
              <button className="text-secondary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                View Certificate
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedCertificate(null)}>
          <div className="bg-card rounded-lg max-w-2xl w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary">{selectedCertificate.number}</h2>
                  <p className="text-lg text-foreground">{selectedCertificate.name}</p>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-6 border-2 border-primary/20">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Certificate Preview</p>
                    <p className="text-xs text-muted-foreground">Valid until {selectedCertificate.validUntil}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{selectedCertificate.description}</p>
              
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 shadow-sm transition-colors">
                  Download Certificate
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-md hover:bg-gray-50 shadow-sm transition-colors">
                  Verify Online
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
