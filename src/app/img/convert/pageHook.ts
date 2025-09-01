import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { UploadedFile, UploaderRef } from "~/components/upload";
import { IMAGE_EXT_OPTIONS } from "~/constants/image";
import { zodResolver } from "@hookform/resolvers/zod";
import httpClient from "~/api/httpClient";
import { downloadZipBlob } from "~/utils/file";

export const IMG_EXT_OPTIONS = IMAGE_EXT_OPTIONS;
export type ConvertExtention = (typeof IMG_EXT_OPTIONS)[number]["value"];
// Limits
export const MAX_FILES = 10;
export const MAX_SIZE_MB = 10;
export const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
// ===== Schema =====
const UploadSchema = z
  .object({
    ext: z.enum(
      IMG_EXT_OPTIONS.map((e) => e.value),
      {
        error: "Please select destination format",
      }
    ),
    files: z
      .array(z.instanceof(File, { message: "Invalid files" }))
      .min(1, "Please select at least one file.")
      .max(MAX_FILES, `Max: ${MAX_FILES} files.`),
  })
  .superRefine((val, ctx) => {
    val.files.forEach((f, idx) => {
      // chấp nhận các MIME ảnh phổ biến
      const okMime =
        f.type.startsWith("image/") ||
        ["image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"].includes(
          f.type
        );

      if (!okMime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["files", idx],
          message: "File must be an image.",
        });
      }
      if (f.size > MAX_SIZE_BYTES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["files", idx],
          message: `Size > ${MAX_SIZE_MB}MB.`,
        });
      }
    });
  });

type ConvertedFile = UploadedFile & {
  state?: "loading" | "error" | "done";
  progress?: number;
  result?: Blob;
  ext?: ConvertExtention;
  errorText?: string;
};

type UploadValues = z.infer<typeof UploadSchema>;

export const useImgConvert = () => {
  const [uploadFiles, setUploadFiles] = useState<ConvertedFile[]>([]);
  const uploadRef = useRef<UploaderRef>(null);
  const [files, setFiles] = useState<File[]>([]);
  const loading = useMemo(() => {
    return uploadFiles.some((file) => file.state === "loading");
  }, [uploadFiles]);

  const form = useForm<UploadValues>({
    resolver: zodResolver(UploadSchema),
    defaultValues: { ext: "png", files: [] },
    mode: "onChange",
  });

  const handleRemoveFile = (index: number) => {
    uploadRef.current?.removeFile(index);
  };

  const handleSubmit = async (values: UploadValues) => {
    const files = values.files;
    files.forEach(async (file, index) => {
      try {
        const ext = values.ext;
        const data = new FormData();
        data.append("file", file);
        data.append("ext", ext);

        // Set loading for file1
        setUploadFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, state: "loading", progress: 0, ext } : f
          )
        );
        const convertFile = await httpClient.post("/convert", data, {
          responseType: "blob",
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setUploadFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, state: "done", progress: 1, result: convertFile.data }
              : f
          )
        );
      } catch (err: any) {
        setUploadFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? {
                  ...f,
                  state: "error",
                  progress: 1,
                  errorText: err.response.data.text(),
                }
              : f
          )
        );
      }
    });
  };

  const handleDownloadFile = (file: ConvertedFile) => {
    if (file.result) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file.result);
      link.download = `${file.fileName}.${
        file.ext || IMG_EXT_OPTIONS[0].value
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAllFiles = async () => {
    try {
      console.log(uploadFiles);
      await downloadZipBlob(
        uploadFiles
          .filter((e): e is ConvertedFile & { result: Blob } => !!e.result)
          .map((e) => ({
            name: `${e.fileName}.${e.ext}`,
            blob: e.result,
          }))
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    form.setValue("files", files);
  }, [files]);

  useEffect(() => {
    setUploadFiles(
      files.map((file) => {
        const [fileName, ext] = file.name.split(".");
        const previewUrl = URL.createObjectURL(file);
        return {
          id: file.name,
          file,
          previewUrl,
          fileName,
          ext,
        };
      })
    );
    return () => {
      uploadFiles.forEach((i: UploadedFile) =>
        URL.revokeObjectURL(i.previewUrl)
      );
    };
  }, [files]);

  return {
    uploadRef,
    files,
    setFiles,
    form,
    loading,
    uploadFiles,
    handleSubmit,
    handleRemoveFile,
    handleDownloadFile,
    handleDownloadAllFiles,
  };
};
