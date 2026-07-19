import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, Search, Shield, BarChart3, Users, BookOpen,
  ChevronRight, Check, Star, ArrowRight, FileText,
  Lock, Globe, Cpu, Menu, X, Sun, Moon
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">IntelliDocs AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#security" className="hover:text-gray-900 dark:hover:text-white transition-colors">Security</a>
            <a href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Sign in
            </button>
            <button onClick={() => navigate('/register')} className="btn-primary text-sm">
              Get Started
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 space-y-2">
            {['Features', 'How It Works', 'Security', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                {item}
              </a>
            ))}
            <button onClick={() => navigate('/login')} className="block w-full text-left py-2 text-sm text-gray-600 dark:text-gray-400">Sign in</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Zap className="w-3 h-3" /> AI-Powered Enterprise Search
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              Find Answers Across Thousands of{' '}
              <span className="text-brand-600 dark:text-brand-400">Company Documents</span>{' '}
              Instantly
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Upload documents, ask questions in plain English, and get accurate answers powered by AI. No more digging through folders or searching endless wikis.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/register')} className="btn-primary text-base px-6 py-3">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary text-base px-6 py-3">
                Request Demo
              </button>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-4 text-xs text-gray-400 dark:text-gray-500">
              No credit card required · Free 14-day trial · SOC 2 compliant
            </motion.p>
          </motion.div>

          {/* Hero preview card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-14 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-900 text-left"
          >
            <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">IntelliDocs AI Search</div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3 justify-end">
                <div className="bg-brand-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-xs">
                  What is the annual leave policy?
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0">JD</div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-tl-sm p-4 max-w-sm">
                  <p className="text-sm text-gray-800 dark:text-gray-200">According to the <strong>Employee Handbook 2024</strong>, employees are entitled to <strong>21 days</strong> of annual leave per year. This accrues at 1.75 days per month...</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">📄 Employee Handbook · p.14 · 96%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logos */}
      <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">Trusted by leading enterprises</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-40">
            {['Acme Corp', 'TechFlow', 'Nexus Ltd', 'Vertex Co', 'Prism Inc', 'Orbit SaaS'].map(name => (
              <div key={name} className="text-center text-sm font-bold text-gray-500">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-brand-600 dark:text-brand-400 font-semibold text-sm mb-2">Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Everything your team needs</motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              From smart AI search to granular access control, IntelliDocs gives your organization a unified knowledge layer.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Search, title: 'AI-Powered Search', desc: 'Ask questions in plain English. Get precise answers pulled directly from your documents, with page-level citations.', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
              { icon: FileText, title: 'Document Upload', desc: 'Upload PDFs, Word docs, policies, contracts, and handbooks. We handle parsing, indexing, and version tracking.', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
              { icon: Lock, title: 'Role-Based Access', desc: 'Granular access controls ensure employees only see what they\'re permitted to. Admin, Manager, Employee tiers.', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Understand how your team uses knowledge. Track search trends, popular docs, and department activity.', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
              { icon: Cpu, title: 'Smart Discovery', desc: 'The AI surfaces related documents, suggests follow-up questions, and highlights gaps in your knowledge base.', color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' },
              { icon: Globe, title: 'Enterprise Security', desc: 'SOC 2 Type II compliant, end-to-end encryption, SSO support, and full audit logs for every action.', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <motion.div key={title} variants={fadeUp} className="card p-6 hover:shadow-md transition-shadow group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand-600 dark:text-brand-400 font-semibold text-sm mb-2">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Up and running in minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload your documents', desc: 'Drag and drop PDFs, Word files, policies, and contracts. We index them automatically.' },
              { step: '02', title: 'Configure access & roles', desc: 'Assign which teams and individuals can access which documents. Full RBAC support.' },
              { step: '03', title: 'Ask questions instantly', desc: 'Your team types questions in plain English and gets cited, accurate answers in seconds.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center text-sm font-bold mx-auto mb-4">{step}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="card p-8 md:p-12 bg-gradient-to-br from-brand-600 to-brand-800 border-0 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  <Shield className="w-3 h-3" /> Enterprise-Grade Security
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Your data stays yours, always</h2>
                <p className="text-brand-100 text-sm leading-relaxed mb-6">We take security seriously. IntelliDocs is built with enterprise compliance from the ground up.</p>
                <ul className="space-y-2">
                  {['SOC 2 Type II Certified', 'AES-256 Encryption at rest', 'SSO & SAML 2.0 support', 'Full audit trail & logs', 'GDPR & CCPA compliant', 'Zero-retention AI processing'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-brand-100">
                      <Check className="w-4 h-4 text-green-300 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Uptime SLA', value: '99.9%' },
                  { label: 'Response time', value: '<2s' },
                  { label: 'Documents processed', value: '10M+' },
                  { label: 'Enterprise clients', value: '500+' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-brand-200 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What teams are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Rachel Kim', role: 'HR Director, TechCorp', text: 'Our HR team used to spend hours answering policy questions. IntelliDocs cut that to near-zero overnight.' },
              { name: 'David Okafor', role: 'Head of Legal, Nexus Ltd', text: 'Finding the right clause in 50 contracts used to take days. Now it takes seconds with accurate citations.' },
              { name: 'Priya Mehta', role: 'COO, Vertex Co', text: 'Onboarding new employees is so much smoother. They find answers themselves instead of interrupting teammates.' },
            ].map(({ name, role, text }) => (
              <div key={name} className="card p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-brand-600 dark:text-brand-400 font-semibold text-sm mb-2">Pricing</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-12">Start free. Scale as your team grows.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { plan: 'Starter', price: '$0', period: 'forever', features: ['Up to 5 users', '100 documents', 'AI Search', 'Email support'], cta: 'Get started', highlight: false },
              { plan: 'Business', price: '$49', period: 'per seat/mo', features: ['Unlimited users', '10,000 documents', 'Analytics', 'Role-based access', 'Priority support', 'SSO'], cta: 'Start free trial', highlight: true },
              { plan: 'Enterprise', price: 'Custom', period: 'contact us', features: ['Unlimited everything', 'Custom integrations', 'Dedicated CSM', 'SLA guarantee', 'Audit logs', 'On-prem option'], cta: 'Contact sales', highlight: false },
            ].map(({ plan, price, period, features, cta, highlight }) => (
              <div key={plan} className={`card p-6 ${highlight ? 'border-brand-500 ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-950' : ''}`}>
                {highlight && <div className="badge bg-brand-600 text-white mb-3">Most Popular</div>}
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{plan}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{price}</span>
                  <span className="text-sm text-gray-400 ml-1">{period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${highlight ? 'btn-primary justify-center' : 'btn-secondary justify-center'}`}
                >
                  {cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to unlock your company knowledge?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Join hundreds of enterprises saving thousands of hours per month.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="btn-primary text-base px-6 py-3">
              Start for free <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary text-base px-6 py-3">Sign in</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">IntelliDocs AI</span>
          </div>
          <p className="text-sm text-gray-400">© 2024 IntelliDocs AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy</a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Terms</a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Security</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
