import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { DocumentUploadModal } from "@/components/document-upload-modal";

interface MainLayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function MainLayout({ children, onSearch, searchQuery }: MainLayoutProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50">
      <Header onSearch={onSearch} searchQuery={searchQuery} />
      <div className="flex h-screen pt-16">
        <Sidebar onNewDocument={() => setIsUploadModalOpen(true)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
