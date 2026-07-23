import { useQuery } from '@tanstack/react-query'
import { Card, Empty } from '../components/ui'
import { PageHeader } from '../layouts/app-layout'
import { employeeService } from '../services/ems.service'
import { Mail, Phone, Shield, User, Users } from 'lucide-react'
import { title } from '../utils/format'

function TeamMemberCard({ member, badgeText }: { member: any; badgeText?: string }) {
  const profile = member.user ?? {}
  return (
    <Card className="hover:shadow-md transition">
      <div className="flex items-start gap-4 text-left">
        {member.profileImageUrl ? (
          <img src={member.profileImageUrl} alt={`${member.firstName} ${member.lastName}`} className="size-12 rounded-full object-cover border border-slate-200" />
        ) : (
          <div className="grid size-12 place-items-center rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-800 text-sm leading-tight">{member.firstName} {member.lastName}</h3>
            {badgeText && (
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{member.designation} ({member.employeeCode})</p>
          <div className="mt-3 space-y-1.5 border-t border-slate-50 pt-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mail className="size-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{member.email ?? profile.email ?? 'Not available'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Phone className="size-3.5 text-slate-400 shrink-0" />
              <span>{member.phone ?? profile.phone ?? 'Not available'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Shield className="size-3.5 text-slate-400 shrink-0" />
              <span>{title(profile.role ?? 'EMPLOYEE')}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function TeamPage() {
  const query = useQuery({ queryKey: ['team'], queryFn: employeeService.myTeam })

  const { manager, peers, subordinates } = query.data ?? { manager: null, peers: [], subordinates: [] }

  const hasSubordinates = subordinates.length > 0
  const hasPeers = peers.length > 0
  const hasManager = !!manager

  return (
    <>
      <PageHeader
        title="My Team"
        description="View your reporting manager, co-workers (peers), and subordinates."
      />

      {query.isLoading ? (
        <Empty>Loading team structure…</Empty>
      ) : !hasManager && !hasPeers && !hasSubordinates ? (
        <Empty>You are currently not linked to any managers or subordinates in the workspace directory.</Empty>
      ) : (
        <div className="space-y-8">
          {/* Manager Section */}
          {hasManager && (
            <section className="text-left">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <User className="size-4 text-slate-400" />
                Reporting Manager
              </h2>
              <div className="max-w-md">
                <TeamMemberCard member={manager} badgeText="Manager" />
              </div>
            </section>
          )}

          {/* Peers Section */}
          {hasPeers && (
            <section className="text-left">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Users className="size-4 text-slate-400" />
                Co-workers (Peers)
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {peers.map((peer: any) => (
                  <TeamMemberCard key={peer.id} member={peer} />
                ))}
              </div>
            </section>
          )}

          {/* Subordinates Section */}
          {hasSubordinates && (
            <section className="text-left">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Users className="size-4 text-slate-400" />
                Direct Reports (Subordinates)
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subordinates.map((sub: any) => (
                  <TeamMemberCard key={sub.id} member={sub} badgeText="Direct Report" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  )
}
