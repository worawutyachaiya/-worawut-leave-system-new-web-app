const is_Null_Undefined_Blank = (value: any): boolean => {
  return value === undefined || value === null || value.length === 0
}

const formatToNumberIfNanThenReturnBlank = (value: any): number | '' => {
  if (typeof value === 'undefined' || value == null || value.trim() == '') {
    return ''
  } else {
    return Number(value)
  }
}

const formatToDecimalDisplay = (value: unknown, countDecimal: number = 4): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return ''
  }

  return Number(value)
    .toFixed(countDecimal)
    .replace(/\.?0+$/, '')
}

function formatNumber(value, decimals = 2, useGrouping = true, unit = '') {
  const num = Number(value)

  if (isNaN(num) || !isFinite(num)) {
    return ''
  }

  let formatted

  // ถ้าเป็นจำนวนเต็ม
  if (Number.isInteger(num)) {
    formatted = useGrouping ? num.toLocaleString() : num.toString()
  } else {
    // ถ้าเป็นทศนิยม → ปัดทศนิยมตามที่กำหนด
    const rounded = parseFloat(num.toFixed(decimals))
    formatted = useGrouping
      ? rounded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals })
      : rounded.toString()
  }

  // ถ้ามี unit และค่าที่ได้ไม่ใช่ค่าว่าง → เติมหน่วย
  return formatted !== '' && unit ? `${formatted}${unit}` : formatted
}

export { is_Null_Undefined_Blank, formatToNumberIfNanThenReturnBlank, formatToDecimalDisplay, formatNumber }
