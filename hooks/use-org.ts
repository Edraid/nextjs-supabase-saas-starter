'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface OrgMembership {
  org_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  org: {
    id: string
    name: string
    slug: string
    plan: string
  } | null
}

interface OrgState {
  membership: OrgMembership | null
  loading: boolean
  isOwner: boolean
  isAdmin: boolean
  canManageMembers: boolean
}

/**
 * useOrg — returns the current user's primary organization membership.
 * Pass orgId to look up a specific org, or omit to get the user's first org.
 */
export function useOrg(orgId?: string | null): OrgState {
  const [state, setState] = useState<OrgState>({
    membership: null,
    loading: true,
    isOwner: false,
    isAdmin: false,
    canManageMembers: false,
  })

  const supabase = createClient()

  useEffect(() => {
    let query = supabase
      .from('organization_members')
      .select('org_id, role, organizations(id, name, slug, plan)')

    if (orgId) {
      query = query.eq('org_id', orgId) as typeof query
    } else {
      query = query.order('created_at', { ascending: true }).limit(1) as typeof query
    }

    query.single().then(({ data }) => {
      if (!data) {
        setState({ membership: null, loading: false, isOwner: false, isAdmin: false, canManageMembers: false })
        return
      }

      const membership: OrgMembership = {
        org_id: data.org_id,
        role: data.role as OrgMembership['role'],
        org: data.organizations as OrgMembership['org'],
      }

      setState({
        membership,
        loading: false,
        isOwner: membership.role === 'owner',
        isAdmin: ['owner', 'admin'].includes(membership.role),
        canManageMembers: ['owner', 'admin'].includes(membership.role),
      })
    })
  }, [orgId, supabase])

  return state
}
