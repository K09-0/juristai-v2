# File Storage Guide - JuristAI v2

## Overview

JuristAI v2 now includes full-stack File Storage capabilities, allowing users to:

- ✅ Upload legal documents and files
- ✅ Generate and save legal documents (contracts, claims, petitions)
- ✅ Manage document library
- ✅ Download documents
- ✅ Organize files with descriptions

## Architecture

### Database Schema

**Documents Table** (`documents`)
- Stores generated legal documents
- Fields: id, userId, title, type, style, content, fileUrl, fileKey, format, fileSize, createdAt, updatedAt
- Types: исковое_заявление, претензия, договор, другое
- Formats: pdf, docx, txt

**Uploaded Files Table** (`uploadedFiles`)
- Stores user-uploaded files
- Fields: id, userId, originalName, fileKey, fileUrl, mimeType, fileSize, description, isPublic, createdAt, updatedAt

### API Endpoints (tRPC)

#### Documents Management

```typescript
// List all documents for current user
trpc.storage.documents.list.useQuery()

// Get specific document
trpc.storage.documents.get.useQuery({ id: 1 })

// Create new document
trpc.storage.documents.create.useMutation({
  title: string,
  type: "исковое_заявление" | "претензия" | "договор" | "другое",
  style?: "формальный" | "нейтральный" | "агрессивный" | "защитный",
  content: string,
  format?: "pdf" | "docx" | "txt"
})

// Delete document
trpc.storage.documents.delete.useMutation({ id: number })

// Download document
trpc.storage.documents.download.useQuery({ id: number })
```

#### File Management

```typescript
// List all uploaded files
trpc.storage.files.list.useQuery()

// Get specific file
trpc.storage.files.get.useQuery({ id: 1 })

// Upload file
trpc.storage.files.upload.useMutation({
  filename: string,
  fileData: string, // base64 encoded
  mimeType?: string,
  description?: string,
  isPublic?: boolean
})

// Delete file
trpc.storage.files.delete.useMutation({ id: number })

// Download file
trpc.storage.files.download.useQuery({ id: number })
```

## Frontend Components

### FileUploader Component

Located at: `client/src/components/FileUploader.tsx`

```tsx
import { FileUploader } from '@/components/FileUploader';

<FileUploader 
  onUploadSuccess={() => {
    // Handle successful upload
  }}
  maxSize={50 * 1024 * 1024} // 50MB default
/>
```

### DocumentList Component

Located at: `client/src/components/DocumentList.tsx`

```tsx
import { DocumentList } from '@/components/DocumentList';

<DocumentList 
  documents={documents}
  onRefresh={() => {
    // Handle refresh
  }}
/>
```

### Storage Page

Located at: `client/src/pages/Storage.tsx`

Full-featured storage management page with:
- Document management (list, download, delete)
- File upload interface
- File management (list, delete)
- Tabs for organization

Access at: `/storage`

## File Size Limits

- **Maximum file size**: 50MB
- **Supported formats**: PDF, DOC, DOCX, TXT, JPG, PNG
- **Storage**: AWS S3 (via Manus platform)

## Security Features

- ✅ User-scoped file access (users can only access their own files)
- ✅ Authentication required for all operations
- ✅ File size validation
- ✅ Presigned URLs for secure downloads
- ✅ Optional public/private file sharing

## Usage Examples

### Upload a Document

```typescript
const uploadMutation = trpc.storage.files.upload.useMutation();

await uploadMutation.mutateAsync({
  filename: "contract.pdf",
  fileData: base64EncodedData,
  mimeType: "application/pdf",
  description: "Service Agreement",
  isPublic: false
});
```

### Generate and Save a Legal Document

```typescript
const createDocMutation = trpc.storage.documents.create.useMutation();

await createDocMutation.mutateAsync({
  title: "Исковое заявление",
  type: "исковое_заявление",
  style: "формальный",
  content: documentContent,
  format: "pdf"
});
```

### List and Download Files

```typescript
const filesQuery = trpc.storage.files.list.useQuery();
const downloadMutation = trpc.storage.files.download.useMutation();

// Download a file
const { url, filename } = await downloadMutation.mutateAsync({ id: fileId });

// Create download link
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();
```

## Database Migration

The following tables are automatically created:

```sql
CREATE TABLE `documents` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('исковое_заявление','претензия','договор','другое') NOT NULL,
  `style` enum('формальный','нейтральный','агрессивный','защитный') DEFAULT 'нейтральный',
  `content` text NOT NULL,
  `fileUrl` varchar(512),
  `fileKey` varchar(512),
  `format` enum('pdf','docx','txt') DEFAULT 'pdf',
  `fileSize` bigint,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);

CREATE TABLE `uploadedFiles` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `originalName` varchar(255) NOT NULL,
  `fileKey` varchar(512) NOT NULL,
  `fileUrl` varchar(512) NOT NULL,
  `mimeType` varchar(100),
  `fileSize` bigint NOT NULL,
  `description` text,
  `isPublic` boolean DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `uploadedFiles_id` PRIMARY KEY(`id`)
);
```

## Testing

Run tests with:

```bash
pnpm test
```

Tests are located in:
- `server/storage.test.ts` - Storage API tests
- `server/auth.logout.test.ts` - Authentication tests

## Troubleshooting

### File Upload Fails

1. Check file size (max 50MB)
2. Verify authentication (user must be logged in)
3. Check S3 credentials in environment variables
4. Review browser console for detailed errors

### Files Not Appearing in List

1. Ensure user is authenticated
2. Check database connection
3. Verify user ID matches in database
4. Check browser cache (clear if needed)

### Download Links Expired

- Presigned URLs expire after 1 hour
- Generate new download link by clicking download button again

## Environment Variables Required

```
DATABASE_URL=mysql://user:password@host/database
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
```

## Future Enhancements

- [ ] Batch file operations
- [ ] File versioning
- [ ] Collaborative document editing
- [ ] Advanced search and filtering
- [ ] Document templates
- [ ] E-signature integration
- [ ] Document sharing with permissions
