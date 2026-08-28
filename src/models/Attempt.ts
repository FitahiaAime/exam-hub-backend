export interface Attempt {
    id: number;
    exam_id: number;
    student_id: number;
    score: number;
    submitted_at: Date;
}

export interface CreateAttemptDTO {
    exam_id: number;
    student_id: number;
    score: number;
}

export interface AnswerSubmission {
    question_id: number;
    choice_id: number | null;
}
