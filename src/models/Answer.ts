export interface Answer {
    id: number;
    attempt_id: number;
    question_id: number;
    choice_id: number | null;
    created_at: Date;
}

export interface CreateAnswerDTO {
    attempt_id: number;
    question_id: number;
    choice_id: number | null;
}
