import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Trash2, Loader2, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Document } from '@shared/types';

interface DocumentListProps {
  documents: Document[];
  onRefresh?: () => void;
}

export function DocumentList({ documents, onRefresh }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const deleteMutation = trpc.storage.documents.delete.useMutation();

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Document deleted');
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to delete document');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id: number) => {
    setDownloadingId(id);
    try {
      const { data } = trpc.storage.documents.download.useQuery({ id });
      if (!data) {
        toast.error('Failed to get download link');
        return;
      }
      const { url, filename } = data;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download document');
      console.error(error);
    } finally {
      setDownloadingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No documents yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold">{doc.title}</h4>
              <p className="text-sm text-muted-foreground">
                {doc.type} • {doc.format?.toUpperCase()} • {new Date(doc.createdAt).toLocaleDateString()}
              </p>
              {doc.fileSize && (
                <p className="text-xs text-muted-foreground">
                  Size: {(doc.fileSize / 1024).toFixed(2)} KB
                </p>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(doc.id)}
                disabled={downloadingId === doc.id}
              >
                {downloadingId === doc.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
              >
                {deletingId === doc.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
