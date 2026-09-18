import React from 'react';
import HeroSection from '../components/ui/HeroSection';
import ReportCategoriesGrid from '../components/ui/ReportCategoriesGrid';
import HowItWorksSteps from '../components/ui/HowItWorksSteps';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <HeroSection />
      <ReportCategoriesGrid />
      <HowItWorksSteps />
    </div>
  );
};

export default LandingPage;
