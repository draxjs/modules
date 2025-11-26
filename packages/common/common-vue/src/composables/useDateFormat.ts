
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

    switch (format) {
      case 'year':
        return `${year}`
      case 'month':
        return `${year}-${month}`
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
