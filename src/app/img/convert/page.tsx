"use client";

import { ArrowDownToLine, Download, OctagonAlert, X } from "lucide-react";
import React, { useMemo } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { Uploader } from "~/components/upload";
import { formatBytes } from "~/utils/byte";
import { useImgConvert } from "./pageHook";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { IMAGE_EXT_OPTIONS } from "~/constants/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Spinner } from "~/components/ui/shadcn-io/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const ImgConvertPage = () => {
  const {
    form,
    loading,
    uploadRef,
    files,
    setFiles,
    handleRemoveFile,
    handleSubmit,
    uploadFiles,
    handleDownloadFile,
    handleDownloadAllFiles,
  } = useImgConvert();

  const allSuccess = useMemo(() => {
    if (uploadFiles.length === 0) return false;
    return uploadFiles.every((e) => e.state === "done" && !!e.result);
  }, [uploadFiles]);

  return (
    <div className="container mx-auto max-w-200">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="mb-4 flex items-center justify-end gap-4">
            <FormField
              control={form.control}
              name="ext"
              render={({ field }) => (
                <FormItem>
                  <Select
                    disabled={loading}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[240px]">
                        <SelectValue placeholder="Chọn định dạng ảnh" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {IMAGE_EXT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              Convert{" "}
              {uploadFiles.length > 0 ? `${uploadFiles.length} images` : ""}
            </Button>
          </div>
        </form>
      </Form>

      <ul className="flex flex-col gap-1">
        {uploadFiles.map((file, index) => {
          const byte = formatBytes(file.file.size);
          const [fileName] = file.file.name.split(".");
          return (
            <li
              key={index}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X />
                </Button>
                <div className="relative h-10 w-10 overflow-hidden rounded-full shrink-0">
                  <Image
                    src={file.previewUrl}
                    alt="image upload"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <Typography variant="p" className="truncate">
                  {fileName}
                </Typography>
                <Badge variant={"outline"}>{byte.text}</Badge>
              </div>

              <div className="flex justify-end">
                {(() => {
                  switch (file.state) {
                    case "loading":
                      return <Spinner size={24} />;

                    case "done":
                      return (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDownloadFile(file)}
                        >
                          <ArrowDownToLine />
                        </Button>
                      );

                    case "error":
                      return (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <OctagonAlert className="text-destructive" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{file.errorText}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                  }
                })()}
              </div>
            </li>
          );
        })}
      </ul>

      {allSuccess && (
        <div className="flex justify-center w-full">
          <Button
            onClick={() => handleDownloadAllFiles()}
            className="mt-4 mx-auto"
          >
            <Download /> Download all
          </Button>
        </div>
      )}
      {!loading && (
        <Uploader
          ref={uploadRef}
          value={files}
          onChange={(items) => {
            console.log("onChange", files, items);
            setFiles(items);
          }}
        />
      )}
    </div>
  );
};

export default ImgConvertPage;
