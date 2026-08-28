export interface Choice {
    id: number;
    question_id: number;
    label: string;
    is_correct: boolean;
    created_at: Date;
}

export interface CreateChoiceDTO {
    label: string;
    is_correct: boolean;
}