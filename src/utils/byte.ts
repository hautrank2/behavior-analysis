// utils/formatBytes.ts
export type ByteUnit = "B" | "KB" | "MB" | "GB" | "TB" | "PB" | "EB";

type Options = {
  base?: 1000 | 1024; // mặc định 1024
  decimals?: number; // số lẻ tối đa (mặc định 2; với B = 0)
  minUnit?: ByteUnit; // ép không xuống dưới đơn vị này
  maxUnit?: ByteUnit; // ép không vượt quá đơn vị này
  locale?: string | false; // ví dụ "en-US" | "vi-VN" | false = không format locale
};

const UNITS: ByteUnit[] = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];

export function formatBytes(
  bytes: number,
  opts: Options = {}
): { value: number; unit: ByteUnit; text: string } {
  const base = opts.base ?? 1024;
  if (!Number.isFinite(bytes) || bytes < 0) {
    return { value: 0, unit: "B", text: "0 B" };
  }
  if (bytes === 0) return { value: 0, unit: "B", text: "0 B" };

  const minIdx = opts.minUnit ? UNITS.indexOf(opts.minUnit) : 0;
  const maxIdx = opts.maxUnit ? UNITS.indexOf(opts.maxUnit) : UNITS.length - 1;

  // chọn bậc đơn vị
  let i = Math.floor(Math.log(bytes) / Math.log(base));
  i = Math.max(minIdx, Math.min(i, maxIdx));

  // giá trị theo đơn vị đã chọn
  let val = bytes / Math.pow(base, i);

  // nếu vẫn >= base và còn có thể tăng bậc, tăng thêm
  if (val >= base && i < maxIdx) {
    i += 1;
    val = bytes / Math.pow(base, i);
  }

  const unit = UNITS[i];
  const decimals = unit === "B" ? 0 : opts.decimals ?? 2;

  // format số: cắt số 0 thừa nhưng không vượt quá decimals
  const textNumber =
    opts.locale === false
      ? stripZeros(val.toFixed(decimals))
      : val.toLocaleString(opts.locale ?? undefined, {
          maximumFractionDigits: decimals,
        });

  return {
    value: parseFloat(stripZeros(val.toFixed(decimals))),
    unit,
    text: `${textNumber} ${unit}`,
  };
}

function stripZeros(s: string): string {
  return s.indexOf(".") >= 0
    ? s.replace(/\\.0+$/, "").replace(/(\\.\\d*?)0+$/, "$1")
    : s;
}
