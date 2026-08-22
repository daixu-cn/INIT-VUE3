declare namespace Model {
  namespace DiscoveryFacets {
    interface Facet {
      discoveryFacetId: string
      dimension: "PURPOSE" | "PERSONALITY" | "RELATIONSHIP" | "WORLD"
      code: string
      labelZhHans: string
      labelZhHant: string
      labelEn: string
      labelJa: string
      labelDe: string
      sortOrder: number
      status: "ACTIVE" | "HIDDEN" | "DEPRECATED"
      replacementFacetId: string | null
      replacement: { code: string } | null
      _count: { profiles: number }
    }

    interface Candidate {
      discoveryFacetCandidateId: string
      dimension: Facet["dimension"]
      normalizedValue: string
      displayValue: string
      status: string
      rejectionReason: string | null
      mergedFacetId: string | null
      roleCount: number
      authorCount: number
      eligible: boolean
      updatedAt: string
    }

    interface Failure {
      characterProfileId: string
      status: string
      attemptCount: number
      errorCode: string | null
      nextAttemptAt: string | null
      updatedAt: string
      profile: { name: string }
    }

    interface Overview {
      facets: Facet[]
      candidates: Candidate[]
      failures: Failure[]
      metrics: {
        catalogErrorRate15m: number
        catalogP95Ms15m: number | null
        classificationSuccessRate: number
        eligibleCandidateCount: number
        oldestPendingAt: string | null
        promotions30d: number
        zeroResultFilterRate15m: number
      }
    }

    interface CandidateReview {
      action: "MERGE" | "PROMOTE" | "REJECT"
      confirmed: true
      discoveryFacetId?: string
      code?: string
      labelZhHans?: string
      labelZhHant?: string
      labelEn?: string
      labelJa?: string
      labelDe?: string
      sortOrder?: number
      reason?: string
    }
  }
}
