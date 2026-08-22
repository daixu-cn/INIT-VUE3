import http from "@/server"

export function getDiscoveryFacets() {
  return http.get<Model.DiscoveryFacets.Overview>("/admin/discovery-facets", undefined, {
    dedupe: true,
    dedupeKey: "admin/discovery-facets",
  })
}

export function updateDiscoveryFacet(
  discoveryFacetId: string,
  params: Partial<Model.DiscoveryFacets.Facet> & { confirmed: true },
) {
  return http.patch<Model.DiscoveryFacets.Facet, typeof params>(
    `/admin/discovery-facets/${discoveryFacetId}`,
    params,
  )
}

export function reviewDiscoveryCandidate(
  candidateId: string,
  params: Model.DiscoveryFacets.CandidateReview,
) {
  return http.post<Model.DiscoveryFacets.Candidate, Model.DiscoveryFacets.CandidateReview>(
    `/admin/discovery-facets/candidates/${candidateId}/review`,
    params,
  )
}

export function retryDiscoveryClassification(characterProfileId: string) {
  return http.post<{ characterProfileId: string; status: string }, { confirmed: true }>(
    `/admin/discovery-facets/classifications/${characterProfileId}/retry`,
    { confirmed: true },
  )
}

export function correctDiscoveryProfile(
  characterProfileId: string,
  codes: Record<string, string[]>,
) {
  return http.post<unknown, { codes: Record<string, string[]>; confirmed: true }>(
    `/admin/discovery-facets/profiles/${characterProfileId}/correct`,
    { codes, confirmed: true },
  )
}
