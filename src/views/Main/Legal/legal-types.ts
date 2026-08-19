export type DocumentKind = "privacy" | "terms"
export type LegalLocale = "en" | "zh"

export interface LegalSection {
  id: string
  number: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export interface LegalCopy {
  title: string
  summary: string
  lastUpdatedLabel: string
  lastUpdated: string
  contentsLabel: string
  backHome: string
  relatedPath: `/${DocumentKind}`
  relatedLabel: string
  contactEyebrow: string
  contactTitle: string
  contactBody: string
  footerLabel: string
  privacyLink: string
  termsLink: string
  footerNote: string
  sections: LegalSection[]
}
