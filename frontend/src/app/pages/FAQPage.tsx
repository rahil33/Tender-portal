import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    category: 'GeM Portal',
    questions: [
      {
        question: 'What is the Government e-Marketplace (GeM)?',
        answer: 'GeM is an online platform for procurement of goods and services by government departments, organizations, and PSUs. It provides a transparent, efficient, and inclusive platform for government buyers and sellers.'
      },
      {
        question: 'Who can register on GeM as a seller?',
        answer: 'Any business entity registered in India with a valid PAN, GST registration, and bank account can register on GeM. This includes proprietorships, partnerships, LLPs, and companies.'
      },
      {
        question: 'Is GeM registration free?',
        answer: 'Yes, registration on GeM is completely free. There are no charges for creating a seller account or listing products on the platform.'
      },
      {
        question: 'How long does GeM registration take?',
        answer: 'The registration process typically takes 2-5 business days after all documents are submitted correctly. However, with expert assistance from Phoenix Tender Tech, we can expedite this process.'
      }
    ]
  },
  {
    category: 'Tender Bidding',
    questions: [
      {
        question: 'What documents are required for tender bidding?',
        answer: 'Common documents include: Company registration certificate, PAN card, GST registration, bank details, EMD/bid security, technical specifications, past performance certificates, and any specific documents mentioned in the tender notice.'
      },
      {
        question: 'What is EMD (Earnest Money Deposit)?',
        answer: 'EMD is a security deposit that bidders must submit with their bid to demonstrate serious intent. It is typically 1-5% of the tender value and is refunded to unsuccessful bidders after the tender is awarded.'
      },
      {
        question: 'Can I bid for tenders outside my state?',
        answer: 'Yes, most government tenders are open to bidders from across India unless specifically mentioned otherwise in the tender document. GeM platform especially encourages pan-India participation.'
      },
      {
        question: 'How do I know if I am eligible for a tender?',
        answer: 'Check the tender document\'s eligibility criteria section which specifies requirements like turnover, experience, technical capabilities, and certifications. Our experts at Phoenix Tender Tech can help assess your eligibility.'
      }
    ]
  },
  {
    category: 'Certificates',
    questions: [
      {
        question: 'What is MSME/Udyam registration?',
        answer: 'MSME (Micro, Small & Medium Enterprises) registration, now called Udyam registration, is a government registration for small and medium businesses. It provides various benefits including preference in government tenders.'
      },
      {
        question: 'Do I need ISO certification for tenders?',
        answer: 'While not mandatory for all tenders, ISO certification significantly improves your chances of winning. Many high-value tenders specifically require ISO 9001:2015 or other relevant ISO certifications.'
      },
      {
        question: 'How long is an MSME certificate valid?',
        answer: 'Udyam registration (MSME certificate) is permanent and does not require renewal. However, you must update your details if there are significant changes in your business.'
      },
      {
        question: 'What is NSIC certificate?',
        answer: 'NSIC (National Small Industries Corporation) provides various certifications and support services for MSMEs, including performance and credit rating, which can help in tender participation.'
      }
    ]
  },
  {
    category: 'Services & Pricing',
    questions: [
      {
        question: 'What services does Phoenix Tender Tech offer?',
        answer: 'We offer comprehensive services including GeM registration, tender bidding support, OEM panel setup, certificate assistance (MSME, ISO, etc.), catalog management, and ongoing consultation.'
      },
      {
        question: 'How much do your services cost?',
        answer: 'Our pricing varies based on the service and complexity. GeM registration starts from ₹15,000, tender bidding support from ₹10,000 per tender, and certificate services from ₹5,000. Contact us for detailed pricing.'
      },
      {
        question: 'Do you provide ongoing support after registration?',
        answer: 'Yes, we provide comprehensive post-registration support including bid management, catalog updates, query resolution, and strategic consultation to help you win more tenders.'
      },
      {
        question: 'What is your success rate?',
        answer: 'We have a 98% success rate in GeM registration and have helped clients win tenders worth over ₹500 crores. Our expert team brings years of experience in government procurement.'
      }
    ]
  },
  {
    category: 'General',
    questions: [
      {
        question: 'How do I track tender deadlines?',
        answer: 'Our platform provides real-time updates on tender deadlines. You can also set up email alerts for specific categories or regions. We also provide personalized reminders for our registered clients.'
      },
      {
        question: 'Can you help with tender documentation?',
        answer: 'Yes, we provide end-to-end documentation support including preparation of technical bids, financial bids, and all required certificates and declarations.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major payment methods including bank transfer, UPI, credit/debit cards, and cheques. We also offer flexible payment terms for larger projects.'
      },
      {
        question: 'Do you provide training on GeM portal usage?',
        answer: 'Yes, we offer comprehensive training sessions on GeM portal navigation, bidding process, catalog management, and best practices. Both one-on-one and group training options are available.'
      }
    ]
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev =>
      prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]
    );
  };

  const isOpen = (categoryIndex: number, questionIndex: number) => {
    return openItems.includes(`${categoryIndex}-${questionIndex}`);
  };

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-[900px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#0B3D91] mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to common questions about GeM registration, tender bidding, certificates, and our services.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] bg-white"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredFAQs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0B3D91] to-[#1e5bb8] text-white p-6">
                <h2 className="text-2xl font-bold">{category.category}</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {category.questions.map((item, questionIndex) => {
                  const originalCategoryIndex = faqData.findIndex(c => c.category === category.category);
                  const originalQuestionIndex = faqData[originalCategoryIndex].questions.findIndex(
                    q => q.question === item.question
                  );
                  
                  return (
                    <div key={questionIndex}>
                      <button
                        onClick={() => toggleItem(originalCategoryIndex, originalQuestionIndex)}
                        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-blue-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-8">{item.question}</span>
                        {isOpen(originalCategoryIndex, originalQuestionIndex) ? (
                          <ChevronUp size={24} className="text-[#0B3D91] flex-shrink-0" />
                        ) : (
                          <ChevronDown size={24} className="text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen(originalCategoryIndex, originalQuestionIndex) && (
                        <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No matching questions found.</p>
            <p className="text-gray-500">Try different keywords or contact us directly.</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#0B3D91] to-[#1e5bb8] text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="mb-6 opacity-90">
            Can't find the answer you're looking for? Our expert team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-white text-[#0B3D91] rounded-lg font-bold hover:bg-blue-50 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
