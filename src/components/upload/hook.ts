// ============================
// File: useUpload.ts
// ============================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UploadProps } from ".";

export type UploadedFile = {
  id: string;
  file: File;
  fileName: string;
  ext?: string;
  previewUrl: string;
  error?: string;
};

export type UseUploadProps = UploadProps & {
  value?: File[];
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string; // e.g. "image/*"
  disabled?: boolean;
  onChange?: (files: File[]) => void;
  onError?: (messages: string[]) => void;
};

export function useUpload({
  value,
  maxFiles = 12,
  maxSizeMB = 10,
  accept = "image/*",
  disabled,
  onChange,
  onError,
}: UseUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<UploadedFile[]>([]);

  const maxBytes = useMemo(() => maxSizeMB * 1024 * 1024, [maxSizeMB]);

  // -------- utils --------
  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"] as const;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }, []);

  const makeId = useCallback(
    (f: File) => `${f.name}-${f.size}-${f.lastModified}`,
    []
  );

  const dedupe = useCallback(
    (incoming: File[]) => {
      const existing = new Set(items.map((i) => i.id));
      return incoming.filter((f) => !existing.has(makeId(f)));
    },
    [items, makeId]
  );

  const validate = useCallback(
    (files: File[]) => {
      const errors: string[] = [];
      const valids: File[] = [];
      for (const f of files) {
        const isAcceptImage =
          accept === "image/*" ? f.type.startsWith("image/") : true; // simple guard; adjust if you need strict accept parsing
        if (!isAcceptImage) {
          errors.push(
            `"${f.name}" không phải là ảnh (type: ${f.type || "unknown"}).`
          );
          continue;
        }
        if (f.size > maxBytes) {
          errors.push(
            `"${f.name}" vượt quá ${maxSizeMB} MB (kích thước: ${formatBytes(
              f.size
            )}).`
          );
          continue;
        }
        valids.push(f);
      }
      return { valids, errors };
    },
    [accept, formatBytes, maxBytes, maxSizeMB]
  );

  // -------- sync from `value` prop (controlled) --------
  useEffect(() => {
    if (!value) return;
    const picked = value.slice(0, maxFiles).map((f) => {
      const nameParts = f.name.split(".");
      const ext = nameParts.length > 1 ? nameParts.pop() : "";
      const fileName = nameParts.join(".");
      return {
        id: makeId(f),
        file: f,
        previewUrl: URL.createObjectURL(f),
        fileName,
        ext,
      } as UploadedFile;
    });
    setItems((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return picked;
    });
  }, [value, maxFiles, makeId]);

  // -------- revoke on unmount / items change --------
  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.files = null;
    }
    return () => {
      items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    };
  }, [items]);

  // -------- core actions (side-effect safe) --------
  const addFiles = useCallback(
    (list: FileList | File[]) => {
      if (disabled) return;
      const arr = Array.from(list);
      const unique = dedupe(arr);
      const remainingSlots = Math.max(0, maxFiles - items.length);
      const capped = unique.slice(0, remainingSlots);
      const { valids, errors } = validate(capped);

      if (errors.length && onError) onError(errors);

      const picked: UploadedFile[] = valids.map((f) => {
        const nameParts = f.name.split(".");
        const ext = nameParts.length > 1 ? nameParts.pop() : "";
        const fileName = nameParts.join(".");
        return {
          id: makeId(f),
          file: f,
          previewUrl: URL.createObjectURL(f),
          fileName,
          ext,
        };
      });

      console.log(items, picked);

      const next = [...items, ...picked];
      setItems(next);
      onChange?.(next.map((n) => n.file));
    },
    [disabled, dedupe, items, maxFiles, onChange, onError, validate, makeId]
  );

  const removeAt = useCallback(
    (id: string) => {
      const target = items.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = items.filter((p) => p.id !== id);
      setItems(next);
      onChange?.(next.map((n) => n.file));
    },
    [items, onChange]
  );

  const clearAll = useCallback(() => {
    items.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setItems([]);
    onChange?.([]);
  }, [items, onChange]);

  const setFiles = useCallback(
    (files: File[]) => {
      const { valids } = validate(files);
      const picked = valids.map((f) => {
        const nameParts = f.name.split(".");
        const ext = nameParts.length > 1 ? nameParts.pop() : "";
        const fileName = nameParts.join(".");
        return {
          id: makeId(f),
          file: f,
          previewUrl: URL.createObjectURL(f),
          fileName,
          ext,
        } as UploadedFile;
      });
      // replace all
      setItems((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
        return picked;
      });
      onChange?.(picked.map((n) => n.file));
    },
    [makeId, onChange, validate]
  );

  const getFiles = useCallback(() => items.map((i) => i.file), [items]);

  // -------- DOM/event helpers for the input/area --------
  const handleBrowse = useCallback(() => inputRef.current?.click(), []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      addFiles(e.target.files);
      e.target.value = ""; // allow re-select same file
    },
    [addFiles]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      e.dataTransfer.dropEffect = "copy";
      setIsDragging(true);
    },
    [disabled]
  );

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const dt = e.dataTransfer;
      if (dt.files && dt.files.length) {
        addFiles(dt.files);
      }
    },
    [addFiles, disabled]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleBrowse();
      }
    },
    [disabled, handleBrowse]
  );

  const canAddMore = items.length < maxFiles;

  return {
    // state
    items,
    isDragging,
    canAddMore,

    // refs
    inputRef,

    // utils
    formatBytes,

    // actions
    addFiles,
    removeAt,
    clearAll,
    setFiles,
    getFiles,

    // DOM handlers
    onInputChange,
    onDragOver,
    onDragLeave,
    onDrop,
    handleKeyDown,
    handleBrowse,

    // passthrough
    accept,
    disabled: !!disabled,
    maxFiles,
    maxSizeMB,
  } as const;
}
