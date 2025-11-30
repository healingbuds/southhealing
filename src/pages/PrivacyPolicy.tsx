import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import { Shield, Lock, Eye, FileText, Users, Globe } from "lucide-react";

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation("legal");
  
  const formatDate = () => {
    const locale = i18n.language === 'pt' ? 'pt-PT' : 'en-US';
    return new Date().toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <Shield className="w-16 h-16 text-primary" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t("privacy.title")}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t("privacy.lastUpdated")} {formatDate()}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-8 text-foreground/90">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold">{t("privacy.introduction.title")}</h2>
                </div>
                <p className="leading-relaxed mb-4">
                  {t("privacy.introduction.content")}
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold">{t("privacy.informationCollect.title")}</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t("privacy.informationCollect.personal.title")}</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      {(t("privacy.informationCollect.personal.items", { returnObjects: true }) as string[]).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t("privacy.informationCollect.automatic.title")}</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      {(t("privacy.informationCollect.automatic.items", { returnObjects: true }) as string[]).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold">{t("privacy.howWeUse.title")}</h2>
                </div>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  {(t("privacy.howWeUse.items", { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold">{t("privacy.informationSharing.title")}</h2>
                </div>
                <p className="leading-relaxed mb-4">{t("privacy.informationSharing.intro")}</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  {(t("privacy.informationSharing.items", { returnObjects: true }) as Array<{ label: string; desc: string }>).map((item, index) => (
                    <li key={index}><strong>{item.label}</strong> {item.desc}</li>
                  ))}
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold">{t("privacy.dataSecurity.title")}</h2>
                </div>
                <p className="leading-relaxed mb-4">
                  {t("privacy.dataSecurity.intro")}
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  {(t("privacy.dataSecurity.items", { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">{t("privacy.yourRights.title")}</h2>
                <p className="leading-relaxed mb-4">
                  {t("privacy.yourRights.intro")}
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  {(t("privacy.yourRights.items", { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">{t("privacy.blockchain.title")}</h2>
                <p className="leading-relaxed">
                  {t("privacy.blockchain.content")}
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">{t("privacy.international.title")}</h2>
                <p className="leading-relaxed">
                  {t("privacy.international.content")}
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">{t("privacy.children.title")}</h2>
                <p className="leading-relaxed">
                  {t("privacy.children.content")}
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">{t("privacy.changes.title")}</h2>
                <p className="leading-relaxed">
                  {t("privacy.changes.content")}
                </p>
              </section>

              <section className="bg-card p-6 rounded-lg border border-border">
                <h2 className="font-display text-2xl font-bold mb-4">{t("privacy.contact.title")}</h2>
                <p className="leading-relaxed mb-4">
                  {t("privacy.contact.content")}
                </p>
                <div className="space-y-2">
                  <p><strong>{t("privacy.contact.email")}</strong> privacy@healingbuds.com</p>
                  <p><strong>{t("privacy.contact.address")}</strong> {t("privacy.contact.addressValue")}</p>
                </div>
              </section>
            </div>
          </div>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy;
