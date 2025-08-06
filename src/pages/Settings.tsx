import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Settings as SettingsIcon, 
  Play, 
  Film, 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  Clock,
  Link
} from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import introService, { type ApiIntro } from '@/services/introService';
import outroService, { type ApiOutro } from '@/services/outroService';
import languageService, { type ApiLanguage } from '@/services/languageService';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Schémas de validation
const introSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  source: z.string().min(1, "Le fichier source est requis"),
  type: z.string().min(1, "Le type est requis"),
  duration: z.number().min(1000, "La durée doit être d'au moins 1 seconde"),
  hasAnimation: z.boolean(),
  customText: z.string(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur invalide (format: #RRGGBB)"),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur invalide (format: #RRGGBB)"),
  hasCallToAction: z.boolean(),
  callToActionText: z.string(),
  callToActionUrl: z.string(),
  isActive: z.boolean(),
});

const outroSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  source: z.string().min(1, "Le fichier source est requis"),
  duration: z.number().min(1000, "La durée doit être d'au moins 1 seconde"),
  hasAnimation: z.boolean(),
  customText: z.string(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur invalide (format: #RRGGBB)"),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur invalide (format: #RRGGBB)"),
  hasCallToAction: z.boolean(),
  callToActionText: z.string(),
  callToActionUrl: z.string(),
  isActive: z.boolean(),
});

const languageSchema = z.object({
  code: z.string().min(2, "Le code doit contenir au moins 2 caractères").max(5, "Le code ne peut pas dépasser 5 caractères"),
  name: z.string().min(1, "Le nom est requis"),
  active: z.boolean(),
});

type IntroFormData = z.infer<typeof introSchema>;
type OutroFormData = z.infer<typeof outroSchema>;
type LanguageFormData = z.infer<typeof languageSchema>;

export default function Settings() {
  const { showAlert } = useAlerts();
  const [activeTab, setActiveTab] = useState("intros");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour les données
  const [intros, setIntros] = useState<ApiIntro[]>([]);
  const [outros, setOutros] = useState<ApiOutro[]>([]);
  const [languages, setLanguages] = useState<ApiLanguage[]>([]);
  
  // États pour la pagination des intros
  const [introPagination, setIntroPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // États pour les dialogues
  const [isIntroDialogOpen, setIsIntroDialogOpen] = useState(false);
  const [isOutroDialogOpen, setIsOutroDialogOpen] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiIntro | ApiOutro | ApiLanguage | null>(null);
  
  // Formulaires
  const introForm = useForm<IntroFormData>({
    resolver: zodResolver(introSchema),
    defaultValues: {
      name: "",
      description: "",
      source: "",
      type: "video",
      duration: 5000,
      hasAnimation: true,
      customText: "",
      backgroundColor: "#000000",
      textColor: "#ffffff",
      hasCallToAction: false,
      callToActionText: "",
      callToActionUrl: "",
      isActive: true,
    },
  });
  
  const outroForm = useForm<OutroFormData>({
    resolver: zodResolver(outroSchema),
    defaultValues: {
      name: "",
      description: "",
      source: "",
      duration: 5000,
      hasAnimation: true,
      customText: "",
      backgroundColor: "#000000",
      textColor: "#ffffff",
      hasCallToAction: false,
      callToActionText: "",
      callToActionUrl: "",
      isActive: true,
    },
  });
  
  const languageForm = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      code: "",
      name: "",
      active: true,
    },
  });

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Charger les intros avec pagination
      const introsResponse = await introService.getAllIntros(1, 10);
      setIntros(introsResponse.data);
      setIntroPagination(introsResponse.pagination);
      
      // Charger les outros et langues (garder l'ancienne méthode pour l'instant)
      const [outrosData, languagesData] = await Promise.all([
        outroService.getAllOutros(),
        languageService.getAllLanguages(),
      ]);
      
      setOutros(outrosData);
      setLanguages(languagesData);
    } catch (error) {
      console.error('Error loading settings data:', error);
      showAlert('error', 'Erreur', 'Impossible de charger les paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger plus d'intros (pagination)
  const loadMoreIntros = async (page: number) => {
    try {
      const response = await introService.getAllIntros(page, introPagination.limit);
      setIntros(response.data);
      setIntroPagination(response.pagination);
    } catch (error) {
      console.error('Error loading more intros:', error);
      showAlert('error', 'Erreur', 'Impossible de charger plus d\'intros');
    }
  };

  // Gestion des intros
  const handleCreateIntro = async (data: IntroFormData) => {
    try {
      const newIntro = await introService.createIntro(data);
      setIntros(prev => [newIntro, ...prev]);
      setIsIntroDialogOpen(false);
      introForm.reset();
      showAlert('success', 'Succès', 'Intro créée avec succès');
    } catch (error) {
      console.error('Error creating intro:', error);
      showAlert('error', 'Erreur', 'Impossible de créer l\'intro');
    }
  };

  /**
   * Met à jour un ou plusieurs champs d'une intro indépendamment.
   * @param {Partial<IntroFormData>} data - Les champs à mettre à jour.
   */
  const handleUpdateIntro = async (data: Partial<IntroFormData>) => {
    if (!editingItem || !('hasAnimation' in editingItem)) return;

    try {
      // On ne met à jour que les champs fournis dans `data`
      const updatedFields = { ...editingItem, ...data };

      // Appel au service avec uniquement les champs modifiés
      const updatedIntro = await introService.updateIntro(editingItem.id, data);

      setIntros(prev =>
        prev.map(intro =>
          intro.id === editingItem.id ? { ...intro, ...updatedFields, ...updatedIntro } : intro
        )
      );
      setIsIntroDialogOpen(false);
      setEditingItem(null);
      introForm.reset();
      showAlert('success', 'Succès', 'Intro mise à jour avec succès');
    } catch (error) {
      console.error('Error updating intro:', error);
      showAlert('error', 'Erreur', 'Impossible de mettre à jour l\'intro');
    }
  };

  const handleDeleteIntro = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette intro ?')) return;
    
    try {
      await introService.deleteIntro(id);
      setIntros(prev => prev.filter(intro => intro.id !== id));
      showAlert('success', 'Succès', 'Intro supprimée avec succès');
    } catch (error) {
      console.error('Error deleting intro:', error);
      showAlert('error', 'Erreur', 'Impossible de supprimer l\'intro');
    }
  };

  const handleToggleIntroStatus = async (id: number) => {
    try {
      const updatedIntro = await introService.toggleIntroStatus(id);
      setIntros(prev => prev.map(intro => intro.id === id ? updatedIntro : intro));
      showAlert('success', 'Succès', 'Statut de l\'intro mis à jour');
    } catch (error) {
      console.error('Error toggling intro status:', error);
      showAlert('error', 'Erreur', 'Impossible de modifier le statut de l\'intro');
    }
  };

  // Gestion des outros
  const handleCreateOutro = async (data: OutroFormData) => {
    try {
      const newOutro = await outroService.createOutro(data);
      setOutros(prev => [...prev, newOutro]);
      setIsOutroDialogOpen(false);
      outroForm.reset();
      showAlert('success', 'Succès', 'Outro créée avec succès');
    } catch (error) {
      console.error('Error creating outro:', error);
      showAlert('error', 'Erreur', 'Impossible de créer l\'outro');
    }
  };

  const handleUpdateOutro = async (data: OutroFormData) => {
    if (!editingItem || !('hasAnimation' in editingItem)) return;
    
    try {
      const updatedOutro = await outroService.updateOutro(editingItem.id, data);
      setOutros(prev => prev.map(outro => outro.id === editingItem.id ? updatedOutro : outro));
      setIsOutroDialogOpen(false);
      setEditingItem(null);
      outroForm.reset();
      showAlert('success', 'Succès', 'Outro mise à jour avec succès');
    } catch (error) {
      console.error('Error updating outro:', error);
      showAlert('error', 'Erreur', 'Impossible de mettre à jour l\'outro');
    }
  };

  const handleDeleteOutro = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette outro ?')) return;
    
    try {
      await outroService.deleteOutro(id);
      setOutros(prev => prev.filter(outro => outro.id !== id));
      showAlert('success', 'Succès', 'Outro supprimée avec succès');
    } catch (error) {
      console.error('Error deleting outro:', error);
      showAlert('error', 'Erreur', 'Impossible de supprimer l\'outro');
    }
  };

  // Gestion des langues
  const handleCreateLanguage = async (data: LanguageFormData) => {
    try {
      const newLanguage = await languageService.createLanguage(data);
      setLanguages(prev => [...prev, newLanguage]);
      setIsLanguageDialogOpen(false);
      languageForm.reset();
      showAlert('success', 'Succès', 'Langue créée avec succès');
    } catch (error) {
      console.error('Error creating language:', error);
      showAlert('error', 'Erreur', 'Impossible de créer la langue');
    }
  };

  const handleUpdateLanguage = async (data: LanguageFormData) => {
    if (!editingItem || !('code' in editingItem)) return;
    
    try {
      const updatedLanguage = await languageService.updateLanguage(editingItem.id, data);
      setLanguages(prev => prev.map(lang => lang.id === editingItem.id ? updatedLanguage : lang));
      setIsLanguageDialogOpen(false);
      setEditingItem(null);
      languageForm.reset();
      showAlert('success', 'Succès', 'Langue mise à jour avec succès');
    } catch (error) {
      console.error('Error updating language:', error);
      showAlert('error', 'Erreur', 'Impossible de mettre à jour la langue');
    }
  };

  const handleDeleteLanguage = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette langue ?')) return;
    
    try {
      await languageService.deleteLanguage(id);
      setLanguages(prev => prev.filter(lang => lang.id !== id));
      showAlert('success', 'Succès', 'Langue supprimée avec succès');
    } catch (error) {
      console.error('Error deleting language:', error);
      showAlert('error', 'Erreur', 'Impossible de supprimer la langue');
    }
  };

  // Ouvrir les dialogues d'édition
  const openEditIntroDialog = (intro: ApiIntro) => {
    setEditingItem(intro);
    introForm.reset({
      name: intro.name,
      description: intro.description,
      source: intro.source,
      type: intro.type,
      duration: intro.duration,
      hasAnimation: intro.hasAnimation,
      customText: intro.customText,
      backgroundColor: intro.backgroundColor,
      textColor: intro.textColor,
      hasCallToAction: intro.hasCallToAction,
      callToActionText: intro.callToActionText,
      callToActionUrl: intro.callToActionUrl,
      isActive: intro.isActive,
    });
    setIsIntroDialogOpen(true);
  };

  const openEditOutroDialog = (outro: ApiOutro) => {
    setEditingItem(outro);
    outroForm.reset({
      name: outro.name,
      description: outro.description,
      source: outro.source,
      duration: outro.duration,
      hasAnimation: outro.hasAnimation,
      customText: outro.customText,
      backgroundColor: outro.backgroundColor,
      textColor: outro.textColor,
      hasCallToAction: outro.hasCallToAction,
      callToActionText: outro.callToActionText,
      callToActionUrl: outro.callToActionUrl,
      isActive: outro.isActive,
    });
    setIsOutroDialogOpen(true);
  };

  const openEditLanguageDialog = (language: ApiLanguage) => {
    setEditingItem(language);
    languageForm.reset({
      code: language.code,
      name: language.name,
      active: language.active,
    });
    setIsLanguageDialogOpen(true);
  };

  // Filtrer les données selon la recherche
  const filteredIntros = intros.filter(intro =>
    intro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    intro.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOutros = outros.filter(outro =>
    outro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    outro.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLanguages = languages.filter(language =>
    language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    language.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fermer les dialogues
  const closeDialogs = () => {
    setIsIntroDialogOpen(false);
    setIsOutroDialogOpen(false);
    setIsLanguageDialogOpen(false);
    setEditingItem(null);
    introForm.reset();
    outroForm.reset();
    languageForm.reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <SettingsIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Paramètres
          </h1>
          <p className="text-muted-foreground">
            Gérez les intros, outros et langues de votre application
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="intros" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Intros ({intros.length})
          </TabsTrigger>
          <TabsTrigger value="outros" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            Outros ({outros.length})
          </TabsTrigger>
          <TabsTrigger value="languages" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Langues ({languages.length})
          </TabsTrigger>
        </TabsList>

        {/* Onglet Intros */}
        <TabsContent value="intros" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Gestion des Intros</h2>
            <Dialog open={isIntroDialogOpen} onOpenChange={setIsIntroDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingItem(null);
                  introForm.reset();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Intro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Modifier l'Intro" : "Nouvelle Intro"}
                  </DialogTitle>
                  <DialogDescription>
                    Configurez les paramètres de l'intro vidéo
                  </DialogDescription>
                </DialogHeader>
                <Form {...introForm}>
                  <form
                    onSubmit={introForm.handleSubmit(
                      editingItem ? handleUpdateIntro : handleCreateIntro
                    )}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={introForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Intro Vidéo Moderne" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={introForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="video" />
                            </FormControl>
                            <FormDescription>
                              Type d'intro (ex: video, image, animation)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={introForm.control}
                        name="source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fichier Source</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="/templates/intro-video.html" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={introForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée (ms)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                placeholder="5000"
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={introForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Intro moderne pour vidéos YouTube"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={introForm.control}
                      name="customText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Texte Personnalisé</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Bienvenue sur notre chaîne!"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={introForm.control}
                        name="backgroundColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Couleur de Fond</FormLabel>
                            <FormControl>
                              <Input {...field} type="color" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={introForm.control}
                        name="textColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Couleur du Texte</FormLabel>
                            <FormControl>
                              <Input {...field} type="color" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={introForm.control}
                        name="hasAnimation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Animation</FormLabel>
                              <FormDescription>
                                Activer les animations pour cette intro
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
                      <FormField
                        control={introForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Actif</FormLabel>
                              <FormDescription>
                                Rendre cette intro disponible
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
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={closeDialogs}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        {editingItem ? "Mettre à jour" : "Créer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIntros.map((intro) => (
              <Card key={intro.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        {intro.name}
                      </CardTitle>
                      <CardDescription>{intro.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleIntroStatus(intro.id)}
                        title={intro.isActive ? "Désactiver" : "Activer"}
                      >
                        {intro.isActive ? <Eye className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditIntroDialog(intro)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteIntro(intro.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {intro.duration}ms
                    </span>
                    <Badge variant={intro.isActive ? "default" : "secondary"}>
                      {intro.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: intro.backgroundColor }}
                    />
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: intro.textColor }}
                    />
                    <span className="text-xs text-muted-foreground">
                      Couleurs
                    </span>
                  </div>

                  {intro.customText && (
                    <div className="text-sm">
                      <span className="font-medium">Texte:</span> {intro.customText}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    {intro.hasAnimation && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Animation
                      </Badge>
                    )}
                    {intro.hasCallToAction && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Link className="h-3 w-3" />
                        CTA
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination pour les intros */}
          {introPagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMoreIntros(introPagination.page - 1)}
                disabled={introPagination.page <= 1}
              >
                Précédent
              </Button>
              <span className="text-sm">
                Page {introPagination.page} sur {introPagination.totalPages} ({introPagination.total} intros)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMoreIntros(introPagination.page + 1)}
                disabled={introPagination.page >= introPagination.totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Onglet Outros */}
        <TabsContent value="outros" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Gestion des Outros</h2>
            <Dialog open={isOutroDialogOpen} onOpenChange={setIsOutroDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingItem(null);
                  outroForm.reset();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Outro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Modifier l\'Outro' : 'Nouvelle Outro'}
                  </DialogTitle>
                  <DialogDescription>
                    Configurez les paramètres de l'outro vidéo
                  </DialogDescription>
                </DialogHeader>
                <Form {...outroForm}>
                  <form onSubmit={outroForm.handleSubmit(editingItem ? handleUpdateOutro : handleCreateOutro)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={outroForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={outroForm.control}
                        name="source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fichier Source</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="/templates/outro.html" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={outroForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={outroForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée (ms)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={outroForm.control}
                        name="customText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texte Personnalisé</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={outroForm.control}
                        name="backgroundColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Couleur de Fond</FormLabel>
                            <FormControl>
                              <Input {...field} type="color" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={outroForm.control}
                        name="textColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Couleur du Texte</FormLabel>
                            <FormControl>
                              <Input {...field} type="color" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={outroForm.control}
                        name="hasAnimation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Animation</FormLabel>
                              <FormDescription>
                                Activer les animations pour cette outro
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

                      <FormField
                        control={outroForm.control}
                        name="hasCallToAction"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Call to Action</FormLabel>
                              <FormDescription>
                                Ajouter un bouton d'action
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

                      <FormField
                        control={outroForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Actif</FormLabel>
                              <FormDescription>
                                Rendre cette outro disponible
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
                    </div>

                    {outroForm.watch("hasCallToAction") && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={outroForm.control}
                          name="callToActionText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Texte du CTA</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={outroForm.control}
                          name="callToActionUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL du CTA</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={closeDialogs}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        {editingItem ? 'Mettre à jour' : 'Créer'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOutros.map((outro) => (
              <Card key={outro.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Film className="h-4 w-4" />
                        {outro.name}
                      </CardTitle>
                      <CardDescription>{outro.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditOutroDialog(outro)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOutro(outro.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {outro.duration}ms
                    </span>
                    <Badge variant={outro.isActive ? "default" : "secondary"}>
                      {outro.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: outro.backgroundColor }}
                    />
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: outro.textColor }}
                    />
                    <span className="text-xs text-muted-foreground">
                      Couleurs
                    </span>
                  </div>

                  {outro.customText && (
                    <div className="text-sm">
                      <span className="font-medium">Texte:</span> {outro.customText}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    {outro.hasAnimation && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Animation
                      </Badge>
                    )}
                    {outro.hasCallToAction && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Link className="h-3 w-3" />
                        CTA
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Langues */}
        <TabsContent value="languages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Gestion des Langues</h2>
            <Dialog open={isLanguageDialogOpen} onOpenChange={setIsLanguageDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingItem(null);
                  languageForm.reset();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Langue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Modifier la Langue' : 'Nouvelle Langue'}
                  </DialogTitle>
                  <DialogDescription>
                    Ajoutez une nouvelle langue à votre application
                  </DialogDescription>
                </DialogHeader>
                <Form {...languageForm}>
                  <form onSubmit={languageForm.handleSubmit(editingItem ? handleUpdateLanguage : handleCreateLanguage)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={languageForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="fr" />
                            </FormControl>
                            <FormDescription>
                              Code de langue (ex: fr, en, es)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={languageForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Français" />
                            </FormControl>
                            <FormDescription>
                              Nom complet de la langue
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={languageForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Actif</FormLabel>
                            <FormDescription>
                              Rendre cette langue disponible
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

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={closeDialogs}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        {editingItem ? 'Mettre à jour' : 'Créer'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLanguages.map((language) => (
              <Card key={language.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {language.name}
                      </CardTitle>
                      <CardDescription>Code: {language.code}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditLanguageDialog(language)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLanguage(language.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={language.active ? "default" : "secondary"}>
                      {language.active ? "Actif" : "Inactif"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Modifié: {new Date(language.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );
}