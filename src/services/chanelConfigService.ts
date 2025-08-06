import api from "./api";

export interface ApiChannelConfig {
    name: string;
    languageId: number;
    introId: number;
    outroId: number;
    mediaId: number;
}

export interface ChannelConfigResponse {
    data: ApiChannelConfig[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

const channelConfigService = {
    getAllChannelConfigs: async (): Promise<ApiChannelConfig[]> => {
        const response = await api.get<ChannelConfigResponse>(`/api/operator/channel-configs`);
        return response.data;
    },
    createChannelConfig: async (channelConfig: ChannelConfigResponse): Promise<ApiChannelConfig> => {
        const response = await api.post<ApiChannelConfig>(`/api/operator/channel-configs`, channelConfig);
        return response.data;
    },
}