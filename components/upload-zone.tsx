"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Upload, FileImage, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
  accept?: Record<string, string[]>
}

export function UploadZone({
  onFileSelect,
  isLoading = false,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "application/pdf": [".pdf"],
  },
}: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setSelectedFile(file)

        // Create preview for images
        if (file.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onload = () => {
            setPreview(reader.result as string)
          }
          reader.readAsDataURL(file)
        } else {
          setPreview(null)
        }

        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    disabled: isLoading,
  })

  const clearFile = () => {
    setSelectedFile(null)
    setPreview(null)
  }

  if (selectedFile) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-24 w-24 rounded-lg object-cover border border-border"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
              <FileImage className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
            {isLoading && (
              <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing document...</span>
              </div>
            )}
          </div>
          {!isLoading && (
            <Button variant="ghost" size="icon" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative rounded-xl border-2 border-dashed bg-card p-12 text-center transition-all duration-200 cursor-pointer",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "rounded-xl p-4 transition-colors",
            isDragActive ? "bg-primary/10" : "bg-muted"
          )}
        >
          <Upload
            className={cn(
              "h-8 w-8 transition-colors",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>
        <div>
          <p className="text-lg font-medium text-foreground">
            {isDragActive ? "Drop your file here" : "Drag & drop your medical note"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or click to browse. Supports images and PDFs.
          </p>
        </div>
        <Button variant="outline" className="mt-2">
          Browse Files
        </Button>
      </div>
    </div>
  )
}
