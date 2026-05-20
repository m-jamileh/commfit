"use client";
import { Paperclip, Clock } from "lucide-react";
import { PageHeader, Card, Pill } from "@commfit/ui";

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  receivedAt: string;
  read: boolean;
  hasAttachment?: boolean;
  tag?: "contract" | "invoice" | "sr" | "general";
}

const MOCK_EMAILS: EmailMessage[] = [
  {
    id: "em-001",
    from: "billing@sunsetproperties.com",
    subject: "Re: Contract Renewal — Sunset Properties 2025",
    preview: "Hi team, we're happy to proceed with the renewal terms as discussed. Please send the DocuSign...",
    receivedAt: "2026-05-20T09:14:00",
    read: false,
    tag: "contract",
  },
  {
    id: "em-002",
    from: "kmarsh@marriottplano.com",
    subject: "Urgent: Treadmill Belt Issue - Guest Complaint",
    preview: "One of our guests slipped this morning on treadmill #3. The belt appears to be misaligned and...",
    receivedAt: "2026-05-20T08:02:00",
    read: false,
    hasAttachment: true,
    tag: "sr",
  },
  {
    id: "em-003",
    from: "ramirez@pianoisd.edu",
    subject: "Invoice Question INV-2025-0139",
    preview: "I'm reviewing invoice INV-2025-0139 and I notice a charge for warranty work. We believed this would be covered...",
    receivedAt: "2026-05-19T16:45:00",
    read: true,
    tag: "invoice",
  },
  {
    id: "em-004",
    from: "noreply@docusign.com",
    subject: "Completed: Plano ISD Annual PM Contract FY2025-2026",
    preview: "Your document has been completed. All parties have signed the Plano ISD Annual Preventive Maintenance...",
    receivedAt: "2026-05-19T14:30:00",
    read: true,
    hasAttachment: true,
    tag: "contract",
  },
  {
    id: "em-005",
    from: "dlewis@hiltonallen.com",
    subject: "PM Schedule Confirmation Q2 2025",
    preview: "Thank you for the confirmation of our Q2 preventive maintenance schedule. Please note we have an event...",
    receivedAt: "2026-05-19T11:15:00",
    read: true,
    tag: "general",
  },
  {
    id: "em-006",
    from: "aford@courtyardfrisco.com",
    subject: "Disinfecting Service — Access Code Change",
    preview: "Please note the gym access code has been changed to 5821 effective immediately. Please inform your technicians...",
    receivedAt: "2026-05-18T16:00:00",
    read: true,
    tag: "general",
  },
];

const tagColors = {
  contract: "info",
  invoice: "warning",
  sr: "danger",
  general: "default",
} as const;

function formatEmailTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function EmailInboxPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Email Inbox"
        breadcrumbs={[{ label: "Settings" }, { label: "Email Inbox" }]}
        description="Admin view — forwarded emails from customer-facing addresses"
      />
      <Card padding="none">
        {MOCK_EMAILS.map((email) => (
          <div
            key={email.id}
            className={`flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-bg/50 transition-colors cursor-pointer ${!email.read ? "bg-info/3" : ""}`}
          >
            <div className="mt-0.5 shrink-0">
              <div className={`h-2 w-2 rounded-full mt-1.5 ${email.read ? "bg-transparent" : "bg-accent"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-0.5">
                <p className={`text-sm truncate ${email.read ? "text-text-secondary" : "font-semibold text-text-primary"}`}>
                  {email.from}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  {email.hasAttachment && <Paperclip className="h-3 w-3 text-text-muted" />}
                  {email.tag && (
                    <Pill color={tagColors[email.tag]}>{email.tag}</Pill>
                  )}
                  <span className="text-xs text-text-muted flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {formatEmailTime(email.receivedAt)}
                  </span>
                </div>
              </div>
              <p className={`text-sm truncate mb-0.5 ${email.read ? "text-text-secondary" : "font-medium text-text-primary"}`}>
                {email.subject}
              </p>
              <p className="text-xs text-text-muted truncate">{email.preview}</p>
            </div>
          </div>
        ))}
      </Card>
      <p className="text-xs text-text-muted text-center">Admin only — read-only inbox view. Reply via email client.</p>
    </div>
  );
}
