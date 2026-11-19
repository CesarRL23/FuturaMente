import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import { RoleLabels } from "@/models/roles";
import type { UserProfile } from "@/models/user";

/** Datos básicos de la cuenta (solo lectura). */
export function ProfileSummary({ profile, photoURL }: { profile: UserProfile; photoURL?: string | null }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar name={profile.name} photoURL={photoURL} size="lg" />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-900">{profile.name}</p>
          <p className="truncate text-sm text-slate-600">{profile.email}</p>
        </div>
      </div>
      <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Roles</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {profile.roles.map((r) => (
              <Badge key={r} variant="brand">
                {RoleLabels[r]}
              </Badge>
            ))}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Miembro desde</dt>
          <dd className="mt-1 text-sm text-slate-800">{formatDate(profile.createdAt)}</dd>
        </div>
      </dl>
    </Card>
  );
}
