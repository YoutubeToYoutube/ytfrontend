import { useState, useCallback } from 'react';
import userService, { type ApiUser, type CreateUserRequest, type UpdateUserRequest } from '@/services/userService';
import { useAlerts } from '@/hooks/useAlerts';
import type { ApiError } from '@/types/errors';

export const useUsers = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlerts();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await userService.getAllUsers();
      setUsers(userData);
      return userData;
    } catch (error: unknown) {
      console.error("Failed to load users:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Impossible de charger les utilisateurs.";
      showAlert('error', 'Erreur', errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  const createUser = useCallback(async (userData: CreateUserRequest) => {
    try {
      const newUser = await userService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      showAlert('success', 'Utilisateur créé', 'L\'utilisateur a été créé avec succès.');
      return newUser;
    } catch (error: unknown) {
      console.error("Failed to create user:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Impossible de créer l'utilisateur.";
      showAlert('error', 'Erreur', errorMessage);
      throw error;
    }
  }, [showAlert]);

  const updateUser = useCallback(async (userId: number, userData: UpdateUserRequest) => {
    try {
      const updatedUser = await userService.updateUser(userId, userData);
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user));
      showAlert('success', 'Utilisateur modifié', 'L\'utilisateur a été modifié avec succès.');
      return updatedUser;
    } catch (error: unknown) {
      console.error("Failed to update user:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Impossible de modifier l'utilisateur.";
      showAlert('error', 'Erreur', errorMessage);
      throw error;
    }
  }, [showAlert]);

  const deleteUser = useCallback(async (userId: number) => {
    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      showAlert('success', 'Utilisateur supprimé', 'L\'utilisateur a été supprimé avec succès.');
    } catch (error: unknown) {
      console.error("Failed to delete user:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Impossible de supprimer l'utilisateur.";
      showAlert('error', 'Erreur', errorMessage);
      throw error;
    }
  }, [showAlert]);

  return {
    users,
    loading,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}; 