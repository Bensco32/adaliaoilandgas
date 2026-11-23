import { HeroSlider } from "@/components/HeroSlider";
import { AboutSection } from "@/components/AboutSection";
import { DivisionsSection } from "@/components/DivisionsSection";
import { WhyChooseSection } from "@/components/WhyChooseSection";
import { HSESection } from "@/components/HSESection";
import { ValuesSection } from "@/components/ValuesSection";
import { GallerySection } from "@/components/GallerySection";
import { FAQSection } from "@/components/FAQSection";
import { ContactSection } from "@/components/ContactSection";
import { SeoStructuredData } from "@/components/SeoStructuredData";
import { HsePoliciesList } from "@/components/HsePoliciesList";
import { ProjectsSummary } from "@/components/ProjectsSummary";

// Displayed content comes from the admin-editable settings store — force
// dynamic so admin changes appear immediately on public pages.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <SeoStructuredData />
      <HeroSlider />
      <AboutSection />
      <DivisionsSection />
      <WhyChooseSection />
      <HSESection />
      <ValuesSection />
      <GallerySection />
      <FAQSection />
      <ProjectsSummary />
      <ContactSection />
    </>
  );
}
