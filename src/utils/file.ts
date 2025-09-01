import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadZipBlob(
  files: {
    name: string;
    blob: Blob;
  }[],
  name?: string
) {
  const zip = new JSZip();

  // Thêm từng file vào zip
  files.forEach((file) => {
    zip.file(file.name, file.blob); // File là Blob nên JSZip hỗ trợ
  });

  // Generate zip thành blob

  // Lưu xuống
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, name ?? "files.zip");
}
