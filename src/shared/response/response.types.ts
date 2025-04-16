export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
    meta?: {
        [key: string]: unknown;
    };
}

declare global {
    namespace Express {
        interface Response {
            success<T>(data?: T, message?: string, meta?: { [key: string]: unknown }): Response;
            error(message?: string, statusCode?: number): Response;
        }
    }
} 