import { requestNow } from "@/lib/time";
import type { Metadata } from "next";
import Link from "next/link";
import { ProfessorSessionCard } from "@/components/sessions/ProfessorSessionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkTabs } from "@/components/ui/Tabs";
import { requireRole } from "@/lib/auth/session";
import { loadProfessorSessionsView } from "@/lib/data/views";
import { sessionBucket } from "@/lib/domain/sessionRules";
import { Roles } from "@/models/roles";

export const metadata: Metadata = { title: "Mis monitorías" };

const TABS = [
  { key: "proximas", label: "Próximas" },
  { key: "realizadas", label: "Realizadas" },
  { key: "canceladas", label: "Canceladas" },
] as const;

export default async function ProfessorSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { profile } = await requireRole([Roles.PROFESSOR]);
  const { tab } = await searchParams;
  const active = TABS.find((t) => t.key === tab)?.key ?? "proximas";

  const now = requestNow();
  const view = await loadProfessorSessionsView(profile.id);
  const withBucket = view.sessions.map((s) => ({ s, bucket: sessionBucket(s, now) }));

  const groups = {
    // Por cerrar primero, luego próximas en orden cronológico.
    proximas: withBucket
      .filter((x) => x.bucket === "upcoming" || x.bucket === "pendingClose")
      .sort((a, b) =>
        a.bucket === b.bucket ? a.s.startAt - b.s.startAt : a.bucket === "pendingClose" ? -1 : 1,
      ),
    realizadas: withBucket.filter((x) => x.bucket === "completed"),
    canceladas: withBucket.filter((x) => x.bucket === "cancelled"),
  };
  const list = groups[active];

  return (
    <>
      <PageHeader
        title="Mis monitorías"
        description="Monitorías reservadas por los estudiantes en tus horarios."
      />
      <LinkTabs
        active={active}
        tabs={TABS.map((t) => ({
          key: t.key,
          label: t.label,
          href: `/professor/sessions?tab=${t.key}`,
          count: groups[t.key].length,
        }))}
      />

      {list.length === 0 ? (
        <EmptyState
          icon="layers"
          title={
            active === "proximas"
              ? "No tienes monitorías próximas"
              : active === "realizadas"
                ? "Aún no tienes monitorías realizadas"
                : "No tienes monitorías canceladas"
          }
          description={
            active === "proximas"
              ? "Cuando un estudiante reserve uno de tus horarios, la monitoría aparecerá aquí."
              : "Aquí verás el registro correspondiente."
          }
        >
          {active === "proximas" ? (
            <Link href="/professor/availability" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Publicar disponibilidad
            </Link>
          ) : null}
        </EmptyState>
      ) : (
        <ul className="space-y-4">
          {list.map(({ s }) => (
            <li key={s.id}>
              <ProfessorSessionCard
                session={s}
                subjectName={view.subjectName(s.subjectId)}
                participants={view.participantsOf(s.participantIds)}
                meeting={view.meetings.get(s.id)}
                now={now}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
