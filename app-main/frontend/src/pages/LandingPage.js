import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Brain, Download, Shield, Zap } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <nav className="px-8 py-6 flex justify-between items-center" data-testid="landing-nav">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ResumeAI
          </h1>
        </div>
        <Button 
          onClick={() => navigate('/auth')} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          data-testid="nav-get-started-btn"
        >
          Get Started
        </Button>
      </nav>

      <main>
        <section className="max-w-6xl mx-auto px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Resume Builder
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
            Build Your Perfect Resume
            <br />
            <span className="text-blue-600">In Minutes</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Create professional, ATS-optimized resumes with AI assistance. Import your achievements, 
            generate summaries, and download beautiful resumes instantly.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 rounded-xl"
              data-testid="hero-get-started-btn"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Building Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl border-2 border-slate-300 hover:border-blue-600"
              data-testid="learn-more-btn"
            >
              Learn More
            </Button>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-ai-card">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">AI-Powered Content</h3>
              <p className="text-slate-600 leading-relaxed">
                Generate professional summaries and optimize your resume content with advanced AI technology.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-templates-card">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Beautiful Templates</h3>
              <p className="text-slate-600 leading-relaxed">
                Choose from professionally designed templates that make your resume stand out to recruiters.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-export-card">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Download className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Easy Export</h3>
              <p className="text-slate-600 leading-relaxed">
                Download your resume as PDF instantly. Perfect formatting guaranteed every time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-verification-card">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Skill Verification</h3>
              <p className="text-slate-600 leading-relaxed">
                Track and verify your skills, internships, and hackathon achievements all in one place.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-score-card">
              <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Resume Score</h3>
              <p className="text-slate-600 leading-relaxed">
                Get instant feedback on your resume with our intelligent scoring system and improvement tips.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-privacy-card">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Privacy First</h3>
              <p className="text-slate-600 leading-relaxed">
                Your data is stored locally and securely. We respect your privacy and never share your information.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-8 py-20 text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">Ready to Build Your Future?</h2>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who have created their perfect resume with ResumeAI
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-10 py-6 rounded-xl"
            data-testid="cta-get-started-btn"
          >
            Get Started for Free
          </Button>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 px-8 text-center text-slate-600">
        <p>© 2025 ResumeAI. Built with ❤️ for job seekers everywhere.</p>
      </footer>
    </div>
  );
};

export default LandingPage;