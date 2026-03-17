import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface FileUploaderProps {
  onUploadSuccess?: () => void;
  maxSize?: number; // in bytes
}

export function FileUploader({ onUploadSuccess, maxSize = 50 * 1024 * 1024 }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = trpc.storage.files.upload.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast.error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1];
        if (!base64) {
          toast.error('Failed to read file');
          return;
        }

        await uploadMutation.mutateAsync({
          filename: selectedFile.name,
          fileData: base64,
          mimeType: selectedFile.type,
          description: description || undefined,
          isPublic: false,
        });

        toast.success('File uploaded successfully');
        setSelectedFile(null);
        setDescription('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onUploadSuccess?.();
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error('Failed to upload file');
      console.error(error);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Upload Document</h3>

        {/* File Input Area */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/50 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />

          {selectedFile ? (
            <div className="flex items-center justify-center gap-2">
              <File className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="ml-2 p-1 hover:bg-destructive/10 rounded"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT, JPG, PNG (max {maxSize / (1024 * 1024)}MB)</p>
            </div>
          )}
        </div>

        {/* Description */}
        {selectedFile && (
          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this document..."
              className="w-full mt-2 p-2 border border-border rounded-md text-sm"
              rows={3}
            />
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && (
          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="w-full"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
