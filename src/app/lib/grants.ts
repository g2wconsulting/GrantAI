// Client for the public Grants.gov Search2 API.
// Docs: https://www.grants.gov/api/api-docs/  (no API key required)
export type GrantsGovOpportunity = {
  id: string;
  number: string;
  title: string;
  agencyName: string;
  openDate: string;
  closeDate: string;
  oppStatus: string;
  docType: string;
  cfdaList?: string[];
  description?: string;
};

const SEARCH_URL = "https://api.grants.gov/v1/api/search2";

export async function searchGrantsGov(keyword: string, rows = 25): Promise<GrantsGovOpportunity[]> {
  const res = await fetch(SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keyword,
      oppStatuses: "forecasted|posted",
      rows,
    }),
  });

  if (!res.ok) {
    throw new Error(`Grants.gov search failed (${res.status})`);
  }

  const data = await res.json();
  const list = data?.data?.oppHits ?? [];

  return list.map((hit: any) => ({
    id: String(hit.id),
    number: hit.number ?? "",
    title: hit.title ?? "Untitled Opportunity",
    agencyName: hit.agencyName ?? hit.agencyCode ?? "Unknown Agency",
    openDate: hit.openDate ?? "",
    closeDate: hit.closeDate ?? "",
    oppStatus: hit.oppStatus ?? "",
    docType: hit.docType ?? "",
    cfdaList: hit.cfdaList ?? [],
  }));
}
