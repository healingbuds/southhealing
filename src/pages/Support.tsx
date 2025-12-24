import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  MessageCircle, 
  HelpCircle,
  Package,
  Shield,
  Truck,
  FileText,
  User
} from 'lucide-react';
import Header from "@/layout/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import SEOHead from "@/components/SEOHead";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGeoLocation } from "@/hooks/useGeoLocation";

const faqCategories = [
  {
    id: 'eligibility',
    title: 'Eligibility & Assessment',
    icon: Shield,
    questions: [
      {
        question: 'Who is eligible for medical cannabis?',
        answer: 'Medical cannabis is available for patients with qualifying conditions across multiple medical specialties including pain management (chronic pain, neuropathy, fibromyalgia), psychiatry (PTSD, anxiety, insomnia), neurology (epilepsy, MS, Parkinson\'s), gastroenterology (Crohn\'s, IBS), and palliative care. Our medical team evaluates each case individually.'
      },
      {
        question: 'How do I start the eligibility process?',
        answer: 'Complete our quick eligibility questionnaire (under 5 minutes) with your basic health information. If eligible, you\'ll be connected with a licensed medical professional for a consultation to discuss your treatment options and design a personalized plan.'
      },
      {
        question: 'What is the approval rate?',
        answer: 'We have a 98% approval rate for patients who complete the eligibility process. Our licensed medical professionals work with you to understand your condition and determine if medical cannabis is appropriate for your treatment.'
      },
      {
        question: 'How long does the verification process take?',
        answer: 'Identity verification (KYC) is typically completed within 24-48 hours. Medical review and consultation usually takes 2-5 business days. You will receive email notifications at each stage of the process.'
      },
      {
        question: 'What documents do I need for verification?',
        answer: 'You will need a valid government-issued ID (passport, driver\'s license, or national ID card) linked to your home address for identity verification. This ensures compliance with local regulations and secure delivery.'
      }
    ]
  },
  {
    id: 'products',
    title: 'Products & Quality',
    icon: Package,
    questions: [
      {
        question: 'What products are available?',
        answer: 'We offer pharmaceutical-grade medical cannabis products including dried flower, oils, and other formulations. All products are produced in EU GMP certified facilities with full quality control. Product availability varies by country and is subject to local regulations.'
      },
      {
        question: 'What quality standards do your products meet?',
        answer: 'All products are EU GMP (Good Manufacturing Practice) certified and produced in state-of-the-art pharmaceutical facilities. Every batch undergoes rigorous third-party lab testing for potency, purity, and contaminants. We maintain full seed-to-sale traceability using blockchain technology.'
      },
      {
        question: 'How is product packaging handled?',
        answer: 'All products are packaged to pharmaceutical standards with child-resistant, UV-resistant, and tamper-evident containers. Each package includes a QR code for complete traceability verification, allowing you to view the full journey from cultivation to delivery.'
      },
      {
        question: 'How do I place an order?',
        answer: 'Once your eligibility is verified, you can browse our product catalog and add items to your cart. Proceed to checkout to complete your order. Payment options and delivery methods will be displayed during checkout.'
      },
      {
        question: 'Can I order if I am not verified?',
        answer: 'No. For compliance and safety reasons, only verified patients can access the shop and place orders. This ensures that medical cannabis is only provided to eligible patients under proper medical supervision as required by law.'
      }
    ]
  },
  {
    id: 'account',
    title: 'Account & Verification',
    icon: User,
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Sign In" in the navigation and select "Create Account". You can register with your email address. After creating an account, you can begin the eligibility assessment process.'
      },
      {
        question: 'What is KYC verification?',
        answer: 'KYC (Know Your Customer) is a secure identity verification process required for all patients. It confirms your identity and age using a valid ID linked to your home address, ensuring compliance with medical cannabis regulations. The process is secure and your data is protected.'
      },
      {
        question: 'How do I check my verification status?',
        answer: 'Log in to your account and visit the Eligibility page or your Patient Dashboard. Your current verification status will be displayed, including any pending steps you need to complete.'
      },
      {
        question: 'My verification was rejected. What do I do?',
        answer: 'If your verification was rejected, you will receive an email explaining the reason. Common issues include unclear ID photos, ID not matching your registered address, or missing information. You can resubmit your verification or contact our support team for assistance.'
      }
    ]
  },
  {
    id: 'delivery',
    title: 'Delivery & Shipping',
    icon: Truck,
    questions: [
      {
        question: 'Where do you deliver?',
        answer: 'We currently deliver nationwide within Portugal, South Africa, Thailand, and the United Kingdom. Delivery is only available within countries where we are licensed to operate. Shipping addresses must match your verified account details for security and compliance.'
      },
      {
        question: 'How long does delivery take?',
        answer: 'Delivery times vary by location. Typically, orders are dispatched within 1-2 business days and delivery takes 3-7 business days depending on your location. Express shipping options may be available in some regions.'
      },
      {
        question: 'How is my order packaged?',
        answer: 'All orders are shipped in discreet, secure packaging with no external branding that indicates the contents. Products are in child-resistant, UV-protected, tamper-evident containers and properly sealed to maintain quality and comply with shipping regulations.'
      },
      {
        question: 'Can I track my order?',
        answer: 'Yes. Once your order is dispatched, you will receive a tracking number via email. You can also view order status and tracking information in your Patient Dashboard under Orders.'
      }
    ]
  },
  {
    id: 'legal',
    title: 'Legal & Compliance',
    icon: FileText,
    questions: [
      {
        question: 'Is medical cannabis legal?',
        answer: 'Medical cannabis is legal for qualifying patients in the countries where we operate, subject to local regulations. In South Africa, medical cannabis access is regulated by SAHPRA (South African Health Products Regulatory Authority). Our products and processes are fully compliant with all applicable regulations.'
      },
      {
        question: 'Do I need a prescription?',
        answer: 'Requirements vary by country. In South Africa, THC-containing products require a medical script issued by a licensed healthcare practitioner. Our consultation and verification process ensures you meet all local requirements for accessing medical cannabis legally.'
      },
      {
        question: 'How is my data protected?',
        answer: 'We take data protection seriously. All personal and medical information is encrypted and stored securely in compliance with GDPR, POPIA (in South Africa), and local data protection regulations. We never share your information with third parties without your explicit consent.'
      },
      {
        question: 'What regulatory bodies oversee your products?',
        answer: 'Our products are produced under EU GMP standards in licensed pharmaceutical facilities. Depending on your location, oversight includes SAHPRA (South Africa), INFARMED (Portugal), Thai FDA (Thailand), and relevant UK authorities. All products maintain complete seed-to-sale traceability verified via blockchain.'
      }
    ]
  }
];

const Support = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const locationConfig = useGeoLocation();

  return (
    <PageTransition>
      <SEOHead 
        title="Support & FAQ | Healing Buds"
        description="Get answers to frequently asked questions about medical cannabis eligibility, ordering, delivery, and more. Contact our support team for assistance."
        canonical="/support"
      />
      <div className="min-h-screen bg-background">
        <Header onMenuStateChange={setMenuOpen} />
        
        <main className="pt-24 pb-16">
          {/* Hero Section */}
          <section className="relative py-16 lg:py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <HelpCircle className="w-12 h-12 text-primary mx-auto mb-6" />
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                    How Can We Help?
                  </h1>
                  <p className="font-body text-lg text-muted-foreground mb-8">
                    Find answers to common questions or contact our support team.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section className="py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="grid sm:grid-cols-3 gap-4">
                  <Link to="/eligibility">
                    <Card className="h-full hover:border-primary/30 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <Shield className="w-8 h-8 text-primary mb-3" />
                        <h3 className="font-semibold text-foreground mb-1">Check Eligibility</h3>
                        <p className="text-sm text-muted-foreground">Start your assessment</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/shop">
                    <Card className="h-full hover:border-primary/30 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <Package className="w-8 h-8 text-primary mb-3" />
                        <h3 className="font-semibold text-foreground mb-1">Browse Products</h3>
                        <p className="text-sm text-muted-foreground">View our catalog</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/dashboard">
                    <Card className="h-full hover:border-primary/30 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <User className="w-8 h-8 text-primary mb-3" />
                        <h3 className="font-semibold text-foreground mb-1">Patient Portal</h3>
                        <p className="text-sm text-muted-foreground">Manage your account</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Sections */}
          <section className="py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
                >
                  <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                    Frequently Asked Questions
                  </h2>
                </motion.div>

                <div className="space-y-8">
                  {faqCategories.map((category, categoryIndex) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: categoryIndex * 0.1 }}
                    >
                      <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/30">
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <category.icon className="w-5 h-5 text-primary" />
                            {category.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Accordion type="single" collapsible className="w-full">
                            {category.questions.map((faq, index) => (
                              <AccordionItem key={index} value={`${category.id}-${index}`} className="border-b last:border-b-0">
                                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-muted/20">
                                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4 pt-0">
                                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <MessageCircle className="w-12 h-12 text-primary mx-auto mb-6" />
                  <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                    Still Need Help?
                  </h2>
                  <p className="font-body text-muted-foreground mb-8">
                    Our support team is here to assist you with any questions or concerns.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                      <a href={`mailto:${locationConfig.email}`}>
                        <Mail className="w-5 h-5 mr-2" />
                        Email Support
                      </a>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-6">
                    Response time: Within 24-48 hours
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <BackToTop />
      </div>
    </PageTransition>
  );
};

export default Support;
