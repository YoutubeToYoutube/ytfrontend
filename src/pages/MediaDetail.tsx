import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Play, 
  Film, 
  Globe, 
  Upload, 
  Edit, 
  Clock,
  Eye,
  Users,
  Calendar,
  FileVideo,
  Link
} from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import mediaService, { type ApiMedia, type MediaVideo, type UpdateMediaRequest } from '@/services/mediaService';
import categoryService, { type ApiCategory } from '@/services/categoryService';
import configService, {
  type ApiChannelConfig,
  type CreateChannelConfigRequest
} from "@/services/configService";
import introService, { type ApiIntro } from '@/services/introService';
import outroService, { type ApiOutro } from '@/services/outroService';
import languageService, { type ApiLanguage } from '@/services/languageService';

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const mediaConfigSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  introId: z.string(),
  outroId: z.string(),
  languageId: z.string(),
});

const mediaEditSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  youtubeId: z.string().optional(),
  category: z.string().min(1, "La catégorie est requise"),
  isActive: z.boolean(),
});

type MediaConfig = z.infer<typeof mediaConfigSchema>;
type MediaEdit = z.infer<typeof mediaEditSchema>;

export default function MediaDetail() {
  const { id } = useParams<{ id: string }>();
  const { showAlert } = useAlerts();
  const [media, setMedia] = useState<ApiMedia | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [configs, setConfigs] = useState<{
    intros: ApiIntro[];
    outros: ApiOutro[];
    languages: ApiLanguage[];
  }>({
    intros: [],
    outros: [],
    languages: [],
  });
  const [channelConfig, setChannelConfig] = useState<ApiChannelConfig | null>(null);
  const [recentVideos, setRecentVideos] = useState<MediaVideo[]>([]);

  const configForm = useForm<MediaConfig>({
    resolver: zodResolver(mediaConfigSchema),
    defaultValues: {
      name: "",
      introId: "_none",
      outroId: "_none",
      languageId: "_none",
    },
  });

  const editForm = useForm<MediaEdit>({
    resolver: zodResolver(mediaEditSchema),
    defaultValues: {
      name: "",
      description: "",
      youtubeId: "",
      category: "",
      isActive: true,
    } as MediaEdit,
  });

  useEffect(() => {
    const fetchMediaDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching media details for ID:", id);
        
        // Fetch categories first
        try {
          const categoriesData = await categoryService.getAllCategories();
          console.log("Categories fetched:", categoriesData);
          setCategories(categoriesData);
        } catch (error) {
          console.error("Error fetching categories:", error);
          // Continue execution even if categories fail to load
          setCategories([]);
        }
        
        // Then fetch media details
        try {
          const mediaData = await mediaService.getMediaById(parseInt(id));
          console.log("Media data fetched:", mediaData);
          
          // Vérifier que les données du média sont valides
          if (!mediaData) {
            throw new Error("Les données du média sont vides");
          }
          
          setMedia(mediaData);
          
          // Set edit form values
          editForm.reset({
            name: mediaData.name || "",
            description: mediaData.description || "",
            youtubeId: mediaData.youtubeId || "",
            category: mediaData.category?.id?.toString() || "",
            isActive: typeof mediaData.isActive === 'boolean' ? mediaData.isActive : true,
          } as MediaEdit);
        } catch (error) {
          console.error("Error fetching media details:", error);
          showAlert(
            "error",
            "Erreur",
            "Impossible de charger les détails du média"
          );
          // Stop loading if media details can't be fetched
          setIsLoading(false);
          return;
        }
        
        // Fetch configurations
        try {
          console.log("Fetching configurations...");
          const [introsResponse, outros, languages] = await Promise.all([
            introService.getAllIntros(1, 100).catch(e => { 
              console.error("Error fetching intros:", e); 
              return { data: [] }; 
            }),
            outroService.getAllOutros().catch(e => { 
              console.error("Error fetching outros:", e); 
              return []; 
            }),
            languageService.getAllLanguages().catch(e => { 
              console.error("Error fetching languages:", e); 
              return []; 
            }),
          ]);
          
          console.log("Configurations fetched:", { intros: introsResponse.data, outros, languages });
          
          setConfigs({
            intros: introsResponse.data,
            outros,
            languages,
          });
          
          // Get the channel config if it exists
          try {
            const channelConfigs = await configService.getChannelConfigsByMedia(parseInt(id));
            console.log("Channel configs fetched:", channelConfigs);
            const currentConfig = channelConfigs.length > 0 ? channelConfigs[0] : null;
            setChannelConfig(currentConfig);
            
            // Set config form values if channel config exists
            configForm.reset({
              name: currentConfig?.name || `Configuration pour ${media?.name || ""}`,
              introId: currentConfig?.intro.length ? currentConfig.intro[0].id.toString() : "_none",
              outroId: currentConfig?.outro.length ? currentConfig.outro[0].id.toString() : "_none",
              languageId: currentConfig?.language.length ? currentConfig.language[0].id.toString() : "_none",
            });
          } catch (error) {
            console.error("Error fetching channel configs:", error);
            // Continue execution even if channel configs fail to load
          }
        } catch (error) {
          console.error("Error fetching configurations:", error);
          // Continue execution even if configurations fail to load
        }
        
        // Fetch recent videos
        try {
          console.log("Fetching recent videos...");
          // Utiliser getMockRecentVideos au lieu de getRecentVideos
          const videos = mediaService.getMockRecentVideos();
          console.log("Recent videos fetched:", videos);
          setRecentVideos(videos);
        } catch (error) {
          console.error("Error fetching videos:", error);
          // Fallback en cas d'erreur
          setRecentVideos([
            {
              id: "video1",
              title: "Visite virtuelle complète de la propriété",
              thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
              publishedAt: "2024-03-14",
              views: 1205,
            },
            {
              id: "video2",
              title: "Découverte de l'intérieur de la maison",
              thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
              publishedAt: "2024-03-10",
              views: 843,
            },
            {
              id: "video3",
              title: "Tour du jardin et extérieur",
              thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
              publishedAt: "2024-03-05",
              views: 1567,
            },
          ]);
        }
      } catch (error) {
        console.error("Error in fetchMediaDetails:", error);
        showAlert(
          "error",
          "Erreur",
          "Impossible de charger les détails du média"
        );
      } finally {
        console.log("Setting isLoading to false");
        setIsLoading(false);
      }
    };

    fetchMediaDetails();
    
    // Sécurité: si le chargement dure plus de 10 secondes, on force l'arrêt
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("Loading timeout reached, forcing loading state to false");
        setIsLoading(false);
        showAlert(
          "info",
          "Attention",
          "Le chargement a pris trop de temps. Certaines données peuvent être manquantes."
        );
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [id, showAlert, configForm, editForm]);

  const onSubmitConfig = async (values: MediaConfig) => {
    if (!id || !media) return;
    
    try {
      const configData: CreateChannelConfigRequest = {
        name: values.name,
        mediaId: parseInt(id),
        introId: values.introId && values.introId !== "_none" ? parseInt(values.introId) : undefined,
        outroId: values.outroId && values.outroId !== "_none" ? parseInt(values.outroId) : undefined,
        languageId: values.languageId && values.languageId !== "_none" ? parseInt(values.languageId) : undefined,
      };
      
      await configService.createChannelConfig(configData);
      
      showAlert(
        "success",
        "Succès",
        "Configuration du média mise à jour avec succès"
      );
      
      // Reload channel configs
      const updatedConfigs = await configService.getChannelConfigsByMedia(parseInt(id));
      setChannelConfig(updatedConfigs.length > 0 ? updatedConfigs[0] : null);
      
    } catch (error) {
      console.error("Error updating media config:", error);
      showAlert(
        "error",
        "Erreur",
        "Impossible de mettre à jour la configuration du média"
      );
    }
  };

  const onSubmitEdit = async (values: MediaEdit) => {
    if (!id || !media) return;
    
    try {
      const mediaData: UpdateMediaRequest = {
        name: values.name,
        description: values.description,
        youtubeId: values.youtubeId,
        category: parseInt(values.category),
        isActive: values.isActive,
      };
      
      const updatedMedia = await mediaService.updateMedia(parseInt(id), mediaData);
      setMedia(updatedMedia);
      
      showAlert(
        "success",
        "Succès",
        "Média mis à jour avec succès"
      );
      
      setIsEditDialogOpen(false);
      
    } catch (error) {
      console.error("Error updating media:", error);
      showAlert(
        "error",
        "Erreur",
        "Impossible de mettre à jour le média"
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadCover = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !selectedFile) return;
    
    try {
      const result = await mediaService.uploadCoverImage(parseInt(id), selectedFile);
      
      // Update media with new cover image URL
      setMedia(prev => prev ? { ...prev, coverImageUrl: result.coverImageUrl } : null);
      
      showAlert(
        "success",
        "Succès",
        "Image de couverture téléchargée avec succès"
      );
      
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      
    } catch (error) {
      console.error("Error uploading cover image:", error);
      showAlert(
        "error",
        "Erreur",
        "Impossible de télécharger l'image de couverture"
      );
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement des informations du média...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!media) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col items-center justify-center h-64">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Média non trouvé</h1>
            <p className="text-gray-600 mb-6">Le média avec l'identifiant {id} n'existe pas ou n'est pas accessible.</p>
            <Button onClick={() => window.history.back()}>Retourner à la page précédente</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback pour les configurations si elles n'ont pas été chargées
  const hasConfigurations = configs.intros.length > 0 || configs.outros.length > 0 || configs.languages.length > 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        {/* Cover Image and Title */}
        <div className="relative w-full h-48 md:h-64 lg:h-80 mb-6 rounded-lg overflow-hidden">
          <img
            src={media.coverImageUrl || "https://placehold.co/1200x400?text=Cover+Image"}
            alt={`${media.name} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-white">{media.name}</h1>
                <div className="flex items-center text-white/80 mt-2">
                  <Play className="h-4 w-4 mr-2" />
                  <span>ID: {media.youtubeId}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/20 text-white border-white/20 hover:bg-white/30"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Changer la couverture
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/20 text-white border-white/20 hover:bg-white/30"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Media Information */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Informations</CardTitle>
                <CardDescription>Détails sur ce média</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                    <div className="mt-1">
                      <Badge variant={media.isActive ? 'default' : 'secondary'}>
                        {media.isActive ? (
                          <Eye className="mr-1 h-3 w-3" />
                        ) : (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {media.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
                    <div className="mt-1">
                      <Badge variant="outline" className="flex items-center">
                        <FileVideo className="mr-1 h-3 w-3" />
                        {media.category?.name || "Non catégorisé"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                    <p className="mt-1 text-sm flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(media.creationDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nombre de vidéos</h3>
                    <p className="mt-1 text-sm">{media.videosCount || 0}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Identifiants actifs</h3>
                    <p className="mt-1 text-sm flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {media.activeCredentialsCount || 0}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Plateformes connectées</h3>
                    <p className="mt-1 text-sm flex items-center">
                      <Link className="mr-1 h-3 w-3" />
                      {media.connectedPlatformsCount || 0}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="text-gray-600 mt-1">{media.description || "Aucune description disponible"}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Vidéos récentes</CardTitle>
                <CardDescription>Les 3 dernières vidéos publiées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentVideos.length > 0 ? (
                    recentVideos.map((video) => (
                      <Card key={video.id} className="overflow-hidden">
                        <div className="aspect-video w-full">
                          <img 
                            src={video.thumbnail || "https://placehold.co/640x360?text=No+Thumbnail"} 
                            alt={video.title || "Vidéo sans titre"} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm line-clamp-2">{video.title || "Vidéo sans titre"}</h4>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                            <span>{video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : "Date inconnue"}</span>
                            <span>{typeof video.views === 'number' ? video.views.toLocaleString() : "0"} vues</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8">
                      <p className="text-gray-500">Aucune vidéo récente disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Configuration */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Paramètres de ce média</CardDescription>
              </CardHeader>
              <CardContent>
                {!hasConfigurations ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-4">Les configurations ne sont pas disponibles pour le moment.</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      Rafraîchir la page
                    </Button>
                  </div>
                ) : (
                  <Form {...configForm}>
                    <form onSubmit={configForm.handleSubmit(onSubmitConfig)} className="space-y-4">
                      <FormField
                        control={configForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de la configuration</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nom de la configuration" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={configForm.control}
                        name="introId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Film className="h-4 w-4 mr-2" />
                              Intro
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "_none"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une intro" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="_none">Aucune intro</SelectItem>
                                {configs.intros.map((intro) => (
                                  <SelectItem key={intro.id} value={intro.id.toString()}>
                                    {intro.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Vidéo d'introduction à ajouter au début
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={configForm.control}
                        name="outroId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Film className="h-4 w-4 mr-2" />
                              Outro
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "_none"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une outro" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="_none">Aucune outro</SelectItem>
                                {configs.outros.map((outro) => (
                                  <SelectItem key={outro.id} value={outro.id.toString()}>
                                    {outro.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Vidéo de conclusion à ajouter à la fin
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={configForm.control}
                        name="languageId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Globe className="h-4 w-4 mr-2" />
                              Langue
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "_none"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une langue" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="_none">Non spécifié</SelectItem>
                                {configs.languages.map((language) => (
                                  <SelectItem key={language.id} value={language.id.toString()}>
                                    {language.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Langue principale du contenu
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full">
                        {channelConfig ? "Mettre à jour la configuration" : "Créer une configuration"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Media Dialog */}
        {isEditDialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Modifier le média</CardTitle>
                <CardDescription>Mettre à jour les informations du média</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nom du média" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Description du média" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="youtubeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID YouTube</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: dQw4w9WgXcQ" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="category"
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
                      control={editForm.control}
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
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Annuler
                      </Button>
                      <Button type="submit">Enregistrer</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upload Cover Dialog */}
        {isUploadDialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Télécharger une image de couverture</CardTitle>
                <CardDescription>Choisissez une image pour la couverture du média</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadCover} className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <label htmlFor="cover-image" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Image de couverture
                    </label>
                    <Input
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  {selectedFile && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Fichier sélectionné: {selectedFile.name}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsUploadDialogOpen(false);
                        setSelectedFile(null);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={!selectedFile}>Télécharger</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 