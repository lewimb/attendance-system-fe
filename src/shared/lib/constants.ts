export const BUSINESS_TZ = 'Asia/Jakarta'
export const BUSINESS_TZ_LABEL = 'WIB'

export const WORK_START_LABEL = '09:00'

export const MAX_PHOTO_BYTES = 3 * 1024 * 1024
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png'] as const

export const MAX_RANGE_DAYS = 31

export const PAGE_SIZE = 10

export const ROLE_IDS = { HR_ADMIN: 1, EMPLOYEE: 2 } as const

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api'

export const PRODUCT_NAME = 'WFH Attendance'
