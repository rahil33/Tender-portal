import React from 'react';
import { Link } from 'react-router';
import { Hero } from '../components/Hero';
import { QuickServices } from '../components/QuickServices';
import { TenderList } from '../components/TenderList';
import { Services, Pricing } from '../components/Services';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { CertificateServices } from '../components/CertificateServices';
import { Testimonials } from '../components/Testimonials';

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickServices />
      <TenderList />
      <Services />
      <WhyChooseUs />
      <CertificateServices />
      <Testimonials />
    </>
  );
}