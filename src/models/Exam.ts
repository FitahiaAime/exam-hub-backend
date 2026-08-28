export interface Exam {
    id: number;
    course_id: number;
    title: string;
    description: string | null;
    start_at: Date;
    end_at: Date;
    created_at: Date;
}

export interface CreateExamDTO {
    course_id: number;
    title: string;
    description?: string;
    start_at: string;
    end_at: string;
}

export interface UpdateExamDTO {
    course_id?: number;
    title?: string;
    description?: string;
    start_at?: string;
    end_at?: string;
}

export interface ExamWithAvailability extends Exam {
    is_available: boolean;
}
