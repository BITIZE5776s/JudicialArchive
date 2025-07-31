import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { type DocumentWithDetails, type Paper } from "@shared/schema";
import { CATEGORIES, STATUSES, STATUS_COLORS, FILE_TYPE_ICONS, PRIORITY_COLORS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const documentSchema = z.object({
  title: z.string().min(1, "عنوان الوثيقة مطلوب"),
  category: z.string().min(1, "فئة الوثيقة مطلوبة"),
  status: z.string().min(1, "حالة الوثيقة مطلوبة"),
  metadata: z.object({
    priority: z.string().optional(),
    court: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

const paperSchema = z.object({
  title: z.string().min(1, "عنوان الورقة مطلوب"),
  content: z.string().optional(),
  fileType: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;
type PaperFormData = z.infer<typeof paperSchema>;

interface DocumentEditorProps {
  documentId: string;
}

export default function DocumentEditor({ documentId }: DocumentEditorProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { canManageDocuments } = useAuth();
  const queryClient = useQueryClient();
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  const [isAddingPaper, setIsAddingPaper] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);

  const { data: document, isLoading } = useQuery<DocumentWithDetails>({
    queryKey: ["/api/documents", documentId],
  });

  const documentForm = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: document?.title || "",
      category: document?.category || "",
      status: document?.status || "",
      metadata: document?.metadata || {
        priority: "متوسطة",
        court: "محكمة الاستئناف بالرباط",
        notes: "",
      },
    },
  });

  const paperForm = useForm<PaperFormData>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      title: "",
      content: "",
      fileType: "pdf",
    },
  });

  // Update form when document data loads
  React.useEffect(() => {
    if (document) {
      documentForm.reset({
        title: document.title,
        category: document.category,
        status: document.status,
        metadata: document.metadata || {
          priority: "متوسطة",
          court: "محكمة الاستئناف بالرباط",
          notes: "",
        },
      });
    }
  }, [document, documentForm]);

  const updateDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormData) => {
      return apiRequest("PUT", `/api/documents/${documentId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث الوثيقة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      setIsEditingDocument(false);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الوثيقة",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف",
        description: "تم حذف الوثيقة بنجاح",
      });
      setLocation("/documents");
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الوثيقة",
        variant: "destructive",
      });
    },
  });

  const createPaperMutation = useMutation({
    mutationFn: async (data: PaperFormData) => {
      return apiRequest("POST", "/api/papers", {
        ...data,
        documentId,
        attachmentUrl: `/uploads/${documentId}_${Date.now()}.${data.fileType || 'pdf'}`,
        fileSize: Math.floor(Math.random() * 5000000) + 100000,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم الإضافة",
        description: "تم إضافة الورقة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      setIsAddingPaper(false);
      paperForm.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الورقة",
        variant: "destructive",
      });
    },
  });

  const updatePaperMutation = useMutation({
    mutationFn: async (data: PaperFormData & { id: string }) => {
      return apiRequest("PUT", `/api/papers/${data.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث الورقة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      setEditingPaper(null);
      paperForm.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الورقة",
        variant: "destructive",
      });
    },
  });

  const deletePaperMutation = useMutation({
    mutationFn: async (paperId: string) => {
      return apiRequest("DELETE", `/api/papers/${paperId}`);
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف",
        description: "تم حذف الورقة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الورقة",
        variant: "destructive",
      });
    },
  });

  const onSubmitDocument = (data: DocumentFormData) => {
    updateDocumentMutation.mutate(data);
  };

  const onSubmitPaper = (data: PaperFormData) => {
    if (editingPaper) {
      updatePaperMutation.mutate({ ...data, id: editingPaper.id });
    } else {
      createPaperMutation.mutate(data);
    }
  };

  const handleEditPaper = (paper: Paper) => {
    setEditingPaper(paper);
    paperForm.reset({
      title: paper.title,
      content: paper.content || "",
      fileType: paper.fileType || "pdf",
    });
    setIsAddingPaper(true);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'غير محدد';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} ميجابايت`;
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return FILE_TYPE_ICONS.default;
    return FILE_TYPE_ICONS[fileType as keyof typeof FILE_TYPE_ICONS] || FILE_TYPE_ICONS.default;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!document) {
    return (
      <MainLayout>
        <div className="p-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <i className="fas fa-file-times text-gray-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  الوثيقة غير موجودة
                </h3>
                <p className="text-gray-600 mb-4">
                  لم يتم العثور على الوثيقة المطلوبة
                </p>
                <Button onClick={() => setLocation("/documents")}>
                  العودة إلى الوثائق
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(document.createdAt), { 
    addSuffix: true, 
    locale: ar 
  });

  return (
    <MainLayout>
      <div className="p-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <li><Button variant="link" className="p-0 h-auto" onClick={() => setLocation("/documents")}>الوثائق</Button></li>
            <li><i className="fas fa-chevron-left text-xs"></i></li>
            <li className="text-gray-900 font-medium">عرض الوثيقة</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CardTitle>تفاصيل الوثيقة</CardTitle>
                    <Badge className={STATUS_COLORS[document.status as keyof typeof STATUS_COLORS]}>
                      {document.status}
                    </Badge>
                  </div>
                  {canManageDocuments() && (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingDocument(!isEditingDocument)}
                      >
                        <i className="fas fa-edit ml-2"></i>
                        {isEditingDocument ? "إلغاء" : "تعديل"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <i className="fas fa-trash ml-2"></i>
                            حذف
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذه الوثيقة؟ هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteDocumentMutation.mutate()}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingDocument ? (
                  <Form {...documentForm}>
                    <form onSubmit={documentForm.handleSubmit(onSubmitDocument)} className="space-y-4">
                      <FormField
                        control={documentForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان الوثيقة</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={documentForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الفئة</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={documentForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الحالة</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={documentForm.control}
                        name="metadata.priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الأولوية</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="عالية">عالية</SelectItem>
                                <SelectItem value="متوسطة">متوسطة</SelectItem>
                                <SelectItem value="منخفضة">منخفضة</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={documentForm.control}
                        name="metadata.notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ملاحظات</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2 space-x-reverse">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingDocument(false)}
                        >
                          إلغاء
                        </Button>
                        <Button type="submit" disabled={updateDocumentMutation.isPending}>
                          {updateDocumentMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">الرقم المرجعي: {document.reference}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">الفئة:</span>
                        <span className="mr-2">{document.category}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">الحالة:</span>
                        <Badge className={`mr-2 ${STATUS_COLORS[document.status as keyof typeof STATUS_COLORS]}`}>
                          {document.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">تاريخ الإنشاء:</span>
                        <span className="mr-2">{timeAgo}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">المنشئ:</span>
                        <span className="mr-2">{document.creator.fullName}</span>
                      </div>
                    </div>

                    {document.metadata && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">معلومات إضافية</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {(document.metadata as any)?.priority && (
                            <div>
                              <span className="font-medium text-gray-700">الأولوية:</span>
                              <Badge className={`mr-2 ${PRIORITY_COLORS[(document.metadata as any).priority as keyof typeof PRIORITY_COLORS] || ''}`}>
                                {(document.metadata as any).priority}
                              </Badge>
                            </div>
                          )}
                          {(document.metadata as any)?.court && (
                            <div>
                              <span className="font-medium text-gray-700">المحكمة:</span>
                              <span className="mr-2">{(document.metadata as any).court}</span>
                            </div>
                          )}
                        </div>
                        {(document.metadata as any)?.notes && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-700">ملاحظات:</span>
                            <p className="text-gray-600 mt-1">{(document.metadata as any).notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Papers Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>أوراق الوثيقة ({document.papers.length})</CardTitle>
                  {canManageDocuments() && (
                    <Button
                      onClick={() => {
                        setEditingPaper(null);
                        paperForm.reset();
                        setIsAddingPaper(true);
                      }}
                    >
                      <i className="fas fa-plus ml-2"></i>
                      إضافة ورقة
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isAddingPaper && (
                  <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-4">
                      {editingPaper ? "تعديل الورقة" : "إضافة ورقة جديدة"}
                    </h4>
                    <Form {...paperForm}>
                      <form onSubmit={paperForm.handleSubmit(onSubmitPaper)} className="space-y-4">
                        <FormField
                          control={paperForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>عنوان الورقة</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={paperForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المحتوى</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={paperForm.control}
                          name="fileType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نوع الملف</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="doc">Word Document</SelectItem>
                                  <SelectItem value="image">صورة</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2 space-x-reverse">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAddingPaper(false);
                              setEditingPaper(null);
                              paperForm.reset();
                            }}
                          >
                            إلغاء
                          </Button>
                          <Button type="submit" disabled={createPaperMutation.isPending || updatePaperMutation.isPending}>
                            {(createPaperMutation.isPending || updatePaperMutation.isPending) ? "جاري الحفظ..." : "حفظ"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}

                <div className="space-y-4">
                  {document.papers.map((paper) => (
                    <div key={paper.id} className="flex items-center space-x-4 space-x-reverse p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={getFileIcon(paper.fileType ?? undefined)}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{paper.title}</h4>
                        <div className="flex items-center space-x-4 space-x-reverse mt-1">
                          <p className="text-xs text-gray-500">{paper.fileType?.toUpperCase()}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(paper.fileSize ?? undefined)}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(paper.createdAt), { addSuffix: true, locale: ar })}
                          </p>
                        </div>
                        {paper.content && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{paper.content}</p>
                        )}
                      </div>
                      {canManageDocuments() && (
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPaper(paper)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <i className="fas fa-trash"></i>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف الورقة</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف هذه الورقة؟
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deletePaperMutation.mutate(paper.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  ))}
                  {document.papers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-file-alt text-gray-300 text-4xl mb-2"></i>
                      <p>لا توجد أوراق مرفقة</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الموقع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">الكتلة:</span>
                  <p className="text-sm text-gray-900">{document.block.label}</p>
                </div>
                <Separator />
                <div>
                  <span className="text-sm font-medium text-gray-700">الصف:</span>
                  <p className="text-sm text-gray-900">{document.row.label}</p>
                </div>
                <Separator />
                <div>
                  <span className="text-sm font-medium text-gray-700">القسم:</span>
                  <p className="text-sm text-gray-900">{document.section.label}</p>
                </div>
                <Separator />
                <div>
                  <span className="text-sm font-medium text-gray-700">المرجع الكامل:</span>
                  <p className="text-sm text-gray-900 font-mono">{document.reference}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">عدد الأوراق:</span>
                  <span className="text-sm font-medium">{document.papers.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">الحجم الإجمالي:</span>
                  <span className="text-sm font-medium">
                    {formatFileSize(document.papers.reduce((total, paper) => total + (paper.fileSize || 0), 0))}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">آخر تحديث:</span>
                  <span className="text-sm font-medium">
                    {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true, locale: ar })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
