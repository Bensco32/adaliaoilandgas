import type { Metadata } from "next";
import { SupplierRegistrationPage } from "@/components/SupplierRegistrationPage";

export const metadata: Metadata = {
  title: "Supplier Registration - ADALIA OIL AND GAS LTD",
  description:
    "Apply to become an Adalia Oil and Gas Ltd supplier or contractor. Provide your company details, services and supporting documents for our team to review."
};

export default function SuppliersPage() {
  return (
    <div>
      <div className="bg-navy-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Supplier Registration</h1>
        <p className="mt-3 text-gold-300">Become a trusted supplier or contractor for ADALIA OIL AND GAS LTD</p>
      </div>
      <section className="section-padding bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <p className="text-slate-600">
            Register your company as a potential supplier or contractor for our divisions. Submitting a registration does not guarantee approval — our team reviews each application before confirming participation.
          </p>
        </div>
      </section>
      <SupplierRegistrationPage />
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl font-bold text-navy-900">What happens after I submit?</h2>
          <ol className="mt-4 space-y-3 text-slate-700">
            <li>1. Our team reviews your application and supporting documents.</li>
            <li>2. We may request additional information or clarification.</li>
            <li>3. Approved suppliers are added to our vendor records and may be invited to participate in new opportunities.</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
