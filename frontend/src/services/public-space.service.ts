import axios from 'axios';
import authHeader from './auth-header';
import type {
    PublicSpace,
    CreatePublicSpaceDTO,
    UpdatePublicSpaceDTO,
} from '@/types/publicSpace.type';

const API_URL = `${import.meta.env.VITE_API_URL}/public-space`;

interface ApiResponse<T> {
    success: boolean;
    data: T;
    count?: number;
    message?: string;
}

const getAllPublicSpaces = async (): Promise<PublicSpace[]> => {
    const response = await axios.get<ApiResponse<PublicSpace[]>>(`${API_URL}/list`);
    return response.data.data;
};

const createPublicSpace = async (data: CreatePublicSpaceDTO): Promise<PublicSpace> => {
    const response = await axios.post<ApiResponse<PublicSpace>>(`${API_URL}/create`, data, {
        headers: authHeader(),
    });
    return response.data.data;
};

const updatePublicSpace = async (
    id: string,
    data: UpdatePublicSpaceDTO,
): Promise<PublicSpace> => {
    const response = await axios.patch<ApiResponse<PublicSpace>>(
        `${API_URL}/update/${id}`,
        data,
        { headers: authHeader() },
    );
    return response.data.data;
};

const deletePublicSpace = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/delete/${id}`, { headers: authHeader() });
};

const searchPublicSpaces = async (name: string): Promise<PublicSpace[]> => {
    const response = await axios.get<ApiResponse<PublicSpace[]>>(
        `${API_URL}/search/${encodeURIComponent(name)}`,
    );
    return response.data.data;
};

const publicSpaceService = {
    getAllPublicSpaces,
    createPublicSpace,
    updatePublicSpace,
    deletePublicSpace,
    searchPublicSpaces,
};

export default publicSpaceService;
