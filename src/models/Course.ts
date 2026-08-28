export interface Course {
    id: number;
    code: string;
    name: string;
    description: string | null;
    created_at: Date;
}

export interface CreateCourseDTO {
    code: string;
    name: string;
    description?: string;
}

export interface UpdateCourseDTO {
    code?: string;
    name?: string;
    description?: string;
}
