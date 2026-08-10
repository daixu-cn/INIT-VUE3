declare namespace Model {
  namespace AppOperations {
    interface MaintenancePolicy {
      scheduleEnabled: boolean
      manualActive: boolean
      noticeStartsAt: string | null
      startsAt: string | null
      endsAt: string | null
      titleZh: string
      messageZh: string
      titleEn: string
      messageEn: string
      updatedByUserId: string | null
      updatedAt: string
    }

    interface Data {
      maintenance: MaintenancePolicy
    }

    type UpdateMaintenance = Omit<MaintenancePolicy, "updatedByUserId" | "updatedAt">
  }
}
