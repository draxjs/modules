import type {IDraxDateFormatUnit} from "@drax/common-share";
import dayjs from "dayjs";

export function useDateFormat() {

  const formatDateByUnit = (isoDate: string, format: IDraxDateFormatUnit): string => {
    if (!isoDate || isNaN(new Date(isoDate).getTime())) {
      return ''
    }
    const date = dayjs(isoDate)

    switch (format) {
      case 'year':
        return date.format('YYYY')
      case 'month':
        return date.format('YYYY-MM')
      case 'day':
        return date.format('YYYY-MM-DD')
      case 'hour':
        return date.format('YYYY-MM-DD HH')
      case 'minute':
        return date.format('YYYY-MM-DD HH:mm')
      case 'second':
        return date.format('YYYY-MM-DD HH:mm:ss')
      default:
        return date.format('YYYY-MM-DD')
    }
  }

  return {
    formatDateByUnit

  }
}
