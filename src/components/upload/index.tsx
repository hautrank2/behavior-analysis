import * as React from "react";
import { forwardRef, useImperativeHandle } from "react";
import { UploadCloud, ImagePlus, X, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useUpload } from "./hook";

export type UploadProps = {
  value?: File[];
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
  onChange?: (files: File[]) => void;
  onError?: (messages: string[]) => void;
  className?: string;
  title?: string;
  description?: string;
  isPreview?: boolean;
  isFooter?: boolean;
  isHeader?: boolean;
};

export type UploadedFile = {
  id: string;
  file: File;
  fileName: string;
  ext?: string;
  previewUrl: string;
  error?: string;
};

export type UploaderRef = {
  getFiles: () => File[];
  appendFiles: (files: FileList | File[]) => void;
  setFiles: (files: File[]) => void;
  clear: () => void;
  removeFile: (index: number) => void;
};

const Uploader = forwardRef<UploaderRef, UploadProps>((props, ref) => {
  const {
    className,
    title = "Upload",
    description = "Drag & drop or click to select multiple photos",
    isPreview,
    isFooter,
    isHeader,
  } = props;

  const {
    items,
    isDragging,
    canAddMore,
    inputRef,
    formatBytes,
    addFiles,
    removeAt,
    clearAll,
    setFiles,
    getFiles,
    onInputChange,
    onDragOver,
    onDragLeave,
    onDrop,
    handleKeyDown,
    handleBrowse,
    accept,
    disabled,
    maxFiles,
    maxSizeMB,
  } = useUpload(props);

  useImperativeHandle(ref, () => ({
    getFiles,
    appendFiles: (files: FileList | File[]) => addFiles(files),
    setFiles,
    clear: clearAll,
    removeFile: (index: number) => {
      const target = items[index];
      if (!target) return;
      removeAt(target.id);
    },
  }));

  return (
    <Card className={cn("border-none shadow-none", className)}>
      {isHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5" /> {title}
          </CardTitle>
          <CardDescription>
            {description || (
              <>
                Hỗ trợ: {accept}. Tối đa {maxFiles} ảnh, mỗi ảnh ≤ {maxSizeMB}{" "}
                MB.
              </>
            )}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div
          role="button"
          tabIndex={0}
          aria-disabled={disabled}
          onKeyDown={handleKeyDown}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !disabled && handleBrowse()}
          className={[
            "group relative flex flex-col items-center justify-center w/full border-2 border-dashed rounded-2xl p-8 transition",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/60",
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          ].join(" ")}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            disabled={disabled || !canAddMore}
            onChange={onInputChange}
            className="sr-only"
          />
          <UploadCloud className="h-10 w-10 mb-3" aria-hidden />
          <div className="text-sm text-muted-foreground text-center">
            <span className="font-medium text-foreground">Drop & drop</span> or
            click to select files
            <div className="mt-1">
              {Math.max(0, maxFiles - items.length)} slots left
            </div>
          </div>
        </div>

        {isPreview && items.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 text-sm text-muted-foreground">
              Đã chọn{" "}
              <span className="font-medium text-foreground">
                {items.length}
              </span>{" "}
              / {maxFiles} ảnh
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((it) => (
                <li key={it.id} className="relative group">
                  <img
                    src={it.previewUrl}
                    alt={it.file.name}
                    className="h-40 w-full object-cover rounded-xl border"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => removeAt(it.id)}
                    className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-background/80 backdrop-blur border shadow p-1 opacity-0 group-hover:opacity-100 transition"
                    aria-label={`Remove ${it.file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate" title={it.file.name}>
                      {it.file.name}
                    </span>
                    <span>{formatBytes(it.file.size)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      {isFooter && (
        <CardFooter className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            Định dạng được hỗ trợ: {accept.replace(",", ", ")}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={clearAll}
              disabled={disabled || items.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Xóa hết
            </Button>
            <Button
              type="button"
              onClick={() => console.log("Upload", items)}
              disabled={disabled || items.length === 0}
            >
              <UploadCloud className="h-4 w-4 mr-2" /> Upload
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
});

Uploader.displayName = "Uploader";
export { Uploader };
