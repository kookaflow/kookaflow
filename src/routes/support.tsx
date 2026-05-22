import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — Kookaflow" },
      { name: "description", content: "Get help with Kookaflow. FAQs and contact." },
    ],
  }),
  component: SupportPage,
});

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How do I add a shift?",
    a: "Tap the + button or use the quick-add panel at the bottom of the calendar. Select a shift type and tap any date.",
  },
  {
    q: "How do I connect Google Calendar?",
    a: "Go to Settings → Connected Calendars → Connect Google Calendar.",
  },
  {
    q: "How do I delete an event?",
    a: "Tap the event on the calendar to open it, then tap the delete button at the bottom.",
  },
  {
    q: "How do I enable push notifications?",
    a: "Go to Settings → Reminders and enable Push Notifications.",
  },
  {
    q: "How is my Balance Score calculated?",
    a: "Your Balance Score measures how evenly your time is distributed across life categories. A score above 80 means great balance.",
  },
  {
    q: "Can I export my data?",
    a: "Email support@kookaflow.com and we will send you a copy of your data within 7 days.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Settings → scroll to bottom → Delete Account. This permanently removes all your data.",
  },
];

function SupportPage() {
  return (
    <LegalPage title="How can we help?" subtitle="We're here to support your flow.">
      <p className="not-prose">
        <a
          href="mailto:support@kookaflow.com"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent"
        >
          <Mail className="size-4 text-primary" />
          support@kookaflow.com
        </a>
      </p>

      <h2>Frequently asked questions</h2>
      <div className="not-prose">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </LegalPage>
  );
}