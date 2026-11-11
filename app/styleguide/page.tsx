import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// This page is only for checking the look. The sample labels on it are
// placeholders, not app content.

export const metadata: Metadata = {
  title: "Style guide | ReelWright",
  robots: { index: false },
};

const navLinks = [
  { href: "/styleguide#colours", label: "Colours" },
  { href: "/styleguide#type", label: "Type" },
  { href: "/styleguide#shape", label: "Shape and spacing" },
  { href: "/styleguide#buttons", label: "Buttons" },
  { href: "/styleguide#cards", label: "Cards and badges" },
  { href: "/styleguide#forms", label: "Forms" },
  { href: "/styleguide#tables", label: "Tables" },
  { href: "/styleguide#feedback", label: "Progress and loading" },
  { href: "/styleguide#shell", label: "App shell" },
];

// Each swatch shows a background token with the text token used on top of it.
// Class names are written out in full so Tailwind can find them.
const swatches: Array<{ name: string; pairedWith: string; classes: string }> = [
  { name: "background", pairedWith: "text", classes: "bg-background text-foreground" },
  { name: "background", pairedWith: "text-muted", classes: "bg-background text-muted" },
  { name: "surface", pairedWith: "text", classes: "bg-surface text-foreground" },
  { name: "surface", pairedWith: "text-muted", classes: "bg-surface text-muted" },
  { name: "border", pairedWith: "text", classes: "bg-border text-foreground" },
  { name: "border-strong", pairedWith: "text", classes: "bg-border-strong text-foreground" },
  { name: "accent", pairedWith: "accent-contrast", classes: "bg-accent text-accent-contrast" },
  { name: "accent-soft", pairedWith: "accent-soft-text", classes: "bg-accent-soft text-accent-soft-text" },
  { name: "success-soft", pairedWith: "success-text", classes: "bg-success-soft text-success-text" },
  { name: "warning-soft", pairedWith: "warning-text", classes: "bg-warning-soft text-warning-text" },
  { name: "danger-soft", pairedWith: "danger-text", classes: "bg-danger-soft text-danger-text" },
  { name: "inverse", pairedWith: "inverse-contrast", classes: "bg-inverse text-inverse-contrast" },
];

const typeScale: Array<{ label: string; classes: string }> = [
  { label: "Heading 30px, Space Grotesk 600", classes: "font-heading text-3xl font-semibold" },
  { label: "Heading 24px, Space Grotesk 600", classes: "font-heading text-2xl font-semibold" },
  { label: "Heading 20px, Space Grotesk 600", classes: "font-heading text-xl font-semibold" },
  { label: "Heading 16px, Space Grotesk 500", classes: "font-heading text-base font-medium" },
  { label: "Body 14px, Inter 400 (base size)", classes: "text-sm" },
  { label: "Body 14px, Inter 500", classes: "text-sm font-medium" },
  { label: "Body 14px, Inter 600", classes: "text-sm font-semibold" },
  { label: "Small 12px, Inter 400", classes: "text-xs" },
];

const spacingSteps: Array<{ label: string; classes: string }> = [
  { label: "4px", classes: "w-1" },
  { label: "8px", classes: "w-2" },
  { label: "12px", classes: "w-3" },
  { label: "16px", classes: "w-4" },
  { label: "24px", classes: "w-6" },
  { label: "32px", classes: "w-8" },
  { label: "48px", classes: "w-12" },
];

const sampleRows = [
  { title: "Launch teaser", type: "Video", status: "Scheduled", date: "12 Mar 2026", platform: "Instagram" },
  { title: "Cover reveal", type: "Image", status: "Posted", date: "8 Mar 2026", platform: "TikTok" },
  { title: "Behind the scenes", type: "Video", status: "Failed", date: "5 Mar 2026", platform: "YouTube" },
];

const statusVariant = {
  Scheduled: "info",
  Posted: "success",
  Failed: "danger",
} as const;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="mb-4 font-heading text-xl font-semibold">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

export default function StyleGuidePage() {
  return (
    <AppShell
      siteName="ReelWright"
      roleLabel="Sample role"
      navLinks={navLinks}
      activeHref="/styleguide#colours"
      title="Style guide"
      subtitle="Every colour, text style and component, for checking light and dark mode."
      actions={
        <>
          <Button variant="secondary">Secondary action</Button>
          <Button>Primary action</Button>
        </>
      }
      sidebarFooter={
        <Card>
          <p className="font-medium">Info card slot</p>
          <p className="mt-1 text-xs text-muted">
            A small card can sit here, for example usage this month.
          </p>
          <ProgressBar value={40} label="Sample usage" className="mt-3" />
        </Card>
      }
    >
      <div className="flex max-w-5xl flex-col gap-12">
        <Section id="colours" title="Colours">
          <p className="text-muted">
            Each block is a background token with the text token that goes on it.
            Use the theme switch to check the dark values.
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {swatches.map((swatch) => (
              <li
                key={`${swatch.name}-${swatch.pairedWith}`}
                className={`rounded-card border p-4 ${swatch.classes}`}
              >
                <p className="font-heading text-xl font-semibold">Aa 123</p>
                <p className="mt-2 font-medium">{swatch.name}</p>
                <p className="text-xs">with {swatch.pairedWith}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="type" title="Type">
          <Card>
            <ul className="flex flex-col gap-4">
              {typeScale.map((item) => (
                <li key={item.label}>
                  <p className={item.classes}>The quick brown fox 0123456789</p>
                  <p className="text-xs text-muted">{item.label}</p>
                </li>
              ))}
              <li>
                <p className="font-heading text-3xl font-semibold">12,480</p>
                <p className="text-xs text-muted">Big number, Space Grotesk 600</p>
              </li>
            </ul>
          </Card>
        </Section>

        <Section id="shape" title="Shape and spacing">
          <Card title="Corner radius">
            <Row>
              <div className="flex h-16 w-32 items-center justify-center rounded-control border border-border-strong text-xs">
                Controls 8px
              </div>
              <div className="flex h-16 w-32 items-center justify-center rounded-card border border-border-strong text-xs">
                Cards 12px
              </div>
              <div className="flex h-16 w-32 items-center justify-center rounded-pill border border-border-strong text-xs">
                Pills
              </div>
            </Row>
          </Card>
          <Card title="Spacing (steps of 4px)">
            <ul className="flex flex-wrap items-end gap-4">
              {spacingSteps.map((step) => (
                <li key={step.label} className="flex flex-col items-center gap-1">
                  <div className={`h-8 rounded-control bg-accent ${step.classes}`} />
                  <span className="text-xs text-muted">{step.label}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Shadow">
            <div className="inline-flex h-16 items-center rounded-card bg-surface px-6 shadow-float">
              Soft shadow for floating elements
            </div>
          </Card>
        </Section>

        <Section id="buttons" title="Buttons">
          <Card title="Medium">
            <Row>
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </Row>
          </Card>
          <Card title="Small">
            <Row>
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
              <Button size="sm" variant="ghost">Ghost</Button>
            </Row>
          </Card>
          <Card title="Loading">
            <Row>
              <Button loading>Primary</Button>
              <Button loading variant="secondary">Secondary</Button>
              <Button loading variant="ghost">Ghost</Button>
              <Button loading size="sm">Small</Button>
            </Row>
          </Card>
          <Card title="Disabled">
            <Row>
              <Button disabled>Primary</Button>
              <Button disabled variant="secondary">Secondary</Button>
              <Button disabled variant="ghost">Ghost</Button>
              <Button disabled size="sm">Small</Button>
            </Row>
          </Card>
          <Card title="Theme toggle">
            <Row>
              <ThemeToggle />
              <span className="text-muted">
                Switches light and dark mode and remembers the choice.
              </span>
            </Row>
          </Card>
        </Section>

        <Section id="cards" title="Cards and badges">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <p>A plain card with content only.</p>
            </Card>
            <Card title="Card with title">
              <p className="text-muted">Content sits under the title.</p>
            </Card>
            <Card
              title="Title and action"
              action={
                <Button size="sm" variant="secondary">
                  Action
                </Button>
              }
            >
              <p className="text-muted">The action sits at the top right.</p>
            </Card>
          </div>
          <Card title="Badges">
            <Row>
              <Badge>Neutral</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
            </Row>
          </Card>
          <Card title="Avatars">
            <Row>
              <Avatar name="Sample Person" size="sm" />
              <Avatar name="Sample Person" />
              <Avatar name="Sample Person" size="lg" />
              <Avatar name="Mononym" />
              <span className="text-muted">
                Shows a round picture when one is given, initials when not.
              </span>
            </Row>
          </Card>
        </Section>

        <Section id="forms" title="Forms">
          <Card>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input label="Input" placeholder="Placeholder text" />
              <Input
                label="Input with error"
                defaultValue="not-an-email"
                error="Enter a valid email address."
              />
              <Input label="Disabled input" defaultValue="Cannot be changed" disabled />
              <Select label="Select" defaultValue="video">
                <option value="image">Image</option>
                <option value="video">Video</option>
              </Select>
              <Select label="Select with error" defaultValue="" error="Choose an option.">
                <option value="" disabled>
                  Choose one
                </option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </Select>
              <Select label="Disabled select" defaultValue="image" disabled>
                <option value="image">Image</option>
              </Select>
              <Textarea label="Textarea" placeholder="Write something" />
              <Textarea
                label="Textarea with error"
                defaultValue="Too short"
                error="Write at least 20 characters."
              />
            </div>
          </Card>
        </Section>

        <Section id="tables" title="Tables">
          <p className="text-muted">
            On a narrow screen the table scrolls sideways inside its frame.
          </p>
          <Table label="Sample posts">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Platform</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleRows.map((row) => (
                <TableRow key={row.title}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[row.status as keyof typeof statusVariant]}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">{row.date}</TableCell>
                  <TableCell className="text-muted">{row.platform}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Section id="feedback" title="Progress and loading">
          <Card title="Progress bar">
            <div className="flex flex-col gap-4">
              <ProgressBar value={0} label="Sample progress, empty" />
              <ProgressBar value={35} label="Sample progress, 35 percent" />
              <ProgressBar value={80} label="Sample progress, 80 percent" />
              <ProgressBar value={100} label="Sample progress, complete" />
            </div>
          </Card>
          <Card title="Skeleton">
            <div className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-pill" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </Card>
          <EmptyState
            title="Nothing here yet"
            description="One line of help explains what to do next."
            action={<Button>Do the first thing</Button>}
          />
        </Section>

        <Section id="shell" title="App shell">
          <Card>
            <p>
              This whole page sits inside the app shell: the side menu with the
              site name, role badge, links, info card and theme switch; the page
              heading with action buttons; and the floating assistant button at
              the bottom right.
            </p>
            <p className="mt-2 text-muted">
              Make the window narrow, or open this on a phone, to see the side
              menu collapse behind the menu button.
            </p>
          </Card>
        </Section>
      </div>
    </AppShell>
  );
}
