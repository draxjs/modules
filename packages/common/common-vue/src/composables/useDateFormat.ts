
import type {IDraxDateFormatUnit} from "@drax/common-share";

export function useDateFormat() {

  const formatDateByUnit = (isoDate: string, format: IDraxDateFormatUnit): string => {
    if (!isoDate || isNaN(new Date(isoDate).getTime())) {
      return ''
    }
    const date = new Date(isoDate)
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')

    const getIsoWeek = (value: Date): string => {
      const weekDate = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
      const dayOfWeek = weekDate.getUTCDay() || 7
      weekDate.setUTCDate(weekDate.getUTCDate() + 4 - dayOfWeek)
      const weekYear = weekDate.getUTCFullYear()
      const yearStart = new Date(Date.UTC(weekYear, 0, 1))
      const week = Math.ceil((((weekDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
      return `${weekYear}-W${String(week).padStart(2, '0')}`
    }

    switch (format) {
      case 'year':
        return `${year}`
      case 'month':
        return `${year}-${month}`
      case 'week':
        return getIsoWeek(date)
      case 'day':
        return `${year}-${month}-${day}`
      case 'hour':
        return `${year}-${month}-${day} ${hour}`
      case 'minute':
        return `${year}-${month}-${day} ${hour}:${minute}`
      case 'second':
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
      default:
        return `${year}-${month}-${day}`
    }
  }

  return {
    formatDateByUnit
  }
}
