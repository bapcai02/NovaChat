import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Log interfaces
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context: any;
}

interface LogChannel {
  name: string;
  size: string;
  modified: string;
}

interface LogStats {
  total_logs: number;
  error_count: number;
  warning_count: number;
  info_count: number;
  channels: Record<string, number>;
}

interface LogScore {
  score: number;
  health_status: string;
  issues: string[];
  recommendations: string[];
}

// Log state interface
interface LogState {
  logs: LogEntry[];
  channels: LogChannel[];
  stats: LogStats | null;
  score: LogScore | null;
  selectedChannel: string;
  logLevelFilter: string;
  logSearchTerm: string;
  logLines: number;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: LogState = {
  logs: [],
  channels: [],
  stats: null,
  score: null,
  selectedChannel: 'api',
  logLevelFilter: 'all',
  logSearchTerm: '',
  logLines: 100,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchLogs = createAsyncThunk(
  'logs/fetchLogs',
  async (params: {
    channel?: string;
    lines?: number;
    level?: string;
    search?: string;
  }) => {
    const { channel = 'api', lines = 100, level, search } = params;
    const queryParams = new URLSearchParams({
      channel,
      lines: lines.toString(),
      ...(level && level !== 'all' && { level }),
      ...(search && { search }),
    });
    
    const response = await apiService.get(`/logs?${queryParams}`);
    return response;
  }
);

export const fetchLogChannels = createAsyncThunk(
  'logs/fetchChannels',
  async () => {
    const response = await apiService.get('/logs/channels');
    return response;
  }
);

export const fetchLogStats = createAsyncThunk(
  'logs/fetchStats',
  async () => {
    const response = await apiService.get('/logs/stats');
    return response;
  }
);

export const fetchLogScore = createAsyncThunk(
  'logs/fetchScore',
  async () => {
    const response = await apiService.get('/logs/score');
    return response;
  }
);

export const cleanupLogs = createAsyncThunk(
  'logs/cleanup',
  async (days: number = 30) => {
    const response = await apiService.post('/logs/cleanup', { days });
    return response;
  }
);

// Log slice
const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    setSelectedChannel: (state, action: PayloadAction<string>) => {
      state.selectedChannel = action.payload;
    },
    setLogLevelFilter: (state, action: PayloadAction<string>) => {
      state.logLevelFilter = action.payload;
    },
    setLogSearchTerm: (state, action: PayloadAction<string>) => {
      state.logSearchTerm = action.payload;
    },
    setLogLines: (state, action: PayloadAction<number>) => {
      state.logLines = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLogs: (state) => {
      state.logs = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch logs
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload.logs || [];
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch logs';
      });

    // Fetch channels
    builder
      .addCase(fetchLogChannels.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchLogChannels.fulfilled, (state, action) => {
        state.channels = action.payload.channels || [];
      })
      .addCase(fetchLogChannels.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch channels';
      });

    // Fetch stats
    builder
      .addCase(fetchLogStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchLogStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      })
      .addCase(fetchLogStats.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch stats';
      });

    // Fetch score
    builder
      .addCase(fetchLogScore.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchLogScore.fulfilled, (state, action) => {
        state.score = action.payload.score;
      })
      .addCase(fetchLogScore.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch score';
      });

    // Cleanup logs
    builder
      .addCase(cleanupLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cleanupLogs.fulfilled, (state) => {
        state.isLoading = false;
        // Refresh stats after cleanup
      })
      .addCase(cleanupLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to cleanup logs';
      });
  },
});

// Export actions
export const {
  setSelectedChannel,
  setLogLevelFilter,
  setLogSearchTerm,
  setLogLines,
  clearError,
  clearLogs,
} = logSlice.actions;

// Export reducer
export default logSlice.reducer;

// Selectors
export const selectLogs = (state: { logs: LogState }) => state.logs.logs;
export const selectChannels = (state: { logs: LogState }) => state.logs.channels;
export const selectLogStats = (state: { logs: LogState }) => state.logs.stats;
export const selectLogScore = (state: { logs: LogState }) => state.logs.score;
export const selectSelectedChannel = (state: { logs: LogState }) => state.logs.selectedChannel;
export const selectLogLevelFilter = (state: { logs: LogState }) => state.logs.logLevelFilter;
export const selectLogSearchTerm = (state: { logs: LogState }) => state.logs.logSearchTerm;
export const selectLogLines = (state: { logs: LogState }) => state.logs.logLines;
export const selectLogsLoading = (state: { logs: LogState }) => state.logs.isLoading;
export const selectLogsError = (state: { logs: LogState }) => state.logs.error;
