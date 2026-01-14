import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ITournament } from '@/lib/types';

// Query Keys
export const QUERY_KEYS = {
  tournament: (id: string) => ['tournament', id],
  findTournament: (name: string) => ['findTournament', name],
} as const;

// API Base Functions
const api = {
  // Tournament by ID
  getTournament: async (id: string): Promise<ITournament> => {
    const response = await fetch(`/api/tournament/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Tournament not found');
      }
      throw new Error('Failed to fetch tournament');
    }
    return response.json();
  },

  // Create tournament
  createTournament: async (name: string, password: string): Promise<{ tournamentId: string }> => {
    const response = await fetch('/api/tournament', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create tournament');
    }

    return response.json();
  },

  // Find tournament by name with password
  findTournament: async (name: string, password: string): Promise<ITournament> => {
    const response = await fetch(`/api/tournament/find/${encodeURIComponent(name.trim())}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const data = await response.json();
      if (response.status === 404) {
        throw new Error(data.error || 'Tournament not found');
      }
      if (response.status === 401) {
        throw new Error(data.error || 'Invalid password');
      }
      throw new Error(data.error || 'Failed to fetch tournament');
    }

    return response.json();
  },

  // Add players
  addPlayers: async (id: string, players: string[]): Promise<ITournament> => {
    const response = await fetch(`/api/tournament/${id}/add-players`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to add players');
    }
    return response.json();
  },

  // Remove player
  removePlayer: async (id: string, playerId: string): Promise<ITournament> => {
    const response = await fetch(`/api/tournament/${id}/remove-player?playerId=${playerId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to remove player');
    }
    return response.json();
  },

  // Start tournament
  startTournament: async (id: string): Promise<ITournament> => {
    const response = await fetch(`/api/tournament/${id}/start`, {
      method: 'POST',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to start tournament');
    }
    return response.json();
  },

  // Record match result
  recordMatchResult: async (id: string, matchId: string, winnerTeam: 1 | 2): Promise<ITournament> => {
    const response = await fetch(`/api/tournament/${id}/match-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, winnerTeam }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to record result');
    }
    return response.json();
  },

  // Undo match result
  undoMatchResult: async (id: string, matchId: string): Promise<ITournament> => {
    const response = await fetch(`/api/tournament/${id}/match-result`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to undo result');
    }
    return response.json();
  },

  // Generate next round
  generateNextRound: async (id: string): Promise<ITournament> => {
    const response = await fetch(`/api/tournament/${id}/next-round`, {
      method: 'POST',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to generate next round');
    }
    return response.json();
  },

  // Reset tournament results
  resetResults: async (id: string): Promise<ITournament> => {
    const response = await fetch(`/api/tournament/${id}/reset-results`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to reset tournament results');
    }
    return response.json();
  },

  // Delete round
  deleteRound: async (id: string, roundNumber: number): Promise<ITournament> => {
    const response = await fetch(`/api/tournament/${id}/round?roundNumber=${roundNumber}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete round');
    }
    return response.json();
  },

  // Re-draw round
  redrawRound: async (id: string, roundNumber: number): Promise<ITournament> => {
    const response = await fetch(`/api/tournament/${id}/round?roundNumber=${roundNumber}`, {
      method: 'POST',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to re-draw round');
    }
    return response.json();
  },

  // Admin functions
  admin: {
    // Get all tournaments
    getAllTournaments: async (adminPassword: string): Promise<any[]> => {
      const response = await fetch('/api/admin/tournaments', {
        headers: {
          'X-Admin-Password': adminPassword,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch tournaments');
      }
      return response.json();
    },

    // Delete tournament
    deleteTournament: async (id: string, adminPassword: string): Promise<{ message: string }> => {
      const response = await fetch(`/api/admin/tournaments/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': adminPassword,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete tournament');
      }
      return response.json();
    },

    // Reset tournament
    resetTournament: async (id: string, adminPassword: string): Promise<ITournament> => {
      const response = await fetch(`/api/admin/tournaments/${id}`, {
        method: 'PATCH',
        headers: {
          'X-Admin-Password': adminPassword,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset tournament');
      }
      return response.json();
    },
  },
};

// Queries
export const useTournament = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.tournament(id),
    queryFn: () => api.getTournament(id),
  });
};

// Mutations
export const useAddPlayersMutation = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (players: string[]) => api.addPlayers(id, players),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.tournament(id), data);
    },
  });
};

export const useRemovePlayerMutation = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (playerId: string) => api.removePlayer(id, playerId),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.tournament(id), data);
    },
  });
};

export const useStartTournamentMutation = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.startTournament(id),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.tournament(id), data);
    },
  });
};

export const useMatchResultMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, winnerTeam }: { matchId: string; winnerTeam: 1 | 2 }) =>
      api.recordMatchResult(id, matchId, winnerTeam),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.tournament(id), data);
    },
  });
};

export const useUndoMatchResultMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => api.undoMatchResult(id, matchId),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.tournament(id), data);
    },
  });
};

export const useNextRoundMutation = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.generateNextRound(id),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.tournament(id), data);
    },
  });
};

export const useResetResultsMutation = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.resetResults(id),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.tournament(id), data);
    },
  });
};

export const useFindTournamentMutation = () => {
  return useMutation({
    mutationFn: ({ name, password }: { name: string; password: string }) => 
      api.findTournament(name, password),
  });
};

export const useCreateTournamentMutation = () => {
  return useMutation({
    mutationFn: ({ name, password }: { name: string; password: string }) => 
      api.createTournament(name, password),
  });
};

export const useDeleteRoundMutation = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (roundNumber: number) => api.deleteRound(id, roundNumber),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.tournament(id), data);
    },
  });
};

export const useRedrawRoundMutation = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (roundNumber: number) => api.redrawRound(id, roundNumber),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.tournament(id), data);
    },
  });
};

// Admin mutations
export const useAdminTournamentsQuery = (adminPassword: string) => {
  return useQuery({
    queryKey: ['admin', 'tournaments'],
    queryFn: () => api.admin.getAllTournaments(adminPassword),
    enabled: !!adminPassword,
  });
};

export const useAdminDeleteTournamentMutation = (adminPassword: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.admin.deleteTournament(id, adminPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tournaments'] });
    },
  });
};

export const useAdminResetTournamentMutation = (adminPassword: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.admin.resetTournament(id, adminPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tournaments'] });
    },
  });
};
