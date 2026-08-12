declare namespace Model {
  namespace Notification {
    type Locale = "zh_CN" | "zh_TW" | "en_US" | "ja_JP" | "de_DE"

    interface TemplateFieldOption {
      label: string
      value: string
    }

    interface TemplateField {
      key: string
      label: string
      type: "DATETIME" | "ENUM"
      required: true
      options?: TemplateFieldOption[]
    }

    interface Template {
      key: string
      label: string
      fields: TemplateField[]
    }

    interface BroadcastPayload {
      templateKey: string
      variables: Record<string, string>
    }

    interface PreviewCopy {
      title: string
      body: string
    }

    type Preview = Record<Locale, PreviewCopy>

    interface Broadcast {
      notificationDispatchTaskId: string
      templateKey: string
      templateVariables: Record<string, string>
      createdByUserId: string | null
      expectedRecipientCount: number | null
      deliveredCount: number
      failedCount: number
      status: "PENDING" | "PROCESSING" | "COMPLETED"
      errorCode: string | null
      createdAt: string
      completedAt: string | null
    }
  }
}
