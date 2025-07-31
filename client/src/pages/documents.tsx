import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { DocumentListItem } from "@/components/document-list-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { type DocumentWithDetails, type Block } from "@shared/schema";
import { CATEGORIES, STATUSES } from "@/lib/constants";
import { useLocation } from "wouter";

export default function Documents() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.set("search", searchQuery);
  if (selectedCategory) queryParams.set("category", selectedCategory);
  if (selectedStatus) queryParams.set("status", selectedStatus);
  if (selectedBlock) queryParams.set("blockId", selectedBlock);

  const { data: documents = [], isLoading } = useQuery<DocumentWithDetails[]>({
    queryKey: ["/api/documents", queryParams.toString()],
    queryFn: () => {
      const url = `/api/documents${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return fetch(url).then(res => res.json());
    },
  });

  const { data: blocks = [] } = useQuery<Block[]>({
    queryKey: ["/api/blocks"],
  });

  const handleViewDocument = (id: string) => {
    setLocation(`/documents/${id}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedStatus("");
    setSelectedBlock("");
  };

  const activeFiltersCount = [searchQuery, selectedCategory, selectedStatus, selectedBlock]
    .filter(Boolean).length;

  return (
    <MainLayout onSearch={setSearchQuery} searchQuery={searchQuery}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة الوثائق</h1>
          <p className="text-gray-600">تصفح وإدارة جميع وثائق المحكمة</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>المرشحات</CardTitle>
              {activeFiltersCount > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Badge variant="secondary">{activeFiltersCount} مرشح نشط</Badge>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    مسح جميع المرشحات
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  البحث
                </label>
                <Input
                  placeholder="البحث في العناوين..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  الفئة
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الفئات</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  الحالة
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحالات</SelectItem>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  الكتلة
                </label>
                <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الكتل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الكتل</SelectItem>
                    {blocks.map((block) => (
                      <SelectItem key={block.id} value={block.id}>
                        الكتلة {block.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                الوثائق ({documents.length})
              </CardTitle>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Select defaultValue="recent">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">الأحدث</SelectItem>
                    <SelectItem value="oldest">الأقدم</SelectItem>
                    <SelectItem value="title">حسب العنوان</SelectItem>
                    <SelectItem value="category">حسب الفئة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">جاري التحميل...</p>
              </div>
            ) : documents.length > 0 ? (
              <div className="space-y-1">
                {documents.map((document) => (
                  <DocumentListItem
                    key={document.id}
                    document={document}
                    onViewDocument={handleViewDocument}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لم يتم العثور على وثائق
                </h3>
                <p className="text-gray-600 mb-4">
                  جرب تعديل المرشحات أو البحث عن شيء آخر
                </p>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearFilters}>
                    مسح المرشحات
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
