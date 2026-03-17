import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/FileUploader';
import { DocumentList } from '@/components/DocumentList';
import { FileText, Upload, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

export default function Storage() {
  const { isAuthenticated } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Queries
  const documentsQuery = trpc.storage.documents.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const filesQuery = trpc.storage.files.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to manage your documents and files.
          </p>
          <Button onClick={() => (window.location.href = getLoginUrl())} className="w-full">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  const documents = documentsQuery.data || [];
  const files = filesQuery.data || [];
  const isLoading = documentsQuery.isLoading || filesQuery.isLoading;

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    documentsQuery.refetch();
    filesQuery.refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container max-w-6xl h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Document Storage</h1>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl py-8">
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="files">
              Uploaded Files ({files.length})
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Generator Info */}
              <Card className="lg:col-span-1 p-6">
                <h3 className="font-semibold mb-4">Generated Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Documents generated through the document generator are automatically saved here.
                </p>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/documents'}>
                  Generate Document
                </Button>
              </Card>

              {/* Documents List */}
              <div className="lg:col-span-2">
                {isLoading ? (
                  <Card className="p-8 text-center">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                  </Card>
                ) : (
                  <DocumentList documents={documents} onRefresh={handleRefresh} />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* File Uploader */}
              <div className="lg:col-span-1">
                <FileUploader onUploadSuccess={handleRefresh} />
              </div>

              {/* Files List */}
              <div className="lg:col-span-2">
                {isLoading ? (
                  <Card className="p-8 text-center">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                  </Card>
                ) : files.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No files uploaded yet</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <Card key={file.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{file.originalName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {file.mimeType} • {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                            {file.description && (
                              <p className="text-sm mt-2">{file.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Size: {(file.fileSize / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
