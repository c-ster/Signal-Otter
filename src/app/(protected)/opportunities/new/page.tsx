import { OpportunityForm } from "@/components/forms/opportunity-form";

export default function NewOpportunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Opportunity</h1>
        <p className="text-muted-foreground">
          Target a company and role to generate your candidate page.
        </p>
      </div>
      <OpportunityForm />
    </div>
  );
}
