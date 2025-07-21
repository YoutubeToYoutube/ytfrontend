import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Trash2,
  Edit,
  FolderPlus,
  Plus,
  MoreHorizontal,
  Search,
  Tag,
  Youtube,
  FileVideo,
  Video,
  CheckCircle,
  XCircle,
  Filter,
  Folder,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormDescription } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationInfo, PageSizeSelector } from "@/components/ui/pagination";
import { useAlerts } from "@/hooks/useAlerts";
import categoryService, { 
  type ApiCategory, 
  type CreateCategoryRequest
} from "@/services/categoryService";
import mediaService, { type ApiMedia, type CreateMediaRequest } from "@/services/mediaService";
import type { ApiError } from "@/types/errors";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MediaStats } from "@/components/MediaStats";

// Form schema for creating/editing categories
const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères.",
  }),
});

// Form schema for creating/editing media
const mediaFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  description: z.string().optional(),
  youtubeId: z.string().optional(),
  categoryId: z.string().refine(val => val !== "_all" && val !== "", {
    message: "Veuillez sélectionner une catégorie.",
  }),
  isActive: z.boolean(),
});

export default function CategoryManagement() {
  // Categories state
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ApiCategory[]>([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [categoriesCurrentPage, setCategoriesCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Show 6 cards per page for categories
  
  // Media state
  const [medias, setMedias] = useState<ApiMedia[]>([]);
  const [filteredMedias, setFilteredMedias] = useState<ApiMedia[]>([]);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("_all");
  const [isCreateMediaDialogOpen, setIsCreateMediaDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<ApiMedia | null>(null);
  const [isEditMediaDialogOpen, setIsEditMediaDialogOpen] = useState(false);
  const [mediaCurrentPage, setMediaCurrentPage] = useState(1);
  const [mediaItemsPerPage, setMediaItemsPerPage] = useState(8); // Show 8 cards per page for media
  
  // General state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("categories");
  const { showAlert } = useAlerts();

  // Form for creating categories
  const createCategoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Form for editing categories
  const editCategoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Form for creating media
  const createMediaForm = useForm<z.infer<typeof mediaFormSchema>>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      name: "",
      description: "",
      youtubeId: "",
      categoryId: "",
      isActive: true,
    },
  });

  // Form for editing media
  const editMediaForm = useForm<z.infer<typeof mediaFormSchema>>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      name: "",
      description: "",
      youtubeId: "",
      categoryId: "",
      isActive: true,
    },
  });

  // Load categories and media on component mount
  useEffect(() => {
    loadCategoriesAndMedia();
  }, []);

  // Filter categories based on search query
  useEffect(() => {
    if (!categorySearchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const query = categorySearchQuery.toLowerCase().trim();
    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(query) || 
      category.description.toLowerCase().includes(query)
    );
    
    setFilteredCategories(filtered);
    setCategoriesCurrentPage(1);
  }, [categorySearchQuery, categories]);

  // Filter media based on category selection and search query
  useEffect(() => {
    filterMedias();
  }, [selectedCategoryId, mediaSearchQuery, medias]);

  // Update media form category when category selection changes
  useEffect(() => {
    if (selectedCategoryId && selectedCategoryId !== "_all") {
      createMediaForm.setValue('categoryId', selectedCategoryId);
    } else if (categories.length > 0) {
      createMediaForm.setValue('categoryId', categories[0].id.toString());
    }
  }, [selectedCategoryId, categories, createMediaForm]);

  const loadCategoriesAndMedia = async () => {
    try {
      setLoading(true);
      
      // Load all categories
      const categoriesData = await categoryService.getAllCategories();
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
      } else {
        console.warn('⚠️ Received non-array categories data, setting empty array');
        setCategories([]);
        setFilteredCategories([]);
      }
      
      // Load all media
      const mediaData = await mediaService.getAllMedia();
      if (Array.isArray(mediaData)) {
        setMedias(mediaData);
      } else {
        console.warn('⚠️ Received non-array media data, setting empty array');
        setMedias([]);
      }
      
    } catch (error: unknown) {
      console.error("Failed to load categories or media:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Impossible de charger les données.";
      showAlert('error', 'Erreur', errorMessage);
      
      // Set empty arrays on error
      setCategories([]);
      setFilteredCategories([]);
      setMedias([]);
      setFilteredMedias([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMedias = () => {
    let filtered = [...medias];
    
    // Filter by category if one is selected and not "_all"
    if (selectedCategoryId && selectedCategoryId !== "_all") {
      filtered = filtered.filter(media => 
        media.category && media.category.id === parseInt(selectedCategoryId)
      );
    }
    
    // Filter by search query if present
    if (mediaSearchQuery.trim()) {
      const query = mediaSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(media => 
        media.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredMedias(filtered);
    setMediaCurrentPage(1);
  };

  // Category handlers
  const handleCreateCategory = async (values: z.infer<typeof categoryFormSchema>) => {
    try {
      const categoryData: CreateCategoryRequest = {
        name: values.name,
        description: values.description,
      };
      
      await categoryService.createCategory(categoryData);
      showAlert('success', 'Catégorie créée', 'La catégorie a été créée avec succès.');
      
      // Reset form and close dialog
      createCategoryForm.reset();
      setIsCreateCategoryDialogOpen(false);
      
      // Reload data
      loadCategoriesAndMedia();
    } catch (error: unknown) {
      console.error("Failed to create category:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Impossible de créer la catégorie.";
      showAlert('error', 'Erreur', errorMessage);
    }
  };

  const handleEditCategory = async (values: z.infer<typeof categoryFormSchema>) => {
    if (!editingCategory) return;

    try {
      await categoryService.updateCategory(editingCategory.id, {
        name: values.name,
        description: values.description,
      });
      
      showAlert('success', 'Catégorie modifiée', 'La catégorie a été modifiée avec succès.');
      
      // Reset form and close dialog
      editCategoryForm.reset();
      setIsEditCategoryDialogOpen(false);
      setEditingCategory(null);
      
      // Reload data
      loadCategoriesAndMedia();
    } catch (error: unknown) {
      console.error("Failed to update category:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Impossible de modifier la catégorie.";
      showAlert('error', 'Erreur', errorMessage);
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`)) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      showAlert('success', 'Catégorie supprimée', 'La catégorie a été supprimée avec succès.');
      
      // Reload data
      loadCategoriesAndMedia();
    } catch (error: unknown) {
      console.error("Failed to delete category:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Impossible de supprimer la catégorie.";
      showAlert('error', 'Erreur', errorMessage);
    }
  };

  const openEditCategoryDialog = (category: ApiCategory) => {
    setEditingCategory(category);
    editCategoryForm.reset({
      name: category.name,
      description: category.description,
    });
    setIsEditCategoryDialogOpen(true);
  };

  // Media handlers
  const handleCreateMedia = async (values: z.infer<typeof mediaFormSchema>) => {
    try {
      const mediaData: CreateMediaRequest = {
        name: values.name,
        description: values.description,
        youtubeId: values.youtubeId,
        category: parseInt(values.categoryId),
        isActive: values.isActive,
      };
      
      await mediaService.createMedia(mediaData);
      showAlert('success', 'Média créé', 'Le média a été créé avec succès.');
      
      // Reset form and close dialog
      createMediaForm.reset({
        name: "",
        description: "",
        youtubeId: "",
        categoryId: "",
        isActive: true,
      });
      setIsCreateMediaDialogOpen(false);
      
      // Reload data
      loadCategoriesAndMedia();
    } catch (error: unknown) {
      console.error("Failed to create media:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Impossible de créer le média.";
      showAlert('error', 'Erreur', errorMessage);
    }
  };

  const handleEditMedia = async (values: z.infer<typeof mediaFormSchema>) => {
    if (!editingMedia) return;

    try {
      await mediaService.updateMedia(editingMedia.id, {
        name: values.name,
        description: values.description,
        youtubeId: values.youtubeId,
        category: parseInt(values.categoryId),
        isActive: values.isActive,
      });
      
      showAlert('success', 'Média modifié', 'Le média a été modifié avec succès.');
      
      // Reset form and close dialog
      editMediaForm.reset({
        name: "",
        description: "",
        youtubeId: "",
        categoryId: "",
        isActive: true,
      });
      setIsEditMediaDialogOpen(false);
      setEditingMedia(null);
      
      // Reload data
      loadCategoriesAndMedia();
    } catch (error: unknown) {
      console.error("Failed to update media:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Impossible de modifier le média.";
      showAlert('error', 'Erreur', errorMessage);
    }
  };

  const handleDeleteMedia = async (mediaId: number, mediaName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le média "${mediaName}" ?`)) {
      return;
    }

    try {
      await mediaService.deleteMedia(mediaId);
      showAlert('success', 'Média supprimé', 'Le média a été supprimé avec succès.');
      
      // Reload data
      loadCategoriesAndMedia();
    } catch (error: unknown) {
      console.error("Failed to delete media:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Impossible de supprimer le média.";
      showAlert('error', 'Erreur', errorMessage);
    }
  };

  const openEditMediaDialog = (media: ApiMedia) => {
    setEditingMedia(media);
    editMediaForm.reset({
      name: media.name,
      description: media.description || "",
      youtubeId: media.youtubeId || "",
      categoryId: media.category?.id.toString() || "",
      isActive: media.isActive,
    });
    setIsEditMediaDialogOpen(true);
  };

  // Utility functions
  const getPlatformIcon = (mediaName: string) => {
    const name = mediaName.toLowerCase();
    if (name.includes('youtube') || name.includes('yt')) return <Youtube className="h-4 w-4" />;
    if (name.includes('tiktok') || name.includes('tt')) return <Video className="h-4 w-4" />;
    return <FileVideo className="h-4 w-4" />;
  };

  const calculateMediaStats = () => {
    const totalMedia = filteredMedias.length;
    const activeMedia = filteredMedias.filter(media => media.isActive).length;
    const inactiveMedia = filteredMedias.filter(media => !media.isActive).length;

    return {
      totalMedia,
      activeMedia,
      inactiveMedia,
    };
  };

  // Pagination functions
  const paginateCategories = (pageNumber: number) => {
    setCategoriesCurrentPage(pageNumber);
    // Scroll to top of the page content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginateMedia = (pageNumber: number) => {
    setMediaCurrentPage(pageNumber);
    // Scroll to top of the page content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Page size change handlers
  const handleCategoriesPageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCategoriesCurrentPage(1); // Reset to first page when changing page size
  };

  const handleMediaPageSizeChange = (newSize: number) => {
    setMediaItemsPerPage(newSize);
    setMediaCurrentPage(1); // Reset to first page when changing page size
  };

  // Pagination calculations for categories
  const categoriesIndexOfLastItem = categoriesCurrentPage * itemsPerPage;
  const categoriesIndexOfFirstItem = categoriesIndexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(categoriesIndexOfFirstItem, categoriesIndexOfLastItem);
  const categoriesTotalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  // Pagination calculations for media
  const mediaIndexOfLastItem = mediaCurrentPage * mediaItemsPerPage;
  const mediaIndexOfFirstItem = mediaIndexOfLastItem - mediaItemsPerPage;
  const currentMedias = filteredMedias.slice(mediaIndexOfFirstItem, mediaIndexOfLastItem);
  const mediaTotalPages = Math.ceil(filteredMedias.length / mediaItemsPerPage);

  const mediaStats = calculateMediaStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Catégories et Médias</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Catégories ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <FileVideo className="h-4 w-4" />
              Médias ({medias.length})
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des catégories..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="pl-8 w-[300px]"
                  />
                </div>
              </div>
              <Dialog open={isCreateCategoryDialogOpen} onOpenChange={setIsCreateCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Créer une catégorie
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
                    <DialogDescription>
                      Ajoutez une nouvelle catégorie pour organiser vos médias.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createCategoryForm}>
                    <form onSubmit={createCategoryForm.handleSubmit(handleCreateCategory)} className="space-y-4">
                      <FormField
                        control={createCategoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom de la catégorie" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createCategoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Description de la catégorie" 
                                {...field} 
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateCategoryDialogOpen(false)}
                        >
                          Annuler
                        </Button>
                        <Button type="submit">Créer</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Tag className="mr-2 h-4 w-4" />
                      {category.name}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditCategoryDialog(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{category.mediasCount || 0} médias</span>
                        <span>{category.datetime ? new Date(category.datetime).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setSelectedCategoryId(category.id.toString());
                        setActiveTab("media");
                      }}
                    >
                      Voir les médias
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Categories Pagination */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <PaginationInfo
                  currentPage={categoriesCurrentPage}
                  totalPages={categoriesTotalPages}
                  totalItems={filteredCategories.length}
                  itemsPerPage={itemsPerPage}
                  itemName="catégories"
                />
                <PageSizeSelector
                  pageSize={itemsPerPage}
                  onPageSizeChange={handleCategoriesPageSizeChange}
                  pageSizeOptions={[6, 12, 18, 24]}
                  itemName="catégories"
                />
              </div>
              <Pagination
                currentPage={categoriesCurrentPage}
                totalPages={categoriesTotalPages}
                onPageChange={paginateCategories}
                maxVisiblePages={5}
              />
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            {/* Media Stats */}
            <MediaStats 
              totalMedia={mediaStats.totalMedia}
              activeMedia={mediaStats.activeMedia}
              inactiveMedia={mediaStats.inactiveMedia}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des médias..."
                    value={mediaSearchQuery}
                    onChange={(e) => setMediaSearchQuery(e.target.value)}
                    className="pl-8 w-[300px]"
                  />
                </div>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrer par catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Toutes les catégories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isCreateMediaDialogOpen} onOpenChange={setIsCreateMediaDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un média
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau média</DialogTitle>
                    <DialogDescription>
                      Ajoutez un nouveau média à une catégorie.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createMediaForm}>
                    <form onSubmit={createMediaForm.handleSubmit(handleCreateMedia)} className="space-y-4">
                      <FormField
                        control={createMediaForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du média</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom du média" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createMediaForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Description du média" 
                                {...field} 
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createMediaForm.control}
                        name="youtubeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID YouTube</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: dQw4w9WgXcQ" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createMediaForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Catégorie</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une catégorie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createMediaForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Statut</FormLabel>
                              <FormDescription>
                                Activer ou désactiver ce média
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateMediaDialogOpen(false)}
                        >
                          Annuler
                        </Button>
                        <Button type="submit">Créer</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentMedias.map((media) => (
                <Card key={media.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      {getPlatformIcon(media.name)}
                      <span className="ml-2 truncate">{media.name}</span>
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditMediaDialog(media)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMedia(media.id, media.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={media.isActive ? 'default' : 'secondary'}>
                          {media.isActive ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {media.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Vidéos:</span>
                          <span>{media.videosCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Plateformes:</span>
                          <span>{media.connectedPlatformsCount || 0}</span>
                        </div>
                        {media.category && (
                          <div className="flex items-center justify-between">
                            <span>Catégorie:</span>
                            <Badge variant="outline" className="text-xs">
                              {media.category.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Media Pagination */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <PaginationInfo
                  currentPage={mediaCurrentPage}
                  totalPages={mediaTotalPages}
                  totalItems={filteredMedias.length}
                  itemsPerPage={mediaItemsPerPage}
                  itemName="médias"
                />
                <PageSizeSelector
                  pageSize={mediaItemsPerPage}
                  onPageSizeChange={handleMediaPageSizeChange}
                  pageSizeOptions={[8, 16, 24, 32]}
                  itemName="médias"
                />
              </div>
              <Pagination
                currentPage={mediaCurrentPage}
                totalPages={mediaTotalPages}
                onPageChange={paginateMedia}
                maxVisiblePages={7}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Category Dialog */}
        <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la catégorie</DialogTitle>
              <DialogDescription>
                Modifiez les informations de la catégorie.
              </DialogDescription>
            </DialogHeader>
            <Form {...editCategoryForm}>
              <form onSubmit={editCategoryForm.handleSubmit(handleEditCategory)} className="space-y-4">
                <FormField
                  control={editCategoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de la catégorie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editCategoryForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description de la catégorie" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditCategoryDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">Modifier</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Media Dialog */}
        <Dialog open={isEditMediaDialogOpen} onOpenChange={setIsEditMediaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le média</DialogTitle>
              <DialogDescription>
                Modifiez les informations du média.
              </DialogDescription>
            </DialogHeader>
            <Form {...editMediaForm}>
              <form onSubmit={editMediaForm.handleSubmit(handleEditMedia)} className="space-y-4">
                <FormField
                  control={editMediaForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du média</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du média" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editMediaForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description du média" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editMediaForm.control}
                  name="youtubeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID YouTube</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: dQw4w9WgXcQ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editMediaForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editMediaForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Statut</FormLabel>
                        <FormDescription>
                          Activer ou désactiver ce média
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditMediaDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">Modifier</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 