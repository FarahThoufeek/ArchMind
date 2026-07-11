"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import type { ReferenceImage, ImagePriority } from "@/types";

const PRIORITY_OPTIONS: { value: ImagePriority; label: string; color: string }[] =
  [
    { value: "love", label: "Love this", color: "bg-green-100 text-green-800 border-green-300" },
    { value: "like", label: "Like parts", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { value: "mood", label: "Just mood", color: "bg-amber-100 text-amber-800 border-amber-300" },
  ];

interface Props {
  images: ReferenceImage[];
  onChange: (images: ReferenceImage[]) => void;
  disabled?: boolean;
}

export default function ReferenceBoard({ images, onChange, disabled }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const readers = acceptedFiles.map(
        (file) =>
          new Promise<ReferenceImage>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: uuidv4(),
                dataUrl: reader.result as string,
                fileName: file.name,
                priority: "love",
              });
            };
            reader.readAsDataURL(file);
          })
      );
      Promise.all(readers).then((newImgs) =>
        onChange([...images, ...newImgs].slice(0, 10))
      );
    },
    [images, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: disabled || images.length >= 10,
    multiple: true,
  });

  const setPriority = (id: string, priority: ImagePriority) => {
    onChange(images.map((img) => (img.id === id ? { ...img, priority } : img)));
  };

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-400 bg-blue-50" : "border-zinc-300 hover:border-zinc-400 bg-zinc-50"}
          ${disabled || images.length >= 10 ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <p className="text-xs text-zinc-500">
          {images.length >= 10
            ? "Maximum 10 images"
            : isDragActive
            ? "Drop images here…"
            : "Drag & drop images or click to browse"}
        </p>
        <p className="text-xs text-zinc-400 mt-1">{images.length}/10 images</p>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img) => {
            const p = PRIORITY_OPTIONS.find((o) => o.value === img.priority)!;
            return (
              <div
                key={img.id}
                className="relative group rounded-lg overflow-hidden border border-zinc-200 bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.fileName}
                  className="w-full h-24 object-cover"
                />
                {/* Remove button */}
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                  disabled={disabled}
                >
                  ×
                </button>
                {/* Priority selector */}
                <div className="p-1.5">
                  <div className="flex gap-1">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPriority(img.id, opt.value)}
                        className={`flex-1 text-[9px] font-semibold px-1 py-0.5 rounded border transition-colors
                          ${img.priority === opt.value ? opt.color : "bg-zinc-50 text-zinc-400 border-zinc-200"}`}
                        disabled={disabled}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
